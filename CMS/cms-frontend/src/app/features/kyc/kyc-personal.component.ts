import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-kyc-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-2 border border-outline-variant/30 dark:border-slate-800 p-8 md:p-10">
      <div class="mb-8 space-y-1">
        <h2 class="font-h3 text-primary dark:text-white">Personal information</h2>
        <p class="text-sm text-on-surface-variant dark:text-slate-400">
          Must match legal documents exactly — speeds up payouts and dispute resolution.
        </p>
      </div>

      <form class="space-y-6" [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label class="space-y-2 block">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">First name</span>
            <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="firstName" />
          </label>
          <label class="space-y-2 block">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Last name</span>
            <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="lastName" />
          </label>
          <label class="space-y-2 block md:col-span-2">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Phone</span>
            <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="phone" placeholder="+971 ..." />
          </label>
          <label class="space-y-2 block md:col-span-2">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Date of birth</span>
            <input type="date" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="dob" />
          </label>
        </div>

        <p *ngIf="error" class="text-sm text-error">{{ error }}</p>

        <div class="pt-6 border-t border-outline-variant/30 dark:border-slate-800 flex justify-between items-center">
          <span class="text-xs text-on-surface-variant dark:text-slate-500">Step 1 of 4</span>
          <button type="submit" class="btn-primary px-8 py-3 rounded-xl" [disabled]="form.invalid || busy">
            Continue
          </button>
        </div>
      </form>
    </section>
  `,
})
export class KycPersonalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    dob: ['', Validators.required],
  });

  busy = false;
  error?: string;

  constructor() {
    const p = this.auth.firestoreUser()?.personal ?? this.auth.currentUser()?.personal;
    if (p) {
      this.form.patchValue(p);
    }
  }

  async submit() {
    if (this.form.invalid || this.busy) {
      return;
    }
    this.busy = true;
    this.error = undefined;
    try {
      const uid = this.auth.getUid();
      if (!uid) {
        throw new Error('Not signed in');
      }
      await this.auth.saveKycPersonal(uid, this.form.getRawValue());
      await this.router.navigateByUrl('/kyc/financial');
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'Unable to save';
    } finally {
      this.busy = false;
    }
  }
}
