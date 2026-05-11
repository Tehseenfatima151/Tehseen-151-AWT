import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-kyc-financial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-2 border border-outline-variant/30 dark:border-slate-800 p-8 md:p-10">
      <div class="mb-8 space-y-1">
        <h2 class="font-h3 text-primary dark:text-white">Financial profile</h2>
        <p class="text-sm text-on-surface-variant dark:text-slate-400">
          Used for contribution limits, payout routing, and anti-fraud monitoring.
        </p>
      </div>

      <form class="space-y-6" [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label class="space-y-2 block md:col-span-2">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Bank name</span>
            <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="bankName" />
          </label>
          <label class="space-y-2 block md:col-span-2">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">IBAN / Account number</span>
            <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="ibanOrAccount" />
          </label>
          <label class="space-y-2 block">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Monthly income</span>
            <input type="number" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="monthlyIncome" />
          </label>
          <label class="space-y-2 block">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Employment status</span>
            <select class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="employmentStatus">
              <option value="" disabled>Select</option>
              <option>Employed</option>
              <option>Self-employed</option>
              <option>Business owner</option>
              <option>Retired</option>
              <option>Student</option>
              <option>Unemployed</option>
            </select>
          </label>
          <label class="space-y-2 block md:col-span-2">
            <span class="font-label-sm text-on-surface-variant dark:text-slate-400">Preferred payout method</span>
            <select class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="paymentMethod">
              <option value="" disabled>Select</option>
              <option>Bank transfer</option>
              <option>Mobile wallet</option>
              <option>Cash pickup</option>
            </select>
          </label>
        </div>

        <p *ngIf="error" class="text-sm text-error">{{ error }}</p>

        <div class="pt-6 border-t border-outline-variant/30 dark:border-slate-800 flex justify-between items-center">
          <button type="button" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm" routerLink="/kyc/personal">Back</button>
          <button type="submit" class="btn-primary px-8 py-3 rounded-xl" [disabled]="form.invalid || busy">Continue</button>
        </div>
      </form>
    </section>
  `,
})
export class KycFinancialComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    bankName: ['', Validators.required],
    ibanOrAccount: ['', Validators.required],
    monthlyIncome: [0, [Validators.required, Validators.min(0)]],
    employmentStatus: ['', Validators.required],
    paymentMethod: ['', Validators.required],
  });

  busy = false;
  error?: string;

  constructor() {
    const fin = this.auth.firestoreUser()?.financial ?? this.auth.currentUser()?.financial;
    if (fin) {
      this.form.patchValue(fin);
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
      await this.auth.saveKycFinancial(uid, this.form.getRawValue());
      await this.router.navigateByUrl('/kyc/identity');
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'Unable to save';
    } finally {
      this.busy = false;
    }
  }
}
