import { Component, inject, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { Committee, CommitteeStatus } from '../../core/models/trustcircle.models';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-committees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 pb-10">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-in-up stagger-1">
        <div>
          <h2 class="font-h1 text-primary dark:text-white">Committee Oversight</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1">Monitor pools, audit payouts, and enforce platform safety.</p>
        </div>
        <div class="relative w-full md:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name or ID..." 
                 class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-primary focus:border-primary transition-colors dark:text-white">
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
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-2xl" [ngClass]="activeModal.colorClass">{{ activeModal.icon }}</span>
              <h3 class="font-h3 text-primary dark:text-white">{{ activeModal.title }}</h3>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">{{ activeModal.description }}</p>
            
            <div class="space-y-1 mb-6">
              <label class="font-label-sm text-slate-600 dark:text-slate-400">Formal Reasoning (Audit Log)</label>
              <textarea [(ngModel)]="actionReason" rows="3" class="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-primary focus:border-primary transition-colors p-3" placeholder="Enter formal reasoning for this administrative action..."></textarea>
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

      <!-- Main Table -->
      <div class="rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-slide-in-up stagger-2">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 dark:bg-slate-950 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="px-6 py-4">Committee Name</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Pool / Cycle</th>
                <th class="px-6 py-4">Progress</th>
                <th class="px-6 py-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr *ngIf="isLoading" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">Loading committees...</td>
              </tr>
              <tr *ngIf="!isLoading && filteredRows().length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                  <span class="material-symbols-outlined text-3xl block mb-2 opacity-50">search_off</span>
                  No committees found.
                </td>
              </tr>
              
              <tr *ngFor="let c of filteredRows()" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-primary/5 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-white font-bold">
                      {{ c.name.charAt(0) | uppercase }}
                    </div>
                    <div>
                      <p class="font-bold text-primary dark:text-white">{{ c.name }}</p>
                      <p class="text-[11px] text-slate-500">ID: {{ c.id.substring(0, 8) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-max items-center gap-1"
                        [ngClass]="getStatusClasses(c.status)">
                    <span *ngIf="c.status === 'investigating'" class="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {{ c.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-primary dark:text-white">{{ c.currency }} {{ c.contributionAmount | number }}</p>
                  <p class="text-[11px] text-slate-500">Total volume: {{ c.currency }} {{ c.contributionAmount * c.maxMembers | number }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-secondary rounded-full" [style.width.%]="(c.currentCycle / c.totalCycles) * 100"></div>
                    </div>
                    <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">C{{ c.currentCycle }}/{{ c.totalCycles }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a [routerLink]="['/committees', c.id]" class="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors tooltip-trigger relative group">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                      <div class="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">View Details & History</div>
                    </a>
                    
                    <!-- Admin Control Menu -->
                    <div class="relative group">
                      <button class="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">gavel</span>
                      </button>
                      <!-- Dropdown -->
                      <div class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
                        <button *ngIf="c.status === 'active'" (click)="openModal('investigating', c)" class="w-full text-left px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px]">search</span> Mark Investigation
                        </button>
                        <button *ngIf="c.status !== 'frozen'" (click)="openModal('frozen', c)" class="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px]">ac_unit</span> Freeze Payouts
                        </button>
                        <button *ngIf="c.status !== 'suspended'" (click)="openModal('suspended', c)" class="w-full text-left px-4 py-2 text-xs font-semibold text-error hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px]">block</span> Suspend Committee
                        </button>
                        <div *ngIf="c.status === 'frozen' || c.status === 'investigating' || c.status === 'suspended'" class="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                        <button *ngIf="c.status === 'frozen' || c.status === 'investigating' || c.status === 'suspended'" (click)="openModal('active', c)" class="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px]">play_circle</span> Restore Activity
                        </button>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminCommitteesComponent implements OnDestroy {
  private readonly adminSvc = inject(AdminService);
  
  rows = signal<(Committee & { id: string })[]>([]);
  searchQuery = signal('');
  isLoading = true;
  processing = signal(false);
  toast = signal<{type: 'success' | 'error', message: string} | null>(null);

  activeModal: {
    targetStatus: CommitteeStatus;
    title: string;
    description: string;
    icon: string;
    colorClass: string;
    buttonClass: string;
    buttonText: string;
    committee: Committee & { id: string };
  } | null = null;
  
  actionReason = '';

  private unsub?: Unsubscribe;

  filteredRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.rows();
    return this.rows().filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.id.toLowerCase().includes(q)
    );
  });

  constructor() {
    if (!isFirebaseConfigured()) {
      this.isLoading = false;
      return;
    }
    this.unsub = onSnapshot(collection(getDb(), 'committees'), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Committee, 'id'>) }));
      // Sort by status priority (investigating first) and then by creation date
      this.rows.set(list.sort((a, b) => {
        if (a.status === 'investigating' && b.status !== 'investigating') return -1;
        if (a.status !== 'investigating' && b.status === 'investigating') return 1;
        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
      }));
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  getStatusClasses(status: CommitteeStatus): string {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'completed': return 'bg-secondary/10 text-secondary';
      case 'investigating': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-400/50';
      case 'frozen': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'suspended': return 'bg-error/10 text-error border border-error/20';
      case 'draft': 
      case 'cancelled':
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  openModal(targetStatus: CommitteeStatus, committee: Committee & { id: string }) {
    this.actionReason = '';
    
    switch(targetStatus) {
      case 'investigating':
        this.activeModal = { targetStatus, committee, title: 'Open Investigation', description: 'Mark this committee as under active investigation. This flags the pool for TrustDesk review without stopping payments.', icon: 'search', colorClass: 'text-amber-500', buttonClass: 'bg-amber-500 text-white', buttonText: 'Mark Investigation' };
        break;
      case 'frozen':
        this.activeModal = { targetStatus, committee, title: 'Freeze Payouts', description: 'Temporarily lock all scheduled payouts for this committee. Transactions can still be submitted, but funds will not be distributed.', icon: 'ac_unit', colorClass: 'text-blue-500', buttonClass: 'bg-blue-500 text-white', buttonText: 'Freeze Payouts' };
        break;
      case 'suspended':
        this.activeModal = { targetStatus, committee, title: 'Suspend Committee', description: 'Immediately halt all activity. Members cannot upload proofs, and no payouts will occur. This is a severe penalty action.', icon: 'block', colorClass: 'text-error', buttonClass: 'bg-error text-white', buttonText: 'Suspend Committee' };
        break;
      case 'active':
        this.activeModal = { targetStatus, committee, title: 'Restore Activity', description: 'Lift all restrictions and restore this committee to normal active status.', icon: 'play_circle', colorClass: 'text-emerald-500', buttonClass: 'bg-emerald-600 text-white', buttonText: 'Restore Activity' };
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
    const { targetStatus, committee } = this.activeModal;
    
    try {
      await this.adminSvc.updateCommitteeStatus(committee.id, targetStatus, this.actionReason);
      this.showToast('success', `Committee status updated to ${targetStatus}.`);
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
