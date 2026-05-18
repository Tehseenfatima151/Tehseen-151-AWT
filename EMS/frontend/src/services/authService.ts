// ============================================================
// VoteSphere — Authentication Service
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase, handleSupabaseError } from '../lib/supabase';
import type { SignupData, LoginData, User, UserRole } from '../types';
import { auditService } from './auditService';

function profileToUser(p: any): User {
  return {
    id:           p.id,
    name:         p.name || 'Unknown User',
    email:        p.email || '',
    phone:        p.phone ?? '',
    role:         p.role as UserRole,
    avatar:       p.avatar_url ?? undefined,
    isVerified:   p.is_verified === true,
    is2FAEnabled: p.is_2fa_enabled === true,
    isBlocked:    p.is_blocked ?? false,
    organization: p.organization ?? undefined,
    createdAt:    p.created_at,
    lastLogin:    p.last_login ?? undefined,
  };
}

const sb = supabase as any;

export const authService = {
  async signUp(data: SignupData): Promise<{ success: boolean; error?: string }> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, phone: data.phone, role: data.role, organization: data.organization ?? null },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });
    if (error) {
      // Provide a friendlier message for rate limits
      if (error.message.toLowerCase().includes('rate limit')) {
        return { success: false, error: 'Too many signup attempts. Please wait a few minutes or use a different email.' };
      }
      return { success: false, error: error.message };
    }

    // If an election_creator signs up, immediately create a pending access request
    // so the admin can see it in the Pending Requests tab
    if (data.role === 'election_creator' && authData?.user?.id) {
      try {
        await sb.from('election_requests').insert({
          creator_id:   authData.user.id,
          organization: data.organization ?? '',
          purpose:      data.purpose ?? 'Platform access request',
          status:       'pending',
        });
      } catch {
        // Non-fatal: request may appear after email confirmation via trigger
      }
    }

    await auditService.log({ action: 'signup', description: `New ${data.role} account: ${data.email}`, userEmail: data.email, userRole: data.role });
    return { success: true };
  },

  async signIn(data: LoginData): Promise<{ user: User | null; error?: string }> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { user: null, error: 'Email not confirmed. Please check your inbox or use OTP verification.' };
      }
      await auditService.log({ action: 'login_failed', description: `Failed login: ${data.email}`, userEmail: data.email });
      return { user: null, error: error.message };
    }
    if (!authData.user) return { user: null, error: 'Authentication failed.' };

    const { data: profile, error: profileError } = await sb.from('profiles').select('*').eq('id', authData.user.id).single();
    if (profileError || !profile) return { user: null, error: 'Could not load user profile.' };
    if (profile.is_blocked) { await supabase.auth.signOut(); return { user: null, error: 'Your account has been blocked. Contact support.' }; }

    await sb.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id);
    await auditService.log({ action: 'login', userId: authData.user.id, userEmail: profile.email, userRole: profile.role, description: `Login: ${profile.email}` });
    return { user: profileToUser(profile) };
  },

  async signOut(userId?: string, userEmail?: string): Promise<void> {
    if (userId) await auditService.log({ action: 'logout', userId, userEmail, description: `Signed out: ${userEmail ?? userId}` });
    await supabase.auth.signOut();
  },

  async restoreSession(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
    if (!profile || profile.is_blocked) return null;
    return profileToUser(profile);
  },

  async sendOtp(email: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async verifyOtp(email: string, token: string, type: 'signup' | 'email' | 'recovery' | 'magiclink' = 'signup'): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.verifyOtp({ email, token, type });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined)         dbUpdates.name = updates.name;
    if (updates.phone !== undefined)        dbUpdates.phone = updates.phone;
    if (updates.organization !== undefined) dbUpdates.organization = updates.organization;
    if (updates.avatar !== undefined)       dbUpdates.avatar_url = updates.avatar;
    const { error } = await sb.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async enrollMFA(): Promise<{ qrCode: string; secret: string; factorId: string } | null> {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error || !data) return null;
    return { qrCode: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
  },

  async createMFAChallenge(factorId: string): Promise<string | null> {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error || !data) return null;
    return data.id;
  },

  async verifyMFA(factorId: string, challengeId: string, code: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async unenrollMFA(factorId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return { success: false, error: error.message };
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (uid) await sb.from('profiles').update({ is_2fa_enabled: false }).eq('id', uid);
    return { success: true };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (!session?.user) { callback(null); return; }
      const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
      callback(profile && !profile.is_blocked ? profileToUser(profile) : null);
    });
  },

  async getAllProfiles(): Promise<User[]> {
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getAllProfiles');
    return (data ?? []).map(profileToUser);
  },

  async setUserBlocked(userId: string, blocked: boolean): Promise<void> {
    const { error } = await sb.from('profiles').update({ is_blocked: blocked }).eq('id', userId);
    if (error) handleSupabaseError(error, 'setUserBlocked');
  },
};
