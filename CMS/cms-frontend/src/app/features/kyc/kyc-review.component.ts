import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-kyc-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="space-y-6">
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/30 dark:border-slate-800 p-8 space-y-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 class="font-h3 text-primary dark:text-white">Review & submit</h2>
            <p class="text-sm text-on-surface-variant dark:text-slate-400 mt-1">
              Compliance will verify within 24h. You can use core features while status is <strong>Submitted</strong>.
            </p>
          </div>
          <div class="px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs font-bold uppercase tracking-wide">
            Status: {{ statusLabel() }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article class="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p class="text-[11px] uppercase text-slate-400 font-bold mb-2">Personal</p>
            <p class="text-sm text-primary dark:text-white font-semibold">
              {{ personal()?.firstName }} {{ personal()?.lastName }}
            </p>
            <p class="text-xs text-slate-500">{{ personal()?.phone }}</p>
            <p class="text-xs text-slate-500">DOB {{ personal()?.dob }}</p>
          </article>
          <article class="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p class="text-[11px] uppercase text-slate-400 font-bold mb-2">Financial</p>
            <p class="text-sm text-primary dark:text-white font-semibold">{{ financial()?.bankName }}</p>
            <p class="text-xs text-slate-500">{{ financial()?.ibanOrAccount }}</p>
            <p class="text-xs text-slate-500">Income {{ financial()?.monthlyIncome | currency }}</p>
            <p class="text-xs text-slate-500">{{ financial()?.employmentStatus }} • {{ financial()?.paymentMethod }}</p>
          </article>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div *ngFor="let card of docCards" class="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div class="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img *ngIf="card.url" [src]="card.url" class="w-full h-full object-cover" [alt]="card.title" />
              <span *ngIf="!card.url" class="material-symbols-outlined text-slate-400 text-4xl">image</span>
            </div>
            <div class="p-3 text-xs font-bold text-primary dark:text-white">{{ card.title }}</div>
          </div>
        </div>

        <p *ngIf="error" class="text-sm text-error">{{ error }}</p>

        <div class="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button type="button" class="text-sm underline text-on-surface-variant" routerLink="/kyc/identity">Back</button>
          <button type="button" class="btn-primary px-8 py-3 rounded-xl" [disabled]="busy" (click)="submit()">
            Submit KYC package
          </button>
        </div>
      </div>
    </section>
  `,
})
export class KycReviewComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  busy = false;
  error?: string;

  readonly personal = computed(() => this.auth.firestoreUser()?.personal ?? this.auth.currentUser()?.personal);
  readonly financial = computed(() => this.auth.firestoreUser()?.financial ?? this.auth.currentUser()?.financial);
  readonly identity = computed(() => this.auth.firestoreUser()?.identity ?? this.auth.currentUser()?.identity);

  readonly statusLabel = computed(() => {
    const st = this.auth.firestoreUser()?.kycStatus ?? this.auth.currentUser()?.kycStatus;
    return st === 'submitted' ? 'Submitted' : 'Draft';
  });

  get docCards() {
    const id = this.identity();
    return [
      { title: 'National ID', url: id?.cnicUrl },
      { title: 'Selfie', url: id?.selfieUrl },
      { title: 'Address proof', url: id?.addressProofUrl },
    ];
  }

  async submit() {
    const uid = this.auth.getUid();
    if (!uid) {
      return;
    }
    this.busy = true;
    this.error = undefined;
    try {
      await this.auth.finalizeKycSubmit(uid);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Submit failed';
    } finally {
      this.busy = false;
    }
  }
}
