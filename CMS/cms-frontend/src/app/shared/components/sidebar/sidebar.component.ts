import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="hidden lg:flex flex-col h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 fixed left-0 top-0 py-6 gap-2 z-50 transition-colors">
      <div class="px-6 mb-8 flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white">shield</span>
        </div>
        <div>
          <h1 class="text-lg font-black text-[#1A2B4C] dark:text-white font-display">TrustCircle</h1>
          <p class="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mt-1">Financial Oversight</p>
        </div>
      </div>

      <nav class="flex-1 px-3 space-y-1 custom-scrollbar overflow-y-auto">
        <!-- ADMIN NAVIGATION -->
        <ng-container *ngIf="isAdmin()">
          <a routerLink="/admin/overview" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">dashboard</span>
            System Overview
          </a>
          <a routerLink="/admin/users" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">group</span>
            User Management
          </a>
          <a routerLink="/admin/kyc" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">badge</span>
            KYC Queue
          </a>
          <a routerLink="/admin/committees" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">diversity_3</span>
            Committees
          </a>
          <a routerLink="/admin/fraud" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">radar</span>
            Fraud Desk
          </a>
          <a routerLink="/admin/disputes" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">gavel</span>
            Disputes
          </a>
          <a routerLink="/settings" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">settings</span>
            Settings
          </a>
        </ng-container>

        <!-- STANDARD USER NAVIGATION -->
        <ng-container *ngIf="!isAdmin()">
          <a routerLink="/dashboard" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" [routerLinkActiveOptions]="{ exact: true}" class="nav-item">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/committees" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">groups</span>
            Committees
          </a>
          <a routerLink="/transactions" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">receipt_long</span>
            Transactions
          </a>
          <a routerLink="/analytics" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">analytics</span>
            Analytics
          </a>
          <a routerLink="/trust-score" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">verified</span>
            Trust score
          </a>
          <a routerLink="/fraud-detection" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">radar</span>
            Fraud desk
          </a>
          <a routerLink="/notifications" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">notifications</span>
            Notifications
          </a>
          <a *ngIf="showKycNav()" routerLink="/kyc/personal" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">badge</span>
            KYC
          </a>
          <a routerLink="/disputes" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">gavel</span>
            Disputes
          </a>
          <a routerLink="/settings" routerLinkActive="bg-slate-50 dark:bg-slate-900 text-[#1A2B4C] dark:text-white border-l-4 border-emerald-500" class="nav-item">
            <span class="material-symbols-outlined">settings</span>
            Settings
          </a>
        </ng-container>
      </nav>

      <div class="px-6 mt-auto" *ngIf="!isAdmin()">
        <a routerLink="/committees/create" class="w-full bg-[#1A2B4C] text-white py-3 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-[#031636] transition-colors shadow-lg shadow-blue-900/10 active:scale-95 duration-150">
          <span class="material-symbols-outlined text-sm">add</span>
          Create committee
        </a>
      </div>
    </aside>
    <style>
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: rgb(71 85 105);
        border-radius: 8px;
        border-left: 4px solid transparent;
      }
      :host-context(.dark) .nav-item {
        color: rgb(148 163 184);
      }
      .nav-item:hover {
        background-color: rgb(248 250 252);
      }
      :host-context(.dark) .nav-item:hover {
        background-color: rgb(15 23 42);
      }
    </style>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);

  isAdmin = computed(() => this.authService.hasRole('admin'));

  showKycNav = computed(() => {
    if (this.isAdmin()) {
      return false;
    }
    const st = this.authService.firestoreUser()?.kycStatus ?? this.authService.currentUser()?.kycStatus;
    return !(st === 'approved' || st === 'submitted');
  });
}
