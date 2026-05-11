import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, onSnapshot, query, where, orderBy, type Unsubscribe } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { FraudReport } from '../../core/models/trustcircle.models';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-fraud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-in-up stagger-1">
        <div>
          <h2 class="font-h1 text-primary dark:text-white">Fraud Operations</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1">Review automated TrustDesk alerts and adjudicate risk profiles.</p>
        </div>
        <div class="flex gap-2">
          <div class="bg-error/10 text-error px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">warning</span>
            {{ rows().length }} Open Cases
          </div>
        </div>
      </header>

      <!-- Toast -->
      <div *ngIf="toast()" class="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in-up text-sm font-semibold transition-all"
           [ngClass]="toast()!.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-error text-white'">
        <span class="material-symbols-outlined text-[18px]">{{ toast()!.type === 'success' ? 'check_circle' : 'error' }}</span>
        {{ toast()!.message }}
      </div>

      <!-- Action Modal -->
      <div *ngIf="activeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <div class="p-6">
            <h3 class="font-h3 text-primary dark:text-white mb-2">{{ activeModal.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">{{ activeModal.description }}</p>
            
            <div class="space-y-1 mb-6">
              <label class="font-label-sm text-slate-600 dark:text-slate-400">Resolution Note (Audit Log)</label>
              <textarea [(ngModel)]="actionReason" rows="3" class="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-primary focus:border-primary transition-colors p-3" placeholder="Document the reason for this decision..."></textarea>
            </div>

            <div *ngIf="activeModal.action === 'resolve'" class="mb-6 flex items-start gap-3 p-3 rounded-xl bg-error/5 border border-error/20">
              <input type="checkbox" [(ngModel)]="recalculateScore" id="recalc" class="mt-1 rounded text-error focus:ring-error border-error/50 bg-white dark:bg-slate-800">
              <label for="recalc" class="text-sm text-slate-700 dark:text-slate-300">
                <span class="font-bold text-error block">Apply Severe Penalty</span>
                Automatically drop the user's Trust Score to the minimum viable threshold (High Risk).
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button (click)="closeModal()" class="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button (click)="confirmAction()" [disabled]="!actionReason.trim() || processing()" 
                      class="px-5 py-2 rounded-xl text-white font-label-md flex items-center gap-2 transition-opacity disabled:opacity-50"
                      [ngClass]="activeModal.action === 'resolve' ? 'bg-error' : 'bg-slate-700 dark:bg-slate-600'">
                <span *ngIf="processing()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ activeModal.action === 'resolve' ? 'Resolve & Penalize' : 'Dismiss Alert' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        <div *ngFor="let i of [1,2,3]" class="bg-slate-100 dark:bg-slate-800 h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!isLoading && rows().length === 0" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-3xl text-emerald-500">verified_user</span>
        </div>
        <h3 class="font-h3 text-primary dark:text-white mb-2">No Active Threats</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-md">The TrustDesk sentinel has not detected any anomalous behavior or severe rule violations.</p>
      </div>

      <div *ngIf="!isLoading && rows().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in-up stagger-2">
        <article *ngFor="let row of rows()" class="rounded-2xl border bg-white dark:bg-slate-900 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                 [ngClass]="row.severity === 'high' ? 'border-error/30' : 'border-amber-500/30'">
          
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
            <div>
              <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Target User ID</p>
              <p class="font-bold text-sm text-primary dark:text-white truncate max-w-[180px]" [title]="row.userId">{{ row.userId }}</p>
            </div>
            <span class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                  [ngClass]="row.severity === 'high' ? 'bg-error/10 text-error' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'">
              <span class="material-symbols-outlined text-[12px]">{{ row.severity === 'high' ? 'gpp_maybe' : 'warning' }}</span>
              {{ row.severity }} Risk
            </span>
          </div>
          
          <div class="p-5 grow">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Detection Reasons</p>
            <ul class="space-y-2">
              <li *ngFor="let reason of row.reasons" class="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">emergency</span>
                <span class="leading-snug">{{ reason }}</span>
              </li>
            </ul>
            
            <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Composite Score</p>
                <p class="font-display text-lg" [ngClass]="row.riskScore > 80 ? 'text-error' : 'text-amber-500'">{{ row.riskScore }}<span class="text-xs text-slate-400 font-sans">/99</span></p>
              </div>
              <p class="text-[10px] text-slate-400 text-right">
                Detected<br>
                {{ row.createdAt?.toDate() | date:'short' }}
              </p>
            </div>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl grid grid-cols-2 gap-2">
            <button (click)="openModal('dismiss', row)" class="py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              Dismiss
            </button>
            <button (click)="openModal('resolve', row)" class="py-2.5 rounded-lg text-xs font-bold text-white bg-error hover:bg-error/90 shadow-sm transition-colors flex justify-center items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">gavel</span> Resolve
            </button>
          </div>
        </article>
      </div>
    </div>
  `,
})
export class AdminFraudComponent implements OnDestroy {
  private readonly adminSvc = inject(AdminService);
  
  rows = signal<(FraudReport & { id: string })[]>([]);
  isLoading = true;
  processing = signal(false);
  toast = signal<{type: 'success' | 'error', message: string} | null>(null);

  activeModal: {
    action: 'resolve' | 'dismiss';
    title: string;
    description: string;
    report: FraudReport & { id: string };
  } | null = null;
  
  actionReason = '';
  recalculateScore = true;

  private unsub?: Unsubscribe;

  constructor() {
    if (!isFirebaseConfigured()) {
      this.isLoading = false;
      return;
    }
    this.unsub = onSnapshot(query(collection(getDb(), 'fraudReports'), where('resolved', '==', false)), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<FraudReport, 'id'>) }));
      // Sort highest risk first
      this.rows.set(list.sort((a, b) => b.riskScore - a.riskScore));
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  openModal(action: 'resolve' | 'dismiss', report: FraudReport & { id: string }) {
    this.actionReason = '';
    this.recalculateScore = true;
    this.activeModal = {
      action,
      report,
      title: action === 'resolve' ? 'Resolve & Penalize User' : 'Dismiss False Alert',
      description: action === 'resolve' 
        ? 'Confirming this resolution means the user has committed a verifiable platform violation.' 
        : 'Dismiss this alert if the automated system incorrectly flagged normal behavior.'
    };
  }

  closeModal() {
    this.activeModal = null;
    this.actionReason = '';
  }

  async confirmAction() {
    if (!this.activeModal || !this.actionReason.trim()) return;
    
    this.processing.set(true);
    const { action, report } = this.activeModal;
    
    try {
      if (action === 'resolve') {
        await this.adminSvc.resolveFraudReport(report.id, this.actionReason, this.recalculateScore, report.userId);
        this.showToast('success', 'Fraud report resolved and penalties applied.');
      } else {
        await this.adminSvc.dismissFraudReport(report.id, this.actionReason);
        this.showToast('success', 'Fraud alert dismissed.');
      }
      this.closeModal();
    } catch (e: any) {
      this.showToast('error', e.message || 'Action failed. Please try again.');
    } finally {
      this.processing.set(false);
    }
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.toast.set({ type, message });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
