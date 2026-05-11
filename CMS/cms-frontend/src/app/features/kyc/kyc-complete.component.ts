import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-kyc-complete',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-white dark:bg-slate-900 rounded-2xl border border-secondary/30 dark:border-secondary/30 p-10 text-center space-y-6 shadow-level-2">
      <div class="w-16 h-16 mx-auto rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
        <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">verified</span>
      </div>
      <div class="space-y-2">
        <h2 class="font-h2 text-primary dark:text-white">KYC submitted successfully</h2>
        <p class="text-sm text-on-surface-variant dark:text-slate-400 max-w-lg mx-auto">
          Our compliance desk was notified. You now have full access to dashboard, committees, and treasury analytics while
          verification completes.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a routerLink="/dashboard" class="btn-primary px-8 py-3 rounded-xl inline-flex justify-center">Go to dashboard</a>
        <a routerLink="/committees" class="px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-label-md">
          Explore committees
        </a>
      </div>
    </section>
  `,
})
export class KycCompleteComponent {
  auth = inject(AuthService);
}
