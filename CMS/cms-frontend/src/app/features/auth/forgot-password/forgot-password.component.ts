import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { isFirebaseConfigured } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex flex-col items-center mb-6 text-center animate-slide-in-up stagger-1">
      <div class="mb-3 bg-primary-container dark:bg-slate-800 p-3 rounded-xl shadow-lg transition-colors">
        <span class="material-symbols-outlined text-white text-3xl">lock_reset</span>
      </div>
      <h1 class="text-2xl font-bold text-primary dark:text-white tracking-tight mb-2 transition-colors">Reset Password</h1>
      <p class="text-sm text-on-surface-variant dark:text-slate-400 max-w-[320px] transition-colors">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>

    <!-- Forgot Password Card -->
    <div class="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 dark:border-slate-800 shadow-level-2 animate-slide-in-up stagger-2 transition-colors w-full">
      <form *ngIf="!submitted" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5">
        
        <!-- Email Field -->
        <div class="space-y-1">
          <label for="email" class="font-label-sm text-on-surface-variant dark:text-slate-400 ml-1 transition-colors">Email Address</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-outline dark:text-slate-500 text-[20px]">mail</span>
            </div>
            <input type="email" id="email" formControlName="email" placeholder="name@organization.com"
                   class="input-field pl-10 py-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700 transition-colors">
          </div>
        </div>

        <p *ngIf="resetProblem" class="text-sm text-error text-center">{{ resetProblem }}</p>

        <!-- Submit Button -->
        <button type="submit" [disabled]="resetForm.invalid"
                class="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-2">
          Send Reset Link
          <span class="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>

      <!-- Success Message -->
      <div *ngIf="submitted" class="text-center py-4 space-y-4 animate-scale-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
          <span class="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h3 class="text-xl font-bold text-on-surface dark:text-white">Check your email</h3>
        <p class="text-sm text-on-surface-variant dark:text-slate-400">
          We've sent password reset instructions to your email address.
        </p>
      </div>

      <div class="mt-4 text-center">
        <p class="text-[12px] text-on-surface-variant dark:text-slate-400 transition-colors">
          Remember your password? 
          <a routerLink="/login" class="text-primary dark:text-white font-bold hover:underline ml-1">Log In</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  submitted = false;
  resetProblem?: string;

  resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit() {
    if (!this.resetForm.valid) {
      return;
    }
    const email = this.resetForm.value.email as string;
    try {
      if (isFirebaseConfigured()) {
        await this.auth.forgotPassword(email);
      }
      this.submitted = true;
    } catch (e) {
      this.resetProblem = e instanceof Error ? e.message : 'Unable to send email';
    }
  }
}
