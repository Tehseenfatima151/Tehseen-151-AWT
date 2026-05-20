// ============================================================
// VoteSphere — Auth Store (Supabase-powered)
// Replaces all mock auth with real Supabase Auth calls.
// Interface is IDENTICAL to the mock version — no page breaks.
// ============================================================

import { create } from 'zustand';
import type { User, SignupData, LoginData } from '../types';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean; // true while session is being restored
  error: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  pendingEmail: string | null;
  tempSignupData: SignupData | null;
  currentOTP: string | null;
  otpExpiry: number | null;
  // MFA state
  mfaFactorId: string | null;
  mfaChallengeId: string | null;
  // Actions
  initAuth: () => Promise<void>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<boolean>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (otp: string, email?: string, type?: 'signup'|'email'|'recovery'|'magiclink') => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  clearError: () => void;
  updateUser: (data: Partial<User>) => void;
  // MFA setup
  enrollMFA: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>;
  unenrollMFA: (factorId: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user:            null,
  isAuthenticated: false,
  isLoading:       false,
  isInitializing:  true,
  error:           null,
  otpSent:         false,
  otpVerified:     false,
  pendingEmail:    null,
  tempSignupData:  null,
  currentOTP:      null,
  otpExpiry:       null,
  mfaFactorId:     null,
  mfaChallengeId:  null,

  // ── Restore session on app boot ────────────────────────────
  initAuth: async () => {
    set({ isInitializing: true });
    try {
      const user = await authService.restoreSession();
      set({ user, isAuthenticated: !!user, isInitializing: false });
    } catch {
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }

    // Listen to Supabase auth changes (token refresh, signout from other tabs)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({ user: null, isAuthenticated: false });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const user = await authService.restoreSession();
        if (user) set({ user, isAuthenticated: true });
      }
    });
  },

  // ── Login ──────────────────────────────────────────────────
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    const { user, error } = await authService.signIn({ email, password });
    if (error || !user) {
      set({ isLoading: false, error: error ?? 'Login failed.' });
      return false;
    }
    set({ user, isAuthenticated: true, isLoading: false, error: null });
    return true;
  },

  // ── Logout ─────────────────────────────────────────────────
  logout: async () => {
    const { user } = get();
    set({ isLoading: true });
    await authService.signOut(user?.id, user?.email);
    set({ user: null, isAuthenticated: false, isLoading: false, error: null, otpSent: false, otpVerified: false });
  },

  // ── Signup ─────────────────────────────────────────────────
  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });
    
    // Custom EmailJS Flow
    const otp = emailService.generateOTP();
    const success = await emailService.sendOTP(data.email, otp, data.name);
    
    if (!success) {
      set({ isLoading: false, error: 'Failed to send verification email. Please check your connection and try again.' });
      return false;
    }

    set({ 
      isLoading: false, 
      pendingEmail: data.email, 
      otpSent: true,
      tempSignupData: data,
      currentOTP: otp,
      otpExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    return true;
  },

  // ── Send OTP ───────────────────────────────────────────────
  sendOTP: async (email: string) => {
    set({ isLoading: true });
    const { tempSignupData } = get();
    
    // If we have tempSignupData, it's a signup OTP resend
    if (tempSignupData && tempSignupData.email === email) {
      const otp = emailService.generateOTP();
      const success = await emailService.sendOTP(email, otp, tempSignupData.name);
      if (success) {
        set({ isLoading: false, otpSent: true, currentOTP: otp, otpExpiry: Date.now() + 5 * 60 * 1000 });
      } else {
        set({ isLoading: false, error: 'Failed to resend verification code.' });
      }
      return;
    }
    
    // Otherwise fallback to native Supabase (magic link / auth)
    await authService.sendOtp(email);
    set({ isLoading: false, otpSent: true, pendingEmail: email });
  },

  // ── Verify OTP ─────────────────────────────────────────────
  verifyOTP: async (otp: string, passedEmail?: string, type: 'signup'|'email'|'recovery'|'magiclink' = 'signup') => {
    set({ isLoading: true, error: null });
    
    // Custom EmailJS Flow for Signup
    if (type === 'signup') {
      const { currentOTP, otpExpiry, tempSignupData } = get();
      
      if (!currentOTP || !tempSignupData) {
        set({ isLoading: false, error: 'Session expired. Please sign up again.' });
        return false;
      }
      
      if (Date.now() > (otpExpiry || 0)) {
        set({ isLoading: false, error: 'Verification code has expired. Please request a new one.' });
        return false;
      }
      
      // Verify against the actual generated OTP
      if (otp !== currentOTP) {
        set({ isLoading: false, error: 'Invalid verification code.' });
        return false;
      }
      
      // OTP is valid, now register the user in Supabase
      const { success, error } = await authService.signUp(tempSignupData);
      
      if (!success || error) {
        set({ isLoading: false, error: error ?? 'Failed to create database record. Please try again.' });
        return false;
      }
      
      // If we got here, account is created successfully
      set({ 
        isLoading: false, 
        otpVerified: true,
        currentOTP: null,
        otpExpiry: null,
        tempSignupData: null
      });
      return true;
    }

    // Native Supabase verification for other flows (recovery, magic link)
    const email = passedEmail || get().pendingEmail;
    if (!email) { set({ isLoading: false, error: 'Email is required for verification. Please try again.' }); return false; }
    const { success, error } = await authService.verifyOtp(email, otp, type);
    if (!success) { set({ isLoading: false, error: error ?? 'Invalid code.' }); return false; }
    
    // If successfully verified, refresh the session if one exists
    const user = await authService.restoreSession();
    if (user) set({ user, isAuthenticated: true });
    
    set({ isLoading: false, otpVerified: true });
    return true;
  },

  // ── Verify 2FA ─────────────────────────────────────────────
  verify2FA: async (code: string) => {
    set({ isLoading: true });
    const { mfaFactorId, mfaChallengeId } = get();
    if (!mfaFactorId || !mfaChallengeId) {
      set({ isLoading: false, error: '2FA session expired. Please log in again.' });
      return false;
    }
    const { success, error } = await authService.verifyMFA(mfaFactorId, mfaChallengeId, code);
    if (!success) { set({ isLoading: false, error: error ?? 'Invalid 2FA code.' }); return false; }
    set({ isLoading: false });
    return true;
  },

  // ── Forgot Password ────────────────────────────────────────
  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    const { success, error } = await authService.sendPasswordReset(email);
    set({ isLoading: false, pendingEmail: email, error: error ?? null });
    return success;
  },

  // ── Reset Password ─────────────────────────────────────────
  resetPassword: async (_token: string, password: string) => {
    set({ isLoading: true });
    const { success, error } = await authService.updatePassword(password);
    set({ isLoading: false, error: error ?? null });
    return success;
  },

  clearError: () => set({ error: null }),

  updateUser: (data: Partial<User>) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...data } });
  },

  // ── MFA Enrollment ─────────────────────────────────────────
  enrollMFA: async () => {
    const result = await authService.enrollMFA();
    if (result) set({ mfaFactorId: result.factorId });
    return result;
  },

  unenrollMFA: async (factorId: string) => {
    const { success } = await authService.unenrollMFA(factorId);
    if (success) {
      get().updateUser({ is2FAEnabled: false });
    }
    return success;
  },
}));
