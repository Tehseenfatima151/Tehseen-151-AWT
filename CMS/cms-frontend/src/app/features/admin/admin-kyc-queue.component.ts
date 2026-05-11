import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import { UserProfileService } from '../../core/services/user-profile.service';
import type { KycSubmission } from '../../core/models/trustcircle.models';

@Component({
  selector: 'app-admin-kyc-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in stagger-1 pb-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 class="font-h1 text-h1 text-primary dark:text-white transition-colors">Identity Verification</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Review submitted KYC profiles to ensure regulatory compliance.</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
            <span class="material-symbols-outlined">pending_actions</span>
            {{ rows().length }} Pending Reviews
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
              <label class="font-label-sm text-slate-600 dark:text-slate-400">Reviewer Notes (Sent to user if rejected)</label>
              <textarea [(ngModel)]="reviewerNote" rows="3" class="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-primary focus:border-primary transition-colors p-3" placeholder="Enter formal review notes..."></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button (click)="closeModal()" class="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button (click)="confirmAction()" [disabled]="(activeModal.verdict === 'rejected' && !reviewerNote.trim()) || processing()" 
                      class="px-5 py-2 rounded-xl text-white font-label-md flex items-center gap-2 transition-opacity disabled:opacity-50"
                      [ngClass]="activeModal.buttonClass">
                <span *ngIf="processing()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ activeModal.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Queue List -->
        <div class="xl:col-span-4 space-y-4 animate-slide-in-up stagger-2">
          <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar pr-2">
            
            <div *ngIf="isLoading" class="p-8 text-center text-slate-400">Loading queue...</div>
            
            <div *ngIf="!isLoading && rows().length === 0" class="p-8 text-center text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <span class="material-symbols-outlined text-4xl block mb-2 opacity-50">task_alt</span>
              Queue is clear. Excellent work!
            </div>

            <div *ngFor="let r of rows()" 
                 (click)="selectedRow.set(r)"
                 class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border ring-2 hover:ring-primary/20"
                 [ngClass]="selectedRow()?.id === r.id ? 'ring-primary/40 border-primary/20' : 'ring-transparent border-slate-100 dark:border-slate-800'">
              <div class="flex justify-between items-start mb-2">
                <span class="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase">Submitted</span>
                <span class="text-[10px] text-slate-400 font-medium">{{ r.submittedAt?.toDate() | date:'shortTime' }}</span>
              </div>
              <h4 class="font-bold text-primary dark:text-white text-sm transition-colors line-clamp-1">{{ r.personal?.firstName }} {{ r.personal?.lastName }}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors font-mono">User: {{ r.userId.substring(0,10) }}...</p>
            </div>
          </div>
        </div>

        <!-- Right: Detail Panel -->
        <div class="xl:col-span-8 animate-slide-in-up stagger-3" *ngIf="selectedRow() as row">
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Identity Profile Review</p>
                <h3 class="font-h2 text-primary dark:text-white">{{ row.personal?.firstName }} {{ row.personal?.lastName }}</h3>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Submitted</p>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ row.submittedAt?.toDate() | date:'medium' }}</p>
              </div>
            </div>

            <div class="p-6 space-y-8">
              <!-- Personal Info -->
              <div>
                <h4 class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span class="material-symbols-outlined text-[18px]">person</span> Personal Details
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">First Name</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">{{ row.personal?.firstName || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Last Name</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">{{ row.personal?.lastName || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Date of Birth</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">{{ row.personal?.dob | date:'mediumDate' || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Phone</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">{{ row.personal?.phone || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Financial Info -->
              <div>
                <h4 class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span class="material-symbols-outlined text-[18px]">account_balance</span> Financial Profile
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Bank Name</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">{{ row.financial?.bankName || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">IBAN / Account No.</p>
                    <p class="text-sm font-semibold text-primary dark:text-white font-mono">{{ row.financial?.ibanOrAccount || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Income</p>
                    <p class="text-sm font-semibold text-primary dark:text-white">PKR {{ row.financial?.monthlyIncome ? (row.financial!.monthlyIncome | number) : '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Employment</p>
                    <p class="text-sm font-semibold text-primary dark:text-white capitalize">{{ row.financial?.employmentStatus || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Documents -->
              <div>
                <h4 class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span class="material-symbols-outlined text-[18px]">badge</span> Identity Documents
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- ID Card -->
                  <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group">
                    <div class="bg-slate-100 dark:bg-slate-800 p-2 text-center border-b border-slate-200 dark:border-slate-700">
                      <p class="text-xs font-bold text-slate-600 dark:text-slate-300">National ID Front</p>
                    </div>
                    <div class="aspect-video bg-slate-200 dark:bg-slate-900 relative">
                      <img *ngIf="row.identity?.cnicUrl" [src]="row.identity!.cnicUrl" class="w-full h-full object-cover">
                      <div *ngIf="!row.identity?.cnicUrl" class="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                        <span class="material-symbols-outlined text-3xl">image_not_supported</span>
                        <span class="text-[10px]">No document provided</span>
                      </div>
                    </div>
                  </div>

                  <!-- Selfie -->
                  <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group">
                    <div class="bg-slate-100 dark:bg-slate-800 p-2 text-center border-b border-slate-200 dark:border-slate-700">
                      <p class="text-xs font-bold text-slate-600 dark:text-slate-300">Liveness Selfie</p>
                    </div>
                    <div class="aspect-video bg-slate-200 dark:bg-slate-900 relative">
                      <img *ngIf="row.identity?.selfieUrl" [src]="row.identity!.selfieUrl" class="w-full h-full object-cover">
                      <div *ngIf="!row.identity?.selfieUrl" class="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                        <span class="material-symbols-outlined text-3xl">face</span>
                        <span class="text-[10px]">No selfie provided</span>
                      </div>
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group">
                    <div class="bg-slate-100 dark:bg-slate-800 p-2 text-center border-b border-slate-200 dark:border-slate-700">
                      <p class="text-xs font-bold text-slate-600 dark:text-slate-300">Proof of Address</p>
                    </div>
                    <div class="aspect-video bg-slate-200 dark:bg-slate-900 relative">
                      <img *ngIf="row.identity?.addressProofUrl" [src]="row.identity!.addressProofUrl" class="w-full h-full object-cover">
                      <div *ngIf="!row.identity?.addressProofUrl" class="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                        <span class="material-symbols-outlined text-3xl">description</span>
                        <span class="text-[10px]">No document provided</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-end">
                <button (click)="openModal('rejected', row)" class="px-6 py-2.5 rounded-xl border-2 border-error text-error font-bold text-sm hover:bg-error/10 transition-colors flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">cancel</span> Reject Profile
                </button>
                <button (click)="openModal('approved', row)" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">verified</span> Approve Profile
                </button>
              </div>

            </div>
          </div>
        </div>

        <div class="xl:col-span-8 flex items-center justify-center h-full min-h-[400px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl" *ngIf="!selectedRow() && rows().length > 0">
          <div class="text-center text-slate-400">
            <span class="material-symbols-outlined text-4xl mb-2 opacity-50">fact_check</span>
            <p>Select a KYC submission from the queue to review.</p>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class AdminKycQueueComponent implements OnDestroy {
  private readonly users = inject(UserProfileService);

  rows = signal<(KycSubmission & { id: string })[]>([]);
  selectedRow = signal<(KycSubmission & { id: string }) | null>(null);
  
  isLoading = true;
  processing = signal(false);
  toast = signal<{type: 'success' | 'error', message: string} | null>(null);

  activeModal: {
    verdict: 'approved' | 'rejected';
    title: string;
    description: string;
    buttonClass: string;
    buttonText: string;
    row: KycSubmission & { id: string };
  } | null = null;
  
  reviewerNote = '';

  private unsub?: Unsubscribe;

  constructor() {
    if (!isFirebaseConfigured()) {
      this.isLoading = false;
      return;
    }
    const qy = query(collection(getDb(), 'kycSubmissions'), where('status', '==', 'submitted'));
    this.unsub = onSnapshot(qy, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<KycSubmission, 'id'>) }));
      this.rows.set(list.sort((a, b) => (a.submittedAt?.toMillis?.() || 0) - (b.submittedAt?.toMillis?.() || 0)));
      this.isLoading = false;

      if (!this.selectedRow() && list.length > 0) {
        this.selectedRow.set(list[0]);
      } else if (this.selectedRow()) {
        const stillPending = list.find(r => r.id === this.selectedRow()!.id);
        if (!stillPending) this.selectedRow.set(null);
      }
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  openModal(verdict: 'approved' | 'rejected', row: KycSubmission & { id: string }) {
    this.reviewerNote = '';
    this.activeModal = {
      verdict,
      row,
      title: verdict === 'approved' ? 'Approve Verification' : 'Reject Submission',
      description: verdict === 'approved' 
        ? `Grant full verified status to ${row.personal?.firstName}. They will gain access to all platform features.`
        : `Deny this application. Please provide clear reviewer notes explaining why it was rejected so the user can fix the issue.`,
      buttonClass: verdict === 'approved' ? 'bg-emerald-600 text-white' : 'bg-error text-white',
      buttonText: verdict === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'
    };
  }

  closeModal() {
    this.activeModal = null;
    this.reviewerNote = '';
  }

  async confirmAction() {
    if (!this.activeModal) return;
    if (this.activeModal.verdict === 'rejected' && !this.reviewerNote.trim()) return;
    
    this.processing.set(true);
    const { verdict, row } = this.activeModal;
    
    try {
      await this.users.update(row.userId, { kycStatus: verdict });
      await updateDoc(doc(getDb(), 'kycSubmissions', row.id), {
        status: verdict,
        reviewedAt: serverTimestamp(),
        reviewerNote: this.reviewerNote
      });
      
      this.showToast('success', `KYC profile successfully ${verdict}.`);
      this.closeModal();
      this.selectedRow.set(null);
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
