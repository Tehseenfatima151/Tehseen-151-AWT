import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-kyc-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="max-w-[900px] mx-auto py-10 px-4 md:px-6 animate-fade-in">
      <header class="mb-10 text-center">
        <h1 class="font-h1 text-h1 text-primary dark:text-white mb-2 transition-colors">KYC Verification</h1>
        <p class="font-body-md text-on-surface-variant dark:text-slate-400 transition-colors">
          Finish onboarding before accessing your TrustCircle treasury tools.
        </p>
      </header>

      @if (!hideStepper()) {
        <nav class="mb-12 animate-slide-in-up">
          <div class="flex justify-between items-start px-2 md:px-6 relative">
            @for (s of steps; track s.path; let idx = $index) {
              <a
                [routerLink]="s.path"
                routerLinkActive
                #rla="routerLinkActive"
                class="flex flex-col items-center gap-2 px-2 w-24 text-center"
                [routerLinkActiveOptions]="{ exact: idx === 0 }"
              >
                <span
                  class="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm text-sm font-bold transition-colors"
                  [class.bg-primary]="rla.isActive || idx < stageIndex()"
                  [class.border-primary]="rla.isActive || idx < stageIndex()"
                  [class.text-white]="rla.isActive || idx < stageIndex()"
                  [class.border-slate-300]="!(rla.isActive || idx < stageIndex())"
                  [class.dark:border-slate-700]="!(rla.isActive || idx < stageIndex())"
                  [class.text-slate-400]="!(rla.isActive || idx < stageIndex())"
                >
                  {{ idx + 1 }}
                </span>
                <span class="font-label-sm text-[11px] leading-tight">
                  {{ s.label }}
                </span>
              </a>
            }
            <div
              aria-hidden="true"
              class="pointer-events-none absolute top-5 left-6 right-6 h-[2px] bg-slate-200 dark:bg-slate-800 -z-[1]"
            ></div>
            <div
              aria-hidden="true"
              class="pointer-events-none absolute top-5 left-6 h-[2px] bg-primary transition-all duration-500 -z-[1]"
              [style.width]="progressPx()"
            ></div>
          </div>
        </nav>
      }

      <router-outlet />
    </div>
  `,
})
export class KycShellComponent {
  private readonly router = inject(Router);

  readonly steps = [
    { label: 'Personal', path: '/kyc/personal' },
    { label: 'Financial', path: '/kyc/financial' },
    { label: 'Identity', path: '/kyc/identity' },
    { label: 'Review', path: '/kyc/review' },
  ];

  hideStepper() {
    return this.router.url.includes('/kyc/complete');
  }

  stageIndex(): number {
    const url = this.router.url;
    if (url.includes('/kyc/personal')) return 0;
    if (url.includes('/kyc/financial')) return 1;
    if (url.includes('/kyc/identity')) return 2;
    if (url.includes('/kyc/review')) return 3;
    if (url.includes('/kyc/complete')) return 4;
    return 0;
  }

  readonly progressPx = computed(() => {
    const pct = Math.min(this.stageIndex() + 1, 4) / 4;
    return `${Math.max(pct * 100, 0)}%`;
  });
}
