import { Component, computed, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CommitteesService } from '../../core/services/committees.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartOptions } from 'chart.js';
import { Subscription, combineLatest } from 'rxjs';
import type { Committee } from '../../core/models/trustcircle.models';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

interface CommitteePaymentStatus {
  committee: Committee;
  isPaid: boolean;
  dueDate: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Dashboard Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in stagger-1">
        <div>
          <h2 class="font-h1 text-primary dark:text-white transition-colors">Financial Overview</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Welcome back, {{ authService.currentUser()?.name || authService.currentUser()?.email?.split('@')?.[0] }}. Your committees are performing within expected risk parameters.
          </p>
        </div>
        <div class="flex items-center gap-3 bg-secondary-container/20 dark:bg-secondary-container/10 px-4 py-2 rounded-full border border-secondary/20 transition-colors">
          <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">verified</span>
          <span class="text-secondary font-label-md">{{ kycLabel() }}</span>
        </div>
      </div>

      <!-- Bento Grid Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-up stagger-2">
        
        <!-- Portfolio Stat -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 ambient-shadow flex flex-col justify-between transition-colors">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors">
              <span class="material-symbols-outlined text-primary dark:text-blue-400">account_balance</span>
            </div>
            <span class="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Portfolio</span>
          </div>
          <div class="mt-6">
            <p class="text-slate-500 dark:text-slate-400 font-label-sm">Total Committees Joined</p>
            <h3 class="text-h1 text-primary dark:text-white mt-1 transition-colors">{{ stats().committeesJoined }}</h3>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
            <span class="text-slate-400 font-body-sm" title="Total active committees running on TrustCircle">Platform Active Circles</span>
            <span class="font-label-md text-secondary">{{ stats().activeCommittees }} Active</span>
          </div>
        </div>

        <!-- Next Due Stat -->
        <div class="bg-primary-container dark:bg-[#1f2937] text-white p-6 rounded-2xl ambient-shadow flex flex-col justify-between transition-colors">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-white/10 rounded-xl">
              <span class="material-symbols-outlined">schedule</span>
            </div>
            <span class="text-white/40 text-[10px] font-bold tracking-widest uppercase">Next Due</span>
          </div>
          <div class="mt-6">
            <p class="text-white/70 font-label-sm">Total Monthly Due</p>
            <h3 class="text-h1 mt-1">{{ stats().upcomingPayment | currency }}</h3>
          </div>
          <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span class="text-white/60 font-body-sm">Current Month Cycle</span>
            <a href="/transactions" class="bg-secondary hover:bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all cursor-pointer">Pay Now</a>
          </div>
        </div>

