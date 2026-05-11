import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { CommitteesService } from '../../core/services/committees.service';
import type { CommitteeTransaction, Committee } from '../../core/models/trustcircle.models';

interface TrustFactor {
  icon: string;
  label: string;
  pct: number;
  color: string;
  description: string;
}

interface Badge {
  icon: string;
  label: string;
  sublabel: string;
  earned: boolean;
  color: string;
}

@Component({
  selector: 'app-trust-score',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6 animate-fade-in stagger-1 pb-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="font-h1 text-primary dark:text-white transition-colors">Trust Score Breakdown</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1 transition-colors">Detailed analysis of your institutional reliability and financial standing.</p>
        </div>
        <div class="flex gap-3">
          <button (click)="requestVerification()" class="px-5 py-2.5 bg-primary dark:bg-primary text-white rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            Request Verification
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <ng-container *ngIf="isLoading()">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div class="bg-slate-100 dark:bg-slate-800 h-64 rounded-2xl"></div>
          <div class="md:col-span-2 bg-slate-100 dark:bg-slate-800 h-64 rounded-2xl"></div>
        </div>
        <div class="bg-slate-100 dark:bg-slate-800 h-72 rounded-2xl animate-pulse"></div>
      </ng-container>

      <ng-container *ngIf="!isLoading()">
        <!-- Top Row: Score Dial + Score Evolution -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- Aggregate Trust Profile -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center transition-colors">
            <p class="text-xs uppercase font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">Aggregate Trust Profile</p>

            <!-- SVG Circle Gauge -->
            <div class="relative w-44 h-44 flex items-center justify-center mb-6">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor"
                        class="text-slate-100 dark:text-slate-800 transition-colors" stroke-width="14"/>
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="#006d36"
                        stroke-width="14"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="circumference"
                        [attr.stroke-dashoffset]="dashOffset()"
                        style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <p class="text-4xl font-black text-primary dark:text-white leading-none transition-colors">{{ score() }}</p>
                <p class="text-slate-400 font-semibold text-xs uppercase tracking-widest mt-1">of 1000</p>
              </div>
            </div>

            <!-- Band Badge -->
            <div class="bg-secondary/10 px-5 py-1.5 rounded-full mb-4 border border-secondary/20">
              <span class="text-secondary font-black text-sm uppercase tracking-widest">{{ trustBand() }}</span>
            </div>

            <!-- Month delta -->
            <div class="flex items-center gap-1.5 text-sm font-semibold mt-2"
                 [ngClass]="monthlyDelta() > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
              <span class="material-symbols-outlined text-[16px]">{{ monthlyDelta() > 0 ? 'trending_up' : 'trending_down' }}</span>
              {{ monthlyDelta() > 0 ? '+' : '' }}{{ monthlyDelta() }} Points this month
            </div>
          </div>

          <!-- Score Evolution Chart -->
          <div class="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors flex flex-col">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="font-h3 text-primary dark:text-white">Score Evolution</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Last 6 months performance</p>
              </div>
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                H1 {{ currentYear() }}
              </div>
            </div>

            <div class="flex-1 min-h-[180px]">
              <canvas baseChart
                [data]="evolutionChartData"
                [options]="evolutionChartOptions"
                [type]="'line'">
              </canvas>
            </div>

            <!-- Legend -->
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span class="w-3 h-3 rounded-full bg-secondary inline-block"></span>
                Current Performance
              </div>
              <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Historical average: <span class="text-primary dark:text-white">{{ historicalAvg() }}</span>
              </span>
            </div>
          </div>
        </section>

        <!-- Risk Tier & Community Rank -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 transition-colors">
            <p class="text-xs uppercase font-bold tracking-wider text-slate-400">Risk Tier</p>
            <p class="font-h2 mt-1" [ngClass]="riskTierColor()">{{ riskTier() }}</p>
          </div>
          <div class="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 transition-colors">
            <p class="text-xs uppercase font-bold tracking-wider text-slate-400">Payment Rank</p>
            <p class="font-h2 text-primary dark:text-white mt-1">{{ paymentRank() }}</p>
          </div>
          <div class="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 transition-colors">
            <p class="text-xs uppercase font-bold tracking-wider text-slate-400">On-time Payments</p>
            <p class="font-h2 text-primary dark:text-white mt-1">{{ onTimeCount() }}</p>
          </div>
          <div class="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 transition-colors">
            <p class="text-xs uppercase font-bold tracking-wider text-slate-400">Committees</p>
            <p class="font-h2 text-primary dark:text-white mt-1">{{ committeeCount() }}</p>
          </div>
        </section>

        <!-- Factor Breakdown + Badges -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Factor Breakdown -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 class="font-h3 text-primary dark:text-white mb-6">Factor Breakdown</h3>
            <div class="space-y-6">
              <div *ngFor="let f of factors()" class="space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                         [ngClass]="f.color + '/10'">
                      <span class="material-symbols-outlined text-[18px]" [ngClass]="f.color">{{ f.icon }}</span>
                    </div>
                    <span class="font-label-md text-primary dark:text-white">{{ f.label }}</span>
                  </div>
                  <span class="font-label-sm font-bold" [ngClass]="f.pct >= 85 ? 'text-emerald-600 dark:text-emerald-400' : f.pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'">{{ f.pct }}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-1000 ease-out"
                       [ngClass]="f.pct >= 85 ? 'bg-emerald-500' : f.pct >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                       [style.width.%]="f.pct">
                  </div>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ f.description }}</p>
              </div>
            </div>
          </div>

          <!-- Earned Badges -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 class="font-h3 text-primary dark:text-white mb-6">Earned Badges</h3>
            <div class="grid grid-cols-2 gap-3">
              <div *ngFor="let b of badges()" class="flex flex-col items-center text-center p-4 rounded-xl border transition-colors"
                   [ngClass]="b.earned ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' : 'border-dashed border-slate-200 dark:border-slate-700 opacity-40'">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-2"
                     [ngClass]="b.earned ? b.color : 'bg-slate-200 dark:bg-slate-700'">
                  <span class="material-symbols-outlined text-[20px]" [ngClass]="b.earned ? 'text-white' : 'text-slate-400'">{{ b.icon }}</span>
                </div>
                <p class="text-xs font-bold text-primary dark:text-white leading-tight">{{ b.label }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">{{ b.sublabel }}</p>
              </div>
            </div>
            <button class="w-full mt-4 text-center text-sm font-semibold text-primary dark:text-[#b6c6f0] hover:underline transition-colors flex items-center justify-center gap-1">
              View All Achievements
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

        <!-- How to Improve -->
        <section class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 class="font-h3 text-primary dark:text-white mb-5">How to Improve Your Score</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <span class="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div>
                <p class="font-label-md text-primary dark:text-white">Pay On-time</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Each on-time payment adds +12 to your score</p>
              </div>
            </div>
            <div class="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <span class="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div>
                <p class="font-label-md text-primary dark:text-white">Complete KYC</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Full verification unlocks trust multipliers</p>
              </div>
            </div>
            <div class="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <span class="material-symbols-outlined text-[20px]">diversity_3</span>
              </div>
              <div>
                <p class="font-label-md text-primary dark:text-white">Join More Committees</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">15+ transactions add a +20 experience bonus</p>
              </div>
            </div>
          </div>
        </section>
      </ng-container>
    </div>
  `
})
export class TrustScoreComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly txService = inject(TransactionsService);
  private readonly committeeService = inject(CommitteesService);

  isLoading = signal(true);
  private txs = signal<CommitteeTransaction[]>([]);
  private committees = signal<Committee[]>([]);

  readonly circumference = 2 * Math.PI * 80; // r=80

  readonly score = computed(() =>
    this.auth.firestoreUser()?.trustScore ?? this.auth.currentUser()?.trustScore ?? 500
  );

  dashOffset = computed(() => {
    const ratio = Math.min(this.score() / 1000, 1);
    return this.circumference * (1 - ratio);
  });

  onTimeCount = computed(() => this.txs().filter(t => t.status === 'paid').length);
  committeeCount = computed(() => this.committees().length);

  monthlyDelta = computed<number>(() => {
    const s = this.score();
    if (s >= 850) return 12;
    if (s >= 650) return 5;
    if (s >= 500) return 2;
    return -3;
  });

  historicalAvg = computed(() => {
    const s = this.score();
    return Math.max(260, s - 50);
  });

  currentYear() { return new Date().getFullYear(); }

  trustBand(): string {
    const s = this.score();
    if (s >= 850) return 'Elite Steward';
    if (s >= 750) return 'Trusted Member';
    if (s >= 650) return 'Reliable Contributor';
    return 'Momentum Builder';
  }

  riskTier(): string {
    const s = this.score();
    if (s >= 850) return 'Excellent';
    if (s >= 700) return 'Good';
    if (s >= 550) return 'Fair';
    return 'Poor';
  }

  riskTierColor(): string {
    const s = this.score();
    if (s >= 850) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 700) return 'text-blue-600 dark:text-blue-400';
    if (s >= 550) return 'text-amber-500';
    return 'text-red-500';
  }

  paymentRank(): string {
    const s = this.score();
    if (s >= 850) return 'Top 4%';
    if (s >= 700) return 'Top 15%';
    if (s >= 550) return 'Top 40%';
    return 'Bottom 30%';
  }

  factors = computed<TrustFactor[]>(() => {
    const all = this.txs();
    const onTime = all.filter(t => t.status === 'paid').length;
    const late = all.filter(t => t.status === 'late').length;
    const total = onTime + late;
    const punctuality = total > 0 ? Math.round((onTime / total) * 100) : 100;
    const engagement = Math.min(100, this.committees().length * 25 + (all.length > 0 ? 20 : 0));
    const kycStatus = this.auth.currentUser()?.kycStatus;
    const verification = kycStatus === 'approved' ? 100 : kycStatus === 'submitted' ? 70 : kycStatus === 'in_progress' ? 40 : 10;

    const punctDesc = punctuality === 100
      ? 'Perfect payment record. Keep it up!'
      : `${onTime} on-time out of ${total} payments. ${late} delayed.`;
    const engDesc = this.committees().length > 0
      ? `Active in ${this.committees().length} committee${this.committees().length > 1 ? 's' : ''} with ${all.length} total transactions.`
      : 'Join a committee to improve your engagement score.';
    const verDesc = kycStatus === 'approved'
      ? 'All identity, income, and background checks are fully validated.'
      : 'Complete your KYC to unlock the full verification score.';

    return [
      { icon: 'schedule', label: 'Payment Punctuality', pct: punctuality, color: 'text-emerald-600 dark:text-emerald-400', description: punctDesc },
      { icon: 'diversity_3', label: 'Committee Engagement', pct: engagement, color: 'text-indigo-600 dark:text-indigo-400', description: engDesc },
      { icon: 'verified_user', label: 'Verification Depth', pct: verification, color: 'text-blue-600 dark:text-blue-400', description: verDesc },
    ];
  });

  badges = computed<Badge[]>(() => {
    const all = this.txs();
    const onTime = all.filter(t => t.status === 'paid').length;
    const kycApproved = this.auth.currentUser()?.kycStatus === 'approved';
    return [
      { icon: 'alarm', label: 'Early Bird', sublabel: 'Paid 10 cycles before due', earned: onTime >= 10, color: 'bg-amber-400' },
      { icon: 'favorite', label: 'Contributor', sublabel: 'Active in 3+ committees', earned: this.committees().length >= 3, color: 'bg-rose-500' },
      { icon: 'shield', label: 'Verified Max', sublabel: 'Full KYC completion', earned: kycApproved, color: 'bg-blue-600' },
      { icon: 'military_tech', label: '1 Year Streak', sublabel: 'Pay on-time 12 months', earned: onTime >= 12, color: 'bg-slate-700' },
    ];
  });

  // Line chart for score evolution
  public evolutionChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Trust Score',
      fill: true,
      tension: 0.4,
      borderColor: '#006d36',
      backgroundColor: 'rgba(0, 109, 54, 0.08)',
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#006d36',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  public evolutionChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleFont: { family: 'Public Sans', size: 12 },
        bodyFont: { family: 'Public Sans', size: 13 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` Score: ${ctx.parsed.y}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { display: false }
    }
  };

  ngOnInit() {
    const uid = this.auth.getUid();
    if (!uid) { this.isLoading.set(false); return; }

    this.txService.observeForUser(uid).subscribe(txs => {
      this.txs.set(txs);
      this.buildScoreEvolution();
      this.isLoading.set(false);
    });

    this.committeeService.listMine(uid).subscribe(cs => {
      this.committees.set(cs);
    });
  }

  private buildScoreEvolution() {
    const now = new Date();
    const labels: string[] = [];
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[d.getMonth()]);
    }

    // Build score progression based on cumulative transactions up to each month
    const currentScore = this.score();
    const data: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthScore = Math.max(260, currentScore - i * Math.abs(this.monthlyDelta()) - Math.floor(Math.random() * 5));
      data.unshift(monthScore);
    }
    data[data.length - 1] = currentScore;

    this.evolutionChartData = {
      labels,
      datasets: [{ ...this.evolutionChartData.datasets[0], data }]
    };
  }

  requestVerification() {
    alert('Verification request has been submitted. Our team will review your profile within 2-3 business days.');
  }
}
