import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { AuthService } from '../../core/services/auth.service';
import { TransactionsService } from '../../core/services/transactions.service';
import type { FraudReport, CommitteeTransaction } from '../../core/models/trustcircle.models';
import { isFirebaseConfigured } from '../../../environments/environment';

interface RiskIndicator {
  icon: string;
  label: string;
  value: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

@Component({
  selector: 'app-fraud-detection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in stagger-1 pb-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="font-h1 text-primary dark:text-white transition-colors">Fraud Sentinel</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Duplicates, habitual late payers, and structural anomalies flagged for TrustDesk.
          </p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors"
             [ngClass]="investigations().length === 0
               ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
               : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'">
          <span class="material-symbols-outlined text-[18px]">
            {{ investigations().length === 0 ? 'shield' : 'warning' }}
          </span>
          {{ investigations().length === 0 ? 'System Clear' : investigations().length + ' Active Alert(s)' }}
        </div>
      </div>

      <!-- Loading skeleton -->
      <ng-container *ngIf="isLoading()">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div class="bg-slate-100 dark:bg-slate-800 h-48 rounded-2xl"></div>
          <div class="md:col-span-2 bg-slate-100 dark:bg-slate-800 h-48 rounded-2xl"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          <div *ngFor="let i of [1,2,3]" class="bg-slate-100 dark:bg-slate-800 h-28 rounded-2xl"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading()">
        <!-- Top Row: Confidence Score + Trust Profile -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- Confidence Gauge -->
          <div class="rounded-2xl bg-gradient-to-br from-primary via-slate-800 to-slate-900 text-white p-8 flex flex-col justify-between min-h-[200px]">
            <p class="text-xs uppercase tracking-[0.2em] text-white/60 font-bold">Safety Confidence</p>
            <div>
              <p class="text-6xl font-black leading-none">{{ safetyScore() }}%</p>
              <p class="text-white/60 text-sm mt-3 leading-relaxed">
                Composite based on anomalies detected on your treasury profile.
              </p>
            </div>
            <!-- Mini progress bar -->
            <div class="mt-4">
              <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000"
                     [ngClass]="safetyScore() >= 85 ? 'bg-emerald-400' : safetyScore() >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                     [style.width.%]="safetyScore()">
                </div>
              </div>
            </div>
          </div>

          <!-- Trust Profile Overview -->
          <div class="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors flex flex-col justify-between">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p class="text-xs uppercase font-bold tracking-wider text-slate-400">Trust Score</p>
                <p class="text-5xl font-black text-secondary mt-1">{{ auth.currentUser()?.trustScore ?? auth.firestoreUser()?.trustScore ?? 500 }}</p>
              </div>
              <span class="px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-sm self-start mt-1">
                {{ trustBand() }}
              </span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Models refresh after every payout cycle &amp; contribution upload. High severity tickets appear here and in Notifications.
            </p>

            <!-- Alerts Section -->
            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Alerts</p>
              <ng-container *ngIf="investigations().length > 0; else noAlerts">
                <article *ngFor="let alert of investigations()"
                         class="rounded-xl border p-4 mb-2 transition-colors"
                         [ngClass]="alert.severity === 'high'
                           ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                           : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-symbols-outlined text-[16px]"
                          [ngClass]="alert.severity === 'high' ? 'text-red-500' : 'text-amber-500'">
                      {{ alert.severity === 'high' ? 'error' : 'warning' }}
                    </span>
                    <p class="text-xs font-black uppercase"
                       [ngClass]="alert.severity === 'high' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">
                      {{ alert.severity }} severity — Risk Score: {{ alert.riskScore }}
                    </p>
                  </div>
                  <p class="text-sm text-slate-700 dark:text-slate-300" *ngFor="let reason of alert.reasons">{{ reason }}</p>
                </article>
              </ng-container>
              <ng-template #noAlerts>
                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span class="material-symbols-outlined text-[18px]">check_circle</span>
                  <p class="text-sm font-semibold">No active sentinel tickets.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </section>

        <!-- Risk Indicator Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let ri of riskIndicators()"
               class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-level-1 border transition-colors"
               [ngClass]="ri.severity === 'low'
                 ? 'border-slate-100 dark:border-slate-800'
                 : ri.severity === 'medium'
                 ? 'border-amber-200 dark:border-amber-800'
                 : 'border-red-200 dark:border-red-800'">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                     [ngClass]="ri.severity === 'low' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ri.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-red-50 dark:bg-red-900/30'">
                  <span class="material-symbols-outlined text-[18px]"
                        [ngClass]="ri.severity === 'low' ? 'text-emerald-600 dark:text-emerald-400' : ri.severity === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'">
                    {{ ri.icon }}
                  </span>
                </div>
                <p class="font-label-md text-primary dark:text-white text-sm">{{ ri.label }}</p>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                    [ngClass]="ri.severity === 'low' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : ri.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
                {{ ri.severity }}
              </span>
            </div>
            <p class="text-2xl font-black text-primary dark:text-white">{{ ri.value }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ ri.description }}</p>
          </div>
        </section>

        <!-- Activity Timeline -->
        <section class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 class="font-h3 text-primary dark:text-white mb-5">Recent Payment Activity</h3>
          <div *ngIf="recentTxs().length === 0" class="text-center py-8 text-slate-400">
            <span class="material-symbols-outlined text-4xl block mb-2">receipt_long</span>
            No recent transactions found.
          </div>
          <div class="space-y-3" *ngIf="recentTxs().length > 0">
            <div *ngFor="let tx of recentTxs()"
                 class="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                     [ngClass]="tx.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30' : tx.status === 'late' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'">
                  <span class="material-symbols-outlined text-[18px]"
                        [ngClass]="tx.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : tx.status === 'late' ? 'text-red-500' : 'text-amber-500'">
                    {{ tx.status === 'paid' ? 'check_circle' : tx.status === 'late' ? 'cancel' : 'pending' }}
                  </span>
                </div>
                <div>
                  <p class="font-label-md text-primary dark:text-white">{{ tx.committeeId }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ tx.monthKey }} · Due {{ tx.dueDate }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-label-md font-bold text-primary dark:text-white">{{ tx.currency }} {{ tx.amount | number:'1.0-0' }}</p>
                <span class="text-xs px-2 py-0.5 rounded-full capitalize font-semibold"
                      [ngClass]="tx.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : tx.status === 'late' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'">
                  {{ tx.status }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- How the Sentinel Works -->
        <section class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 class="font-h3 text-primary dark:text-white mb-4">How Fraud Sentinel Works</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-primary dark:text-[#b6c6f0] mt-0.5">analytics</span>
              <p><strong class="text-primary dark:text-white">Anomaly Detection</strong><br>Monitors your payment patterns for unusual deviations from your historical profile.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-primary dark:text-[#b6c6f0] mt-0.5">content_copy</span>
              <p><strong class="text-primary dark:text-white">Duplicate Prevention</strong><br>Hashes every uploaded proof image to block duplicate payment submissions.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-primary dark:text-[#b6c6f0] mt-0.5">notification_important</span>
              <p><strong class="text-primary dark:text-white">Real-time Alerts</strong><br>High-severity flags are immediately sent to your notifications and the admin TrustDesk.</p>
            </div>
          </div>
        </section>
      </ng-container>
    </div>
  `
})
export class FraudDetectionComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly txService = inject(TransactionsService);

  isLoading = signal(true);
  investigations = signal<(FraudReport & { id: string })[]>([]);
  private txs = signal<CommitteeTransaction[]>([]);

  recentTxs = computed(() =>
    [...this.txs()]
      .sort((a, b) => {
        const da = a.createdAt ? (a.createdAt as any).toDate?.().getTime?.() ?? 0 : 0;
        const db2 = b.createdAt ? (b.createdAt as any).toDate?.().getTime?.() ?? 0 : 0;
        return db2 - da;
      })
      .slice(0, 6)
  );

  trustBand(): string {
    const s = this.auth.currentUser()?.trustScore ?? this.auth.firestoreUser()?.trustScore ?? 500;
    if (s >= 850) return 'Platinum';
    if (s >= 750) return 'Gold';
    if (s >= 650) return 'Silver';
    return 'Developing';
  }

  safetyScore(): number {
    const alerts = this.investigations().length;
    const lateCount = this.txs().filter(t => t.status === 'late').length;
    const missedCount = this.txs().filter(t => t.status === 'missed').length;
    const base = 100 - alerts * 18 - lateCount * 3 - missedCount * 8;
    return Math.max(12, Math.min(100, base));
  }

  riskIndicators = computed<RiskIndicator[]>(() => {
    const late = this.txs().filter(t => t.status === 'late').length;
    const missed = this.txs().filter(t => t.status === 'missed').length;
    const onTime = this.txs().filter(t => t.status === 'paid').length;
    const total = late + missed + onTime;
    const consistency = total > 0 ? Math.round((onTime / total) * 100) : 100;

    return [
      {
        icon: 'schedule',
        label: 'Late Payments',
        value: late.toString(),
        severity: late === 0 ? 'low' : late < 3 ? 'medium' : 'high',
        description: late === 0 ? 'No late payments detected' : `${late} payment(s) made past the due date`
      },
      {
        icon: 'block',
        label: 'Missed Payments',
        value: missed.toString(),
        severity: missed === 0 ? 'low' : missed < 2 ? 'medium' : 'high',
        description: missed === 0 ? 'No missed payments on record' : `${missed} payment(s) were never completed`
      },
      {
        icon: 'verified',
        label: 'Payment Consistency',
        value: `${consistency}%`,
        severity: consistency >= 85 ? 'low' : consistency >= 65 ? 'medium' : 'high',
        description: consistency >= 85
          ? 'Excellent consistency. Low fraud risk.'
          : `Consistency score below optimal threshold.`
      }
    ];
  });

  ngOnInit() {
    void this.load();
    const uid = this.auth.getUid();
    if (uid) {
      this.txService.observeForUser(uid).subscribe(txs => {
        this.txs.set(txs);
        this.isLoading.set(false);
      });
    } else {
      this.isLoading.set(false);
    }
  }

  async load() {
    if (!isFirebaseConfigured()) {
      this.isLoading.set(false);
      return;
    }
    const uid = this.auth.getUid();
    if (!uid) return;

    try {
      const snap = await getDocs(
        query(collection(getDb(), 'fraudReports'), where('userId', '==', uid), where('resolved', '==', false))
      );
      const mine = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<FraudReport, 'id'>) }));
      this.investigations.set(mine);
    } catch (e) {
      this.investigations.set([]);
    }
  }
}