        <!-- Liquidity Stat -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 ambient-shadow flex flex-col justify-between overflow-hidden relative transition-colors">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-surface-container dark:bg-slate-800 rounded-full opacity-30 transition-colors"></div>
          <div class="flex justify-between items-start relative z-10">
            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl transition-colors">
              <span class="material-symbols-outlined text-secondary">payments</span>
            </div>
            <span class="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Liquidity</span>
          </div>
          <div class="mt-6 relative z-10">
            <p class="text-slate-500 dark:text-slate-400 font-label-sm" title="Total amount you will receive from your joined committees">Expected Payouts</p>
            <h3 class="text-h3 text-primary dark:text-white mt-1 transition-colors">{{ stats().expectedPayouts | currency }}</h3>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10 transition-colors">
            <span class="text-slate-400 font-body-sm">Your Payout</span>
            <div class="flex items-center gap-1 text-secondary">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              <span class="font-label-md">Qualified</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Payment Status Breakdown Section -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 ambient-shadow overflow-hidden animate-slide-in-up stagger-3">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="font-h3 text-primary dark:text-white">Payment Status Breakdown</h3>
          <p class="text-sm text-slate-500 mt-1">Your payment standing for the current month's cycle.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50">
                <th class="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Committee</th>
                <th class="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Cycle Progress</th>
                <th class="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Next Due Date</th>
                <th class="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Amount</th>
                <th class="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of committeeStatuses()" class="border-b border-slate-50 dark:border-slate-800 last:border-none hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td class="p-4">
                  <div class="font-label-md text-primary dark:text-white">{{ s.committee.name }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ s.committee.maxMembers }} Members</div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span class="font-label-sm text-slate-600 dark:text-slate-300">Cycle {{ s.committee.currentCycle || 1 }} of {{ s.committee.totalCycles || s.committee.maxMembers }}</span>
                    <div class="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-16">
                      <div class="h-full bg-blue-500 rounded-full" [style.width.%]="((s.committee.currentCycle || 1) / (s.committee.totalCycles || s.committee.maxMembers)) * 100"></div>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {{ s.dueDate | date:'mediumDate' }}
                </td>
                <td class="p-4 font-bold text-primary dark:text-white">
                  {{ s.committee.contributionAmount | currency:s.committee.currency }}
                </td>
                <td class="p-4">
                  <span *ngIf="s.isPaid" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    PAID
                  </span>
                  <span *ngIf="!s.isPaid" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    <span class="material-symbols-outlined text-[14px]">pending_actions</span>
                    PENDING
                  </span>
                </td>
              </tr>
              <tr *ngIf="committeeStatuses().length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400">
                  No active committees found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Charts and lower sections -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in-up stagger-4">
        <!-- Savings Growth Chart -->
        <div class="lg:col-span-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 ambient-shadow transition-colors flex flex-col min-h-[400px]">
           <div class="flex justify-between items-center mb-6">
             <h3 class="font-h3 text-primary dark:text-white">Savings Growth</h3>
             <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 6 Months</span>
           </div>
           <div class="flex-1 w-full relative">
             <!-- ng2-charts Bar Chart -->
             <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="'bar'">
             </canvas>
           </div>
        </div>

        <!-- Trust Score Widget -->
        <div class="lg:col-span-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 ambient-shadow transition-colors flex flex-col min-h-[400px]">
           <h3 class="font-h3 text-primary dark:text-white mb-2 text-center">Trust Score</h3>
           <p class="text-sm text-slate-500 text-center mb-8">Your credibility metric</p>
           
           <div class="flex-1 flex flex-col items-center justify-center">
             <!-- Circular Progress SVG -->
             <div class="relative w-48 h-48 flex items-center justify-center mb-6">
                <!-- Background track -->
                <svg class="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="8"></circle>
                  <!-- Progress bar -->
                  <circle cx="50" cy="50" r="45" fill="none" 
                          [ngClass]="getTrustScoreColor(trustScore())" 
                          stroke-width="8" 
                          stroke-linecap="round"
                          [style.stroke-dasharray]="283"
                          [style.stroke-dashoffset]="283 - (283 * trustScore()) / 1000"
                          class="transition-all duration-1000 ease-out"></circle>
                </svg>
                <!-- Score Text -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-4xl font-black text-primary dark:text-white">{{ trustScore() }}</span>
                  <span class="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">/ 1000</span>
                </div>
             </div>
             
             <!-- Rating Badge -->
             <div class="px-4 py-1.5 rounded-full text-sm font-bold capitalize" [ngClass]="getTrustScoreBadge(trustScore())">
               {{ getTrustScoreLabel(trustScore()) }}
             </div>
             <p class="text-xs text-slate-400 mt-4 text-center">Based on payment history & KYC</p>
           </div>
        </div>
      </div>
      
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  committeesService = inject(CommitteesService);
  userProfileService = inject(UserProfileService);
  transactionsService = inject(TransactionsService);

  readonly kycLabel = computed(() => {
    const st = this.authService.firestoreUser()?.kycStatus ?? this.authService.currentUser()?.kycStatus ?? 'approved';
    if (st === 'approved') return 'KYC Verified';
    if (st === 'submitted') return 'KYC Submitted';
    if (st === 'in_progress') return 'KYC Draft';
    return 'KYC ' + String(st).replace('_', ' ');
  });
  
  stats = signal({
    committeesJoined: 0,
    activeCommittees: 0,
    upcomingPayment: 0,
    expectedPayouts: 0
  });

  committeeStatuses = signal<CommitteePaymentStatus[]>([]);

  trustScore = signal<number>(500);
  private sub?: Subscription;

  // Chart Configuration
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A2B4C',
        padding: 12,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.raw}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)', tickLength: 0 },
        border: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8', padding: 10, callback: (value) => '$' + value }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8', padding: 10 }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: '#34d399',
        hoverBackgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  ngOnInit() {
    const uid = this.authService.getUid();
    if (uid) {
      // Load real trust score
      this.userProfileService.getOnce(uid).then(profile => {
        if (profile && profile.trustScore) {
          this.trustScore.set(profile.trustScore);
        }
      });

      // Load user committees and transactions to calculate true pending due
      this.sub = combineLatest([
        this.committeesService.listMine(uid),
        this.transactionsService.observeForUser(uid)
      ]).subscribe(async ([committees, transactions]) => {
        const activeCommittees = committees.filter(c => c.status === 'active');
        
        // Fetch global active committees count
        const db = getFirestore();
        const globalActiveSnap = await getDocs(query(collection(db, 'committees'), where('status', '==', 'active')));
        const activeCount = globalActiveSnap.size;
        
        let pendingTotalDue = 0;
        let totalExpected = 0;

        const statuses: CommitteePaymentStatus[] = [];

        activeCommittees.forEach(c => {
          // Expected payout is contribution amount multiplied by total duration (max members)
          totalExpected += c.contributionAmount * (c.totalCycles || c.maxMembers);
          
          // Check if the user has made enough paid transactions to cover the current cycle
          const userPaidTxs = transactions.filter(t => 
            t.committeeId === c.id && 
            t.status === 'paid'
          );

          const hasPaidCurrentCycle = userPaidTxs.length >= (c.currentCycle || 1);

          if (!hasPaidCurrentCycle) {
            pendingTotalDue += c.contributionAmount;
          }

          // Calculate next due date (using monthlyDueDay or default to 5th)
          const now = new Date();
          const dueDay = c.monthlyDueDay || 5;
          const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
          if (now.getDate() > dueDay && !hasPaidCurrentCycle) {
             // It's past the due date for this month, but still in the current month cycle
             // (You could adjust logic here if you want due date to push to next month early)
          }

          statuses.push({
            committee: c,
            isPaid: hasPaidCurrentCycle,
            dueDate: dueDate
          });
        });

        this.stats.set({
          committeesJoined: committees.length,
          activeCommittees: activeCount,
          upcomingPayment: pendingTotalDue,
          expectedPayouts: totalExpected
        });

        this.committeeStatuses.set(statuses);

        // Update chart data based on overall due
        const base = totalExpected > 0 ? totalExpected / 10 : 1000;
        this.barChartData.datasets[0].data = [
          base * 0.4, 
          base * 0.5, 
          base * 0.7, 
          base * 0.8, 
          base * 0.9, 
          base
        ];
        this.barChartData = { ...this.barChartData };
      });
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  getTrustScoreColor(score: number): string {
    if (score >= 800) return 'stroke-emerald-400';
    if (score >= 600) return 'stroke-blue-400';
    if (score >= 400) return 'stroke-amber-400';
    return 'stroke-red-400';
  }

  getTrustScoreBadge(score: number): string {
    if (score >= 800) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    if (score >= 600) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    if (score >= 400) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800';
  }

  getTrustScoreLabel(score: number): string {
    if (score >= 800) return 'Excellent Standing';
    if (score >= 600) return 'Good Standing';
    if (score >= 400) return 'Fair Standing';
    return 'High Risk';
  }
}
