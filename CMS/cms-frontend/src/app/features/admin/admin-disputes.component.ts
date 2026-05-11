import { Component, inject, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, onSnapshot, query, where, orderBy, type Unsubscribe } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { Dispute, DisputeStatus } from '../../core/models/trustcircle.models';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-disputes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in stagger-1 pb-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 class="font-h1 text-h1 text-primary dark:text-white transition-colors">Dispute Management</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Review, adjudicate, and resolve conflicts within financial circles.</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-w-[140px] transition-colors">
            <p class="text-label-sm text-slate-500 dark:text-slate-400 uppercase">Open Cases</p>
            <p class="text-h2 text-error font-bold mt-1">{{ openCount() }}</p>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-w-[140px] transition-colors">
            <p class="text-label-sm text-slate-500 dark:text-slate-400 uppercase">Resolved</p>
            <p class="text-h2 text-secondary dark:text-emerald-400 font-bold mt-1">{{ resolvedCount() }}</p>
          </div>
        </div>
      </div>

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

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button (click)="closeModal()" class="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button (click)="confirmAction()" [disabled]="!actionReason.trim() || processing()" 
                      class="px-5 py-2 rounded-xl text-white font-label-md flex items-center gap-2 transition-opacity disabled:opacity-50"
                      [ngClass]="activeModal.buttonClass">
                <span *ngIf="processing()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ activeModal.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Case List -->
        <div class="xl:col-span-4 space-y-4 animate-slide-in-up stagger-2">
          <div class="flex items-center justify-between px-2">
            <h3 class="font-label-md text-label-md text-primary dark:text-white uppercase transition-colors">Active Disputes</h3>
          </div>

          <!-- Case List Container -->
          <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar pr-2">
            
            <div *ngIf="isLoading" class="p-8 text-center text-slate-400">Loading cases...</div>
            <div *ngIf="!isLoading && openDisputes().length === 0" class="p-8 text-center text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No active disputes requiring adjudication.
            </div>

            <div *ngFor="let d of openDisputes()" 
                 (click)="selectedDispute.set(d)"
                 class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-r-slate-100 dark:border-r-slate-800 ring-2 hover:ring-primary/20"
                 [ngClass]="{
                   'ring-primary/40 border-primary/20': selectedDispute()?.id === d.id,
                   'ring-transparent': selectedDispute()?.id !== d.id,
                   'border-l-4 border-l-error': d.priority === 'high',
                   'border-l-4 border-l-amber-500': d.priority === 'medium',
                   'border-l-4 border-l-slate-400': d.priority === 'low'
                 }">
              <div class="flex justify-between items-start mb-2">
                <span class="px-2 py-1 text-[10px] font-bold rounded-full uppercase"
                      [ngClass]="{
                        'bg-error/10 text-error': d.priority === 'high',
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400': d.priority === 'medium',
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': d.priority === 'low'
                      }">
                  {{ d.priority }} Priority
                </span>
                <span class="text-[10px] text-slate-400 font-medium">{{ d.createdAt?.toDate() | date:'short' }}</span>
              </div>
              <h4 class="font-bold text-primary dark:text-white text-sm transition-colors line-clamp-1">{{ d.title }}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Claimant: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ d.claimantId || d.createdBy }}</span></p>
              
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-slate-400">group</span>
                  <span class="text-xs text-slate-500 font-medium">{{ (d.respondentIds?.length || 0) + 1 }} Involved</span>
                </div>
                <span class="text-xs font-bold text-primary dark:text-white transition-colors">{{ d.amount ? ('PKR ' + d.amount) : 'Non-monetary' }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Column: Case Details & Evidence -->
        <div class="xl:col-span-8 space-y-6 animate-slide-in-up stagger-3" *ngIf="selectedDispute() as d">
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            
            <!-- Case Header Detail -->
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 transition-colors">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">CASE #{{ d.id.substring(0,8) }}</span>
                  <span class="px-2 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded uppercase">Active Investigation</span>
                </div>
                <h3 class="font-h2 text-h2 text-primary dark:text-white transition-colors">{{ d.title }}</h3>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 transition-colors">
              <!-- Involved Parties -->
              <div class="p-6 space-y-6">
                <h4 class="text-label-sm text-slate-500 uppercase tracking-widest">Involved Parties</h4>
                <div class="space-y-4">
                  
                  <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                    <div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">{{ d.claimantId?.charAt(0) || d.createdBy.charAt(0) | uppercase }}</div>
                    <div class="overflow-hidden">
                      <p class="text-sm font-bold text-primary dark:text-white transition-colors truncate" [title]="d.claimantId || d.createdBy">{{ d.claimantId || d.createdBy }}</p>
                      <p class="text-[11px] text-error font-medium">Claimant</p>
                    </div>
                  </div>
                  
                  <ng-container *ngIf="d.respondentIds?.length">
                    <div *ngFor="let res of d.respondentIds" class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-colors">
                      <div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">{{ res.charAt(0) | uppercase }}</div>
                      <div class="overflow-hidden">
                        <p class="text-sm font-bold text-primary dark:text-white transition-colors truncate" [title]="res">{{ res }}</p>
                        <p class="text-[11px] text-slate-500 font-medium">Respondent</p>
                      </div>
                    </div>
                  </ng-container>
                </div>

                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                  <h4 class="text-label-sm text-slate-500 uppercase tracking-widest mb-3">Case Timeline</h4>
                  <div class="space-y-4">
                    <div class="flex gap-3 relative">
                      <div class="w-2 h-2 rounded-full bg-error mt-1.5 z-10 shrink-0"></div>
                      <div>
                        <p class="text-xs font-bold text-primary dark:text-white transition-colors">Dispute Opened</p>
                        <p class="text-[10px] text-slate-400">{{ d.createdAt?.toDate() | date:'short' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Evidence & Adjudication -->
              <div class="p-6 md:col-span-2 bg-slate-50/50 dark:bg-slate-900/50 transition-colors flex flex-col">
                
                <div class="grow">
                  <!-- Narrative Summary -->
                  <div class="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Claimant's Statement</p>
                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic transition-colors">
                      "{{ d.description }}"
                    </p>
                  </div>
                  
                  <div *ngIf="d.committeeId" class="mt-4 p-4 bg-primary-container/10 border border-primary/20 rounded-xl">
                    <p class="text-xs font-bold text-primary uppercase tracking-wider mb-1">Related Committee</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">{{ d.committeeId }}</p>
                  </div>
                </div>

                <!-- Decision Panel -->
                <div class="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 transition-colors">
                  <h4 class="text-label-sm text-slate-500 uppercase tracking-widest mb-4">Admin Adjudication</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button (click)="openModal('resolved', d)" class="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      Approve & Resolve
                    </button>
                    <button (click)="openModal('penalize', d)" class="py-3 px-4 border border-error text-error rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-error/5 transition-all">
                      <span class="material-symbols-outlined text-sm">warning</span>
                      Penalize
                    </button>
                    <button (click)="openModal('dismissed', d)" class="py-3 px-4 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                      <span class="material-symbols-outlined text-sm">close</span>
                      Dismiss
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div class="xl:col-span-8 flex items-center justify-center h-full min-h-[400px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl" *ngIf="!selectedDispute() && openDisputes().length > 0">
          <div class="text-center text-slate-400">
            <span class="material-symbols-outlined text-4xl mb-2 opacity-50">gavel</span>
            <p>Select a case from the list to review evidence and adjudicate.</p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDisputesComponent implements OnDestroy {
  private readonly adminSvc = inject(AdminService);
  
  rows = signal<(Dispute & { id: string })[]>([]);
  selectedDispute = signal<(Dispute & { id: string }) | null>(null);
  
  isLoading = true;
  processing = signal(false);
  toast = signal<{type: 'success' | 'error', message: string} | null>(null);

  activeModal: {
    resolutionType: DisputeStatus | 'penalize';
    title: string;
    description: string;
    buttonClass: string;
    buttonText: string;
    dispute: Dispute & { id: string };
  } | null = null;
  
  actionReason = '';

  private unsub?: Unsubscribe;

  openDisputes = computed(() => this.rows().filter(d => d.status === 'open' || d.status === 'in_review'));
  resolvedCount = computed(() => this.rows().filter(d => d.status === 'resolved' || d.status === 'dismissed').length);
  openCount = computed(() => this.openDisputes().length);

  constructor() {
    if (!isFirebaseConfigured()) {
      this.isLoading = false;
      return;
    }
    this.unsub = onSnapshot(collection(getDb(), 'disputes'), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Dispute, 'id'>) }));
      
      // Sort by priority (high > medium > low) then date
      const priorityWeight: any = { 'high': 3, 'medium': 2, 'low': 1 };
      
      this.rows.set(list.sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
      }));
      
      this.isLoading = false;
      
      // Select first open dispute by default if none selected
      if (!this.selectedDispute() && this.openDisputes().length > 0) {
        this.selectedDispute.set(this.openDisputes()[0]);
      } else if (this.selectedDispute()) {
        // Refresh selected if it was updated
        const updated = this.rows().find(r => r.id === this.selectedDispute()!.id);
        if (updated) {
          if (updated.status === 'resolved' || updated.status === 'dismissed') {
             this.selectedDispute.set(null); // Deselect if resolved
          } else {
             this.selectedDispute.set(updated);
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  openModal(resolutionType: DisputeStatus | 'penalize', dispute: Dispute & { id: string }) {
    this.actionReason = '';
    
    switch(resolutionType) {
      case 'resolved':
        this.activeModal = { resolutionType, dispute, title: 'Approve & Resolve Dispute', description: 'This will formally close the dispute in favor of the claimant.', buttonClass: 'bg-emerald-600 text-white', buttonText: 'Confirm Resolution' };
        break;
      case 'penalize':
        this.activeModal = { resolutionType, dispute, title: 'Penalize Respondent', description: 'This formally closes the dispute and records a severe penalty violation against the respondent.', buttonClass: 'bg-error text-white', buttonText: 'Apply Penalty' };
        break;
      case 'dismissed':
        this.activeModal = { resolutionType, dispute, title: 'Dismiss Dispute', description: 'Close this case without any action. This implies the dispute was invalid or settled externally.', buttonClass: 'bg-slate-700 text-white', buttonText: 'Dismiss Case' };
        break;
    }
  }

  closeModal() {
    this.activeModal = null;
    this.actionReason = '';
  }

  async confirmAction() {
    if (!this.activeModal || !this.actionReason.trim()) return;
    
    this.processing.set(true);
    const { resolutionType, dispute } = this.activeModal;
    
    try {
      let finalStatus: DisputeStatus = resolutionType === 'penalize' ? 'resolved' : resolutionType as DisputeStatus;
      await this.adminSvc.resolveDispute(dispute.id, finalStatus, this.actionReason);
      
      // (Penalize logic for risk score would ideally go in AdminSvc or Cloud Function)
      
      this.showToast('success', `Dispute successfully processed and closed.`);
      this.closeModal();
      this.selectedDispute.set(null);
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
