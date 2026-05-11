import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex flex-col items-center mb-6 text-center animate-slide-in-up stagger-1">
      <div class="mb-3 bg-primary-container dark:bg-slate-800 p-3 rounded-xl shadow-lg transition-colors">
        <span class="material-symbols-outlined text-white text-3xl">account_balance</span>
      </div>
      <h1 class="text-2xl font-bold text-primary dark:text-white tracking-tight mb-2 transition-colors">TrustCircle</h1>
      <p class="text-sm text-on-surface-variant dark:text-slate-400 max-w-[320px] transition-colors">
        Secure financial governance for your community.
      </p>
    </div>

    <!-- Signup Card -->
    <div class="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 dark:border-slate-800 shadow-level-2 animate-slide-in-up stagger-2 transition-colors w-full">
      <div class="mb-5 text-center">
        <h2 class="text-xl font-bold text-primary dark:text-white transition-colors mb-1">Create account</h2>
        <p class="text-sm text-on-surface-variant dark:text-slate-400 transition-colors">Join over 5,000 committees managing funds securely.</p>
      </div>

      <!-- Social Auth Options -->
      <div class="grid grid-cols-2 gap-3 mb-5">
        <button type="button" (click)="signInWithGoogle()" [disabled]="loading()"
                class="flex items-center justify-center gap-2 px-3 py-2.5 border border-outline-variant/50 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-on-surface dark:text-white disabled:opacity-50">
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button type="button" (click)="signInWithApple()" [disabled]="loading()"
                class="flex items-center justify-center gap-2 px-3 py-2.5 border border-outline-variant/50 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-on-surface dark:text-white disabled:opacity-50">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          Apple
        </button>
      </div>

      <!-- Divider -->
      <div class="relative flex items-center mb-5">
        <div class="flex-grow border-t border-outline-variant/30 dark:border-slate-800 transition-colors"></div>
        <span class="flex-shrink mx-3 text-[11px] font-semibold text-outline dark:text-slate-500 uppercase tracking-wider transition-colors">OR CONTINUE WITH EMAIL</span>
        <div class="flex-grow border-t border-outline-variant/30 dark:border-slate-800 transition-colors"></div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMsg()" class="flex items-start gap-2 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error mb-4">
        <span class="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
        <span>{{ errorMsg() }}</span>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMsg()" class="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 mb-4">
        <span class="material-symbols-outlined text-[18px] mt-0.5 shrink-0">check_circle</span>
        <span>{{ successMsg() }}</span>
      </div>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">

        <!-- Full Name Field -->
        <div class="space-y-1">
          <label for="fullName" class="font-label-sm text-on-surface-variant dark:text-slate-400 ml-1 transition-colors">Full Name</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-outline dark:text-slate-500 text-[20px]">person</span>
            </div>
            <input type="text" id="fullName" formControlName="fullName" placeholder="John Doe"
                   class="input-field pl-10 py-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700 transition-colors">
          </div>
          <p *ngIf="signupForm.get('fullName')?.touched && signupForm.get('fullName')?.invalid"
             class="text-xs text-error mt-1 ml-1">Full name is required.</p>
        </div>

        <!-- Email Field -->
        <div class="space-y-1">
          <label for="email" class="font-label-sm text-on-surface-variant dark:text-slate-400 ml-1 transition-colors">Email Address</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-outline dark:text-slate-500 text-[20px]">mail</span>
            </div>
            <input type="email" id="email" formControlName="email" placeholder="name@example.com"
                   class="input-field pl-10 py-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700 transition-colors">
          </div>
          <p *ngIf="signupForm.get('email')?.touched && signupForm.get('email')?.invalid"
             class="text-xs text-error mt-1 ml-1">Enter a valid email address.</p>
        </div>

        <!-- Password Field -->
        <div class="space-y-1">
          <label for="password" class="font-label-sm text-on-surface-variant dark:text-slate-400 ml-1 transition-colors">Password</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-outline dark:text-slate-500 text-[20px]">lock</span>
            </div>
            <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" placeholder="••••••••"
                   class="input-field pl-10 pr-10 py-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700 transition-colors">
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-outline hover:text-primary transition-colors" (click)="togglePassword()">
              <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </div>
          </div>
          <p class="font-label-sm text-[11px] text-outline dark:text-slate-500 mt-1 ml-1 transition-colors">Must be at least 8 characters with a symbol.</p>
          <p *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.hasError('minlength')"
             class="text-xs text-error mt-1 ml-1">Password must be at least 8 characters.</p>
        </div>

        <!-- Terms & Conditions -->
        <div class="flex items-start gap-3 mt-4">
          <div class="flex items-center h-5 mt-1">
            <input id="terms" type="checkbox" formControlName="terms"
                   class="w-4 h-4 text-secondary bg-white dark:bg-slate-800 border-outline-variant dark:border-slate-600 rounded focus:ring-secondary cursor-pointer transition-colors">
          </div>
          <label for="terms" class="text-[12px] text-on-surface-variant dark:text-slate-400 transition-colors leading-tight">
            I agree to the <a href="#" class="text-primary dark:text-white font-semibold hover:underline">Terms of Service</a> and <a href="#" class="text-primary dark:text-white font-semibold hover:underline">Privacy Policy</a>.
          </label>
        </div>
        <p *ngIf="signupForm.get('terms')?.touched && signupForm.get('terms')?.invalid"
           class="text-xs text-error -mt-2 ml-1">You must agree to the terms to continue.</p>

        <!-- Submit Button -->
        <button type="submit" [disabled]="signupForm.invalid || loading()"
                class="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
          <span *ngIf="loading()" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span *ngIf="!loading()">Create Account</span>
          <span *ngIf="loading()">Creating account...</span>
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-[12px] text-on-surface-variant dark:text-slate-400 transition-colors">
          Already have an account?
          <a routerLink="/login" class="text-primary dark:text-white font-bold hover:underline ml-1">Log In</a>
        </p>
      </div>
    </div>
  `
})
export class SignupComponent {
  readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  signupForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    terms: [false, Validators.requiredTrue]
  });

  showPassword = false;
  loading = signal(false);
  errorMsg = signal<string | undefined>(undefined);
  successMsg = signal<string | undefined>(undefined);

  togglePassword() { this.showPassword = !this.showPassword; }

  async onSubmit() {
    this.signupForm.markAllAsTouched();
    if (!this.signupForm.valid) return;

    const { email, password, fullName } = this.signupForm.getRawValue();
    this.loading.set(true);
    this.errorMsg.set(undefined);
    this.successMsg.set(undefined);

    try {
      await this.authService.signup(email, password, fullName ?? '');
      this.successMsg.set('Account created! Redirecting to KYC setup...');
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        this.errorMsg.set('An account with this email already exists. Try logging in.');
      } else if (code === 'auth/invalid-email') {
        this.errorMsg.set('The email address is not valid.');
      } else if (code === 'auth/weak-password') {
        this.errorMsg.set('Password is too weak. Use at least 8 characters with a symbol.');
      } else if (code === 'auth/network-request-failed') {
        this.errorMsg.set('Network error. Please check your connection and try again.');
      } else {
        this.errorMsg.set(e?.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async signInWithGoogle() {
    this.loading.set(true);
    this.errorMsg.set(undefined);
    try {
      await this.authService.signInWithGoogle();
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        this.errorMsg.set(e?.message ?? 'Google sign-in failed. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async signInWithApple() {
    this.loading.set(true);
    this.errorMsg.set(undefined);
    try {
      await this.authService.signInWithApple();
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        this.errorMsg.set(e?.message ?? 'Apple sign-in failed. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
