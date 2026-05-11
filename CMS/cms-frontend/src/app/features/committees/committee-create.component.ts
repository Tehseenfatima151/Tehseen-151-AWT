import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommitteesService } from '../../core/services/committees.service';
import { AuthService } from '../../core/services/auth.service';
import { isFirebaseConfigured } from '../../../environments/environment';

@Component({
  selector: 'app-committee-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 class="font-h1 text-primary dark:text-white">Create committee</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Pool capital, automate contributions, schedule randomized payouts — creator earns the inaugural distribution.
        </p>
      </div>

      <form class="space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8" [formGroup]="form" (ngSubmit)="submit()">
        <label class="block space-y-2">
          <span class="text-xs uppercase text-slate-500 font-semibold">Name</span>
          <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="name" />
        </label>
        <label class="block space-y-2">
          <span class="text-xs uppercase text-slate-500 font-semibold">Description</span>
          <textarea rows="3" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="description"></textarea>
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block space-y-2">
            <span class="text-xs uppercase text-slate-500 font-semibold">Monthly contribution ($)</span>
            <input type="number" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="contributionAmount" />
          </label>
          <label class="block space-y-2">
            <span class="text-xs uppercase text-slate-500 font-semibold">Max members</span>
            <input type="number" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="maxMembers" />
          </label>
        </div>
        <button type="submit" class="btn-primary w-full py-4" [disabled]="form.invalid || loading()">{{ loading() ? 'Saving…' : 'Spin up committee' }}</button>
        <p *ngIf="info()" class="text-sm text-secondary">{{ info() }}</p>
        <p *ngIf="error()" class="text-sm text-error">{{ error() }}</p>
      </form>
    </div>
  `,
})
export class CommitteeCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly committees = inject(CommitteesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    contributionAmount: [500, [Validators.required, Validators.min(50)]],
    maxMembers: [12, [Validators.required, Validators.min(2), Validators.max(100)]],
  });

  loading = signal(false);
  info = signal<string | undefined>(undefined);
  error = signal<string | undefined>(undefined);

  async submit() {
    if (this.form.invalid) {
      return;
    }
    const uid = this.auth.getUid();
    if (!uid) {
      this.error.set('Not signed in');
      return;
    }
    if (!isFirebaseConfigured()) {
      this.info.set('Demo mode saved locally — connecting Firebase persists committees.');
      return;
    }
    this.loading.set(true);
    try {
      const res = await this.committees.createCommittee(uid, this.form.getRawValue());
      this.info.set(`Invite code · ${res.inviteCode}`);
      await this.router.navigate(['/committees', res.id]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unable to create committee');
    } finally {
      this.loading.set(false);
    }
  }
}
