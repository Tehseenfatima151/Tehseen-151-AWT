import { Component, OnInit, signal, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService, TimePeriod, AnalyticsData } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6 animate-fade-in stagger-1 pb-10">
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 class="font-h1 text-primary dark:text-white transition-colors">Performance Analytics</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1 transition-colors">Real-time oversight of financial health and committee performance.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Segmented Time Toggle -->
          <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
            <button (click)="setPeriod('30days')" 
                    [ngClass]="period() === '30days' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'"
                    class="px-4 py-1.5 rounded-md font-label-md transition-all">
              30 Days
            </button>
            <button (click)="setPeriod('90days')" 
                    [ngClass]="period() === '90days' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'"
                    class="px-4 py-1.5 rounded-md font-label-md transition-all">
              90 Days
            </button>
            <button (click)="setPeriod('all')" 
                    [ngClass]="period() === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white'"
                    class="px-4 py-1.5 rounded-md font-label-md transition-all">
              All Time
            </button>
          </div>
          <button (click)="exportCSV()" [disabled]="isLoading()" class="px-4 py-2 bg-primary dark:bg-primary text-white rounded-lg font-label-md flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all disabled:opacity-50">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </section>

      <!-- Loading Skeletons -->
      <ng-container *ngIf="isLoading(); else dataContent">
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          <div *ngFor="let i of [1,2,3,4]" class="bg-slate-100 dark:bg-slate-800 h-32 rounded-2xl"></div>
        </section>
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse mt-6">
          <div class="lg:col-span-8 bg-slate-100 dark:bg-slate-800 h-96 rounded-2xl"></div>
          <div class="lg:col-span-4 bg-slate-100 dark:bg-slate-800 h-96 rounded-2xl"></div>
        </section>
        <section class="mt-6 bg-slate-100 dark:bg-slate-800 h-80 rounded-2xl animate-pulse"></section>
      </ng-container>

      <ng-template #dataContent>
        <!-- Empty State -->
        <div *ngIf="!hasData()" class="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <span class="material-symbols-outlined text-3xl">monitoring</span>
          </div>
          <h3 class="font-h3 text-primary dark:text-white mb-2">No Analytics Data Yet</h3>
          <p class="font-body-md text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Join or create a committee and start contributing to see your financial trends, trust score, and performance metrics here.
          </p>
        </div>

        <div *ngIf="hasData()">
          <!-- KPI Cards -->
          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-up stagger-2">
            
            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors relative">
              <div class="flex justify-between items-start">
                <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <span class="material-symbols-outlined">payments</span>
                </div>
              </div>
              <div class="mt-4">
                <p class="font-label-sm text-slate-500 dark:text-slate-400 uppercase">Total Paid Amount</p>
                <h3 class="font-h2 text-primary dark:text-white mt-1">{{ formatCurrency(data()?.totalPaid) }}</h3>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col justify-between group hover:border-amber-200 dark:hover:border-amber-800 transition-colors relative">
              <div class="flex justify-between items-start">
                <div class="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                  <span class="material-symbols-outlined">pending_actions</span>
                </div>
              </div>
              <div class="mt-4">
                <p class="font-label-sm text-slate-500 dark:text-slate-400 uppercase">Total Pending/Late</p>
                <h3 class="font-h2 text-primary dark:text-white mt-1">{{ formatCurrency(data()?.totalPending) }}</h3>
                <p class="text-xs text-red-500 dark:text-red-400 mt-1" *ngIf="data()?.latePayments">{{ data()?.latePayments }} Late Payments</p>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-800 transition-colors relative">
              <div class="flex justify-between items-start">
                <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <span class="material-symbols-outlined">verified_user</span>
                </div>
                <span class="text-label-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  {{ data()?.paymentConsistency | number:'1.0-0' }}% On-time
                </span>
              </div>
              <div class="mt-4">
                <p class="font-label-sm text-slate-500 dark:text-slate-400 uppercase">Avg. Trust Score</p>
                <h3 class="font-h2 text-primary dark:text-white mt-1">{{ data()?.avgTrustScore }}</h3>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <div class="flex justify-between items-start">
                <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <span class="material-symbols-outlined">diversity_3</span>
                </div>
              </div>
              <div class="mt-4 flex gap-6">
                <div>
                  <p class="font-label-sm text-slate-500 dark:text-slate-400 uppercase">Members</p>
                  <h3 class="font-h2 text-primary dark:text-white mt-1">{{ data()?.totalMembers }}</h3>
                </div>
                <div>
                  <p class="font-label-sm text-slate-500 dark:text-slate-400 uppercase">Active</p>
                  <h3 class="font-h2 text-primary dark:text-white mt-1">{{ data()?.activeCommittees }}</h3>
                </div>
              </div>
            </div>

          </section>

          <!-- Charts Section -->
          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 animate-slide-in-up stagger-3">
            <!-- Line Chart -->
            <div class="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors">
              <div class="flex items-center justify-between mb-8">
                <div>
                  <h3 class="font-h3 text-primary dark:text-white transition-colors">Payment Trends</h3>
                  <p class="font-body-sm text-slate-500 dark:text-slate-400">Monthly aggregate of successfully processed payments.</p>
                </div>
              </div>
              <div class="h-[280px] w-full">
                <canvas baseChart *ngIf="lineChartData.datasets[0].data.length"
                  [data]="lineChartData"
                  [options]="lineChartOptions"
                  [type]="'line'">
                </canvas>
                <div *ngIf="!lineChartData.datasets[0].data.length" class="h-full flex items-center justify-center text-slate-400">
                  No trend data available for this period.
                </div>
              </div>
            </div>

            <!-- Donut Chart -->
            <div class="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
              <h3 class="font-h3 text-primary dark:text-white mb-2 transition-colors">On-time vs Late</h3>
              <p class="font-body-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Ratio of payment punctuality.</p>
              
              <div class="flex-1 flex items-center justify-center relative min-h-[200px]">
                 <canvas baseChart *ngIf="doughnutChartData.datasets[0].data.length && sumDoughnut() > 0"
                    [data]="doughnutChartData"
                    [options]="doughnutChartOptions"
                    [type]="'doughnut'">
                  </canvas>
                  <div *ngIf="!doughnutChartData.datasets[0].data.length || sumDoughnut() === 0" class="h-full flex items-center justify-center text-slate-400">
                    No data
                  </div>
                  <!-- Center Text overlay -->
                  <div *ngIf="sumDoughnut() > 0" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span class="font-h2 text-primary dark:text-white transition-colors">{{ data()?.paymentConsistency | number:'1.0-0' }}%</span>
                    <span class="font-label-sm text-slate-500 dark:text-slate-400 transition-colors">On-time</span>
                  </div>
              </div>

              <div class="mt-6 space-y-3" *ngIf="sumDoughnut() > 0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span class="font-body-sm text-slate-600 dark:text-slate-300">On-time</span>
                  </div>
                  <span class="font-label-md text-primary dark:text-white">{{ data()?.statusRatio?.onTime }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-red-400"></span>
                    <span class="font-body-sm text-slate-600 dark:text-slate-300">Late</span>
                  </div>
                  <span class="font-label-md text-primary dark:text-white">{{ data()?.statusRatio?.late }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span class="font-body-sm text-slate-600 dark:text-slate-300">Grace Period / Pending</span>
                  </div>
                  <span class="font-label-md text-primary dark:text-white">{{ data()?.statusRatio?.grace }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Top Performing Committees -->
          <section class="mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors flex flex-col animate-slide-in-up stagger-4">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="font-h3 text-primary dark:text-white transition-colors">Top Performing Committees</h3>
                <p class="font-body-sm text-slate-500 dark:text-slate-400 mt-1">Based on on-time ratio, trust, and completion progress.</p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <tr>
                    <th class="px-6 py-4 font-label-sm text-slate-500 dark:text-slate-400 uppercase">Committee Name</th>
                    <th class="px-6 py-4 font-label-sm text-slate-500 dark:text-slate-400 uppercase">Members</th>
                    <th class="px-6 py-4 font-label-sm text-slate-500 dark:text-slate-400 uppercase">Capital</th>
                    <th class="px-6 py-4 font-label-sm text-slate-500 dark:text-slate-400 uppercase">Efficiency</th>
                    <th class="px-6 py-4 font-label-sm text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
                  <tr *ngFor="let c of data()?.topCommittees" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primary-container dark:bg-primary-container flex items-center justify-center text-white shrink-0">
                          <span class="material-symbols-outlined text-[18px]">diversity_3</span>
                        </div>
                        <span class="font-body-md font-semibold text-primary dark:text-white whitespace-nowrap">{{ c.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-body-sm text-slate-600 dark:text-slate-400">{{ c.members }} Members</td>
                    <td class="px-6 py-4 text-body-sm font-medium text-primary dark:text-white">{{ formatCurrency(c.capital) }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="text-emerald-600 dark:text-emerald-400 font-label-sm w-10">{{ c.efficiency | number:'1.0-1' }}%</span>
                        <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div class="bg-emerald-500 h-full transition-all" [style.width.%]="c.efficiency"></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-label-sm capitalize"
                            [ngClass]="c.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400'">
                        {{ c.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="!data()?.topCommittees?.length">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No committees found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </ng-template>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  @ViewChild(BaseChartDirective) charts?: BaseChartDirective;

  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);

  period = signal<TimePeriod>('all');
  isLoading = signal<boolean>(true);
  data = signal<AnalyticsData | null>(null);

  // Line Chart Data & Options
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Successful Payments',
        fill: true,
        tension: 0.4,
        borderColor: '#1A2B4C',
        backgroundColor: 'rgba(26, 43, 76, 0.1)',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#1A2B4C',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Public Sans', size: 13 },
        bodyFont: { family: 'Public Sans', size: 12 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Public Sans', size: 12 } }
      },
      y: {
        display: false,
        min: 0
      }
    }
  };

  // Doughnut Chart Data & Options
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['On-time', 'Late', 'Grace/Pending'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#059669', '#f87171', '#fbbf24'],
        hoverBackgroundColor: ['#047857', '#ef4444', '#f59e0b'],
        borderWidth: 0,
        spacing: 4
      }
    ]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        bodyFont: { family: 'Public Sans', size: 13 },
        titleFont: { family: 'Public Sans' },
        padding: 12,
        cornerRadius: 8,
      }
    }
  };

  constructor() {
    effect(async () => {
      const user = this.authService.currentUser();
      if (user) {
        // Only fetch once
        if (this.isLoading()) {
          await this.analyticsService.fetchRawData(user.id);
          this.refreshData();
          this.isLoading.set(false);
        }
      }
    });
  }

  async ngOnInit() {
    // handled by effect
  }

  setPeriod(p: TimePeriod) {
    if (this.period() === p) return;
    this.period.set(p);
    this.refreshData();
  }

  private refreshData() {
    const d = this.analyticsService.getDashboardAnalytics(this.period());
    this.data.set(d);
    this.updateCharts(d);
  }

  private updateCharts(d: AnalyticsData) {
    // Update Line Chart
    this.lineChartData.labels = d.monthlyTrends.map(t => t.label);
    this.lineChartData.datasets[0].data = d.monthlyTrends.map(t => t.amount);
    
    // Scale max dynamically
    const maxVal = Math.max(...d.monthlyTrends.map(t => t.amount), 0);
    if (this.lineChartOptions?.scales?.['y']) {
        this.lineChartOptions.scales['y'].max = maxVal * 1.2 || 100;
    }

    // Update Doughnut Chart
    this.doughnutChartData.datasets[0].data = [
      d.statusRatio.onTime,
      d.statusRatio.late,
      d.statusRatio.grace
    ];

    if (this.charts) {
       // Since charts might be undefined initially or multiple, we rely on Angular to re-bind
       // the data object, which ng2-charts handles nicely if the reference changes or we call update
       this.lineChartData = { ...this.lineChartData };
       this.doughnutChartData = { ...this.doughnutChartData };
    }
  }

  hasData(): boolean {
    const d = this.data();
    if (!d) return false;
    return d.activeCommittees > 0 || d.completedCommittees > 0 || d.totalPaid > 0 || d.totalPending > 0;
  }

  sumDoughnut(): number {
    return this.doughnutChartData.datasets[0].data.reduce((a, b) => a + b, 0);
  }

  formatCurrency(val: number | undefined): string {
    if (val === undefined || isNaN(val)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }

  exportCSV() {
    const txs = this.analyticsService.getRawTransactions();
    if (!txs || txs.length === 0) return;

    // Filter by period if needed, or export all fetched
    // Let's export currently filtered data logic
    const p = this.period();
    const now = new Date();
    const cutoffDate = new Date();
    if (p === '30days') cutoffDate.setDate(now.getDate() - 30);
    else if (p === '90days') cutoffDate.setDate(now.getDate() - 90);
    else cutoffDate.setFullYear(2000); 

    const filtered = p === 'all' ? txs : txs.filter(t => {
      const date = t.createdAt ? (t.createdAt as any).toDate() : new Date();
      return date >= cutoffDate;
    });

    const headers = ['Transaction ID', 'Committee ID', 'Amount', 'Currency', 'Due Date', 'Status', 'Transaction Date', 'Proof URL'];
    const rows = filtered.map(t => [
      t.id,
      t.committeeId,
      t.amount.toString(),
      t.currency,
      t.dueDate || '',
      t.status,
      t.createdAt ? (t.createdAt as any).toDate().toISOString() : '',
      t.proofUrl || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_export_${this.period()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
