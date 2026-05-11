import { Component, inject, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { TrustCircleUser } from '../../core/models/trustcircle.models';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-in-up stagger-1">
        <div>
          <h2 class="font-h1 text-primary dark:text-white">User Management</h2>
          <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1">Suspend access, elevate roles, and monitor risk profiles.</p>
        </div>
        <div class="relative w-full md:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search users..." 
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
            <h3 class="font-h3 text-primary dark:text-white mb-2">{{ activeModal.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">{{ activeModal.description }}</p>
            
            <div class="space-y-1 mb-6">
              <label class="font-label-sm text-slate-600 dark:text-slate-400">Reason for Action (Audit Log)</label>
              <textarea [(ngModel)]="actionReason" rows="3" class="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-primary focus:border-primary transition-colors p-3" placeholder="Explain why this action is being taken..."></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button (click)="closeModal()" class="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button (click)="confirmAction()" [disabled]="!actionReason.trim() || processing()" 
                      class="px-5 py-2 rounded-xl text-white font-label-md flex items-center gap-2 transition-opacity disabled:opacity-50"
                      [ngClass]="activeModal.type === 'danger' ? 'bg-error' : 'btn-primary'">
                <span *ngIf="processing()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Confirm Action
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
                <th class="px-6 py-4">User</th>
                <th class="px-6 py-4">Status & Role</th>
                <th class="px-6 py-4">Trust Score</th>
                <th class="px-6 py-4">KYC Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr *ngIf="isLoading" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">Loading user registry...</td>
              </tr>
              <tr *ngIf="!isLoading && filteredRows().length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                  <span class="material-symbols-outlined text-3xl block mb-2 opacity-50">search_off</span>
                  No users found.
                </td>
              </tr>
              
              <tr *ngFor="let u of filteredRows()" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                      <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" class="w-full h-full object-cover">
                      <div *ngIf="!u.avatarUrl" class="w-full h-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                        {{ u.displayName.charAt(0) | uppercase }}
                      </div>
                    </div>
                    <div>
                      <p class="font-bold text-primary dark:text-white">{{ u.displayName }}</p>
                      <p class="text-[11px] text-slate-500">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          [ngClass]="u.blocked ? 'bg-error/10 text-error' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'">
                      {{ u.blocked ? 'Blocked' : 'Active' }}
                    </span>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          [ngClass]="{'border border-primary text-primary dark:text-primary-container bg-primary/5 dark:bg-primary/10': u.role === 'admin'}">
                      {{ u.role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="font-display text-lg" [ngClass]="u.trustScore >= 750 ? 'text-emerald-600 dark:text-emerald-400' : u.trustScore >= 600 ? 'text-amber-600 dark:text-amber-400' : 'text-error'">{{ u.trustScore }}</span>
                    <span class="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600">moving</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5 text-xs font-semibold"
                       [ngClass]="u.kycStatus === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : u.kycStatus === 'rejected' ? 'text-error' : u.kycStatus === 'submitted' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'">
                    <span class="material-symbols-outlined text-[16px]">
                      {{ u.kycStatus === 'approved' ? 'verified' : u.kycStatus === 'rejected' ? 'cancel' : u.kycStatus === 'submitted' ? 'pending_actions' : 'hourglass_empty' }}
                    </span>
                    <span class="capitalize">{{ u.kycStatus.replace('_', ' ') }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Role Toggle -->
                    <button *ngIf="u.role === 'user'" (click)="openModal('role', u)" class="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors tooltip-trigger relative group">
                      <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      <div class="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Promote to Admin</div>
                    </button>
                    <button *ngIf="u.role === 'admin'" (click)="openModal('role', u)" class="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors tooltip-trigger relative group">
                      <span class="material-symbols-outlined text-[18px]">person</span>
                      <div class="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Demote to User</div>
                    </button>
                    
                    <!-- Block/Unblock -->
                    <button (click)="openModal('block', u)" class="p-2 rounded-lg transition-colors tooltip-trigger relative group"
                            [ngClass]="u.blocked ? 'bg-error/10 hover:bg-error/20 text-error' : 'bg-slate-50 hover:bg-error/10 dark:bg-slate-800 dark:hover:bg-error/20 text-slate-600 dark:text-slate-400 hover:text-error dark:hover:text-error'">
                      <span class="material-symbols-outlined text-[18px]">{{ u.blocked ? 'lock_open' : 'block' }}</span>
                      <div class="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {{ u.blocked ? 'Unblock User' : 'Suspend Access' }}
                      </div>
                    </button>
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
export class AdminUsersComponent implements OnDestroy {
  private readonly adminSvc = inject(AdminService);
  
  rows = signal<(TrustCircleUser & { id: string })[]>([]);
  searchQuery = signal('');
  isLoading = true;
  processing = signal(false);
  
  toast = signal<{type: 'success' | 'error', message: string} | null>(null);

  activeModal: {
    type: 'danger' | 'primary';
    title: string;
    description: string;
    action: 'block' | 'role';
    user: TrustCircleUser & { id: string };
  } | null = null;
  actionReason = '';

  private unsub?: Unsubscribe;

  filteredRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.rows();
    return this.rows().filter(u => 
      u.displayName.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    );
  });

  constructor() {
    if (!isFirebaseConfigured()) {
      this.isLoading = false;
      return;
    }
    this.unsub = onSnapshot(collection(getDb(), 'users'), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<TrustCircleUser, 'id'>) }));
      this.rows.set(list);
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  openModal(action: 'block' | 'role', user: TrustCircleUser & { id: string }) {
    this.actionReason = '';
    if (action === 'block') {
      this.activeModal = {
        type: 'danger',
        action,
        user,
        title: user.blocked ? 'Unblock User Account' : 'Suspend User Access',
        description: user.blocked 
          ? `Are you sure you want to restore access for ${user.displayName}? They will be able to log in and participate in committees again.` 
          : `Are you sure you want to suspend ${user.displayName}? They will be immediately logged out and unable to access the platform.`
      };
    } else {
      this.activeModal = {
        type: 'primary',
        action,
        user,
        title: user.role === 'admin' ? 'Demote to Standard User' : 'Promote to Administrator',
        description: user.role === 'admin'
          ? `Revoke admin privileges for ${user.displayName}? They will lose access to this dashboard immediately.`
          : `Grant full administrative privileges to ${user.displayName}? They will have unrestricted access to all platform data and operations.`
      };
    }
  }

  closeModal() {
    this.activeModal = null;
    this.actionReason = '';
  }

  async confirmAction() {
    if (!this.activeModal || !this.actionReason.trim()) return;
    
    this.processing.set(true);
    const { action, user } = this.activeModal;
    
    try {
      if (action === 'block') {
        await this.adminSvc.toggleUserBlock(user.id, user.blocked, this.actionReason);
        this.showToast('success', `User successfully ${user.blocked ? 'unblocked' : 'suspended'}.`);
      } else {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        await this.adminSvc.changeUserRole(user.id, newRole, this.actionReason);
        this.showToast('success', `User role updated to ${newRole}.`);
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
