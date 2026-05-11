import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { collection, onSnapshot, query, where, orderBy, limit, type Unsubscribe } from 'firebase/firestore';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-in-up stagger-1">
        <div>
          <h2 class="font-h1 text-primary dark:text-white transition-colors">System Overview</h2>
          <p class="font-body-md text-on-surface-variant dark:text-slate-400 mt-1 transition-colors">Real-time risk assessment and platform operations.</p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <ng-container *ngIf="isLoading()">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          <div *ngFor="let i of [1,2,3,4]" class="bg-slate-100 dark:bg-slate-800 h-32 rounded-2xl"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse mt-6">
          <div class="bg-slate-100 dark:bg-slate-800 h-80 rounded-2xl"></div>
          <div class="bg-slate-100 dark:bg-slate-800 h-80 rounded-2xl"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading()">
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-up stagger-2">
          
          <!-- Pool Volume -->
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors flex flex-col justify-between">
            <div class="flex justify-between items-start mb-2">
              <div class="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Pool Volume</p>
              <p class="font-display text-2xl text-primary dark:text-white">{{ totalVolume() | currency:'PKR ' }}</p>
            </div>
          </div>

          <!-- Committees -->
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors flex flex-col justify-between">
            <div class="flex justify-between items-start mb-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span class="material-symbols-outlined text-[20px]">diversity_3</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Active Committees</p>
              <div class="flex items-end gap-2">
                <p class="font-display text-2xl text-primary dark:text-white">{{ activeCommittees() }}</p>
                <p class="text-xs text-slate-400 mb-1">/ {{ totalCommittees() }} total</p>
              </div>
            </div>
          </div>

          <!-- Pending KYC -->
          <div routerLink="/admin/kyc" class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-level-1 border transition-colors flex flex-col justify-between cursor-pointer hover:shadow-md"
               [ngClass]="pendingKyc() > 0 ? 'border-amber-200 dark:border-amber-800' : 'border-slate-100 dark:border-slate-800'">
            <div class="flex justify-between items-start mb-2">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   [ngClass]="pendingKyc() > 0 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'">
                <span class="material-symbols-outlined text-[20px]">how_to_reg</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Pending KYC</p>
              <div class="flex items-center gap-2">
                <p class="font-display text-2xl text-primary dark:text-white" [ngClass]="{'text-amber-600 dark:text-amber-400': pendingKyc() > 0}">{{ pendingKyc() }}</p>
                <span *ngIf="pendingKyc() > 0" class="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              </div>
            </div>
          </div>

          <!-- Action Needed (Disputes & Fraud) -->
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-level-1 border transition-colors flex flex-col justify-between"
               [ngClass]="(pendingDisputes() + pendingFraud()) > 0 ? 'border-error/30' : 'border-slate-100 dark:border-slate-800'">
            <div class="flex justify-between items-start mb-2">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   [ngClass]="(pendingDisputes() + pendingFraud()) > 0 ? 'bg-error/10 text-error' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'">
                <span class="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Action Required</p>
              <div class="flex items-end gap-2">
                <p class="font-display text-2xl text-primary dark:text-white" [ngClass]="{'text-error': (pendingDisputes() + pendingFraud()) > 0}">{{ pendingDisputes() + pendingFraud() }}</p>
                <p class="text-xs text-slate-400 mb-1">open cases</p>
              </div>
            </div>
          </div>

        </div>
        
        <!-- Detailed Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in-up stagger-3">
          
          <!-- Recent Activity Feed -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 transition-colors">
            <div class="flex justify-between items-center mb-5">
              <h3 class="font-h3 text-primary dark:text-white">Recent Committees</h3>
              <a routerLink="/admin/committees" class="text-sm font-bold text-secondary hover:underline">View All</a>
            </div>
            
            <div class="space-y-4">
              <div *ngIf="recentCommittees().length === 0" class="text-center py-8 text-slate-400 text-sm">
                No recent committees created.
              </div>
              <div *ngFor="let c of recentCommittees()" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/5 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-white font-bold">
                    {{ c.name.charAt(0) | uppercase }}
                  </div>
                  <div>
                    <p class="font-bold text-sm text-primary dark:text-white">{{ c.name }}</p>
                    <p class="text-xs text-slate-500">{{ c.memberIds?.length ?? 0 }}/{{ c.maxMembers }} Members · {{ c.currency }} {{ c.contributionAmount }}</p>
                  </div>
                </div>
                <span class="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
                      [ngClass]="c.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                  {{ c.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Fraud & Disputes Feed -->
          <div class="bg-primary-container dark:bg-slate-800 p-6 rounded-2xl shadow-level-2 transition-colors relative overflow-hidden">
            <!-- Decorative background elements -->
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex justify-between items-center mb-5 relative z-10">
              <h3 class="font-h3 text-white">TrustDesk Alerts</h3>
              <div class="flex gap-2 text-sm font-bold">
                <a routerLink="/admin/fraud" class="text-white/80 hover:text-white underline decoration-white/30">Fraud</a>
                <span class="text-white/30">|</span>
                <a routerLink="/admin/disputes" class="text-white/80 hover:text-white underline decoration-white/30">Disputes</a>
              </div>
            </div>

            <div class="space-y-3 relative z-10">
              <div *ngIf="recentFraud().length === 0" class="text-center py-8 text-white/50 text-sm">
                <span class="material-symbols-outlined text-4xl block mb-2 opacity-50">verified_user</span>
                System clear. No recent alerts.
              </div>
              
              <div *ngFor="let f of recentFraud()" class="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl flex items-start gap-3">
                <span class="material-symbols-outlined mt-0.5"
                      [ngClass]="f.severity === 'high' ? 'text-red-400' : 'text-amber-400'">
                  {{ f.severity === 'high' ? 'gpp_maybe' : 'warning' }}
                </span>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-bold text-white">Risk Profile Flagged</p>
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white uppercase">{{ f.severity }}</span>
                  </div>
                  <p class="text-xs text-white/70 line-clamp-1">{{ f.reasons[0] }}</p>
                  <p class="text-[10px] text-white/50 mt-1">User: {{ f.userId }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  isLoading = signal(true);

  totalVolume = signal(0);
  activeCommittees = signal(0);
  totalCommittees = signal(0);
  recentCommittees = signal<any[]>([]);
  
  pendingKyc = signal(0);
  pendingDisputes = signal(0);
  pendingFraud = signal(0);
  recentFraud = signal<any[]>([]);

  private unsubs: Unsubscribe[] = [];

  ngOnInit() {
    if (!isFirebaseConfigured()) {
      this.isLoading.set(false);
      return;
    }

    // 1. Committees
    this.unsubs.push(onSnapshot(collection(getDb(), 'committees'), snap => {
      let volume = 0;
      let active = 0;
      const all = snap.docs.map(d => {
        const data = d.data();
        // Calculate pool volume: contributionAmount * maxMembers
        volume += (data['contributionAmount'] || 0) * (data['maxMembers'] || 0);
        if (data['status'] === 'active') active++;
        return { id: d.id, ...data };
      });
      
      this.totalVolume.set(volume);
      this.activeCommittees.set(active);
      this.totalCommittees.set(all.length);
      
      // Sort for recent
      this.recentCommittees.set(all.sort((a, b) => {
        const da = (a as any).createdAt?.toMillis ? (a as any).createdAt.toMillis() : 0;
        const db = (b as any).createdAt?.toMillis ? (b as any).createdAt.toMillis() : 0;
        return db - da;
      }).slice(0, 5));
      
      this.checkLoading();
    }));

    // 2. KYC Queue
    this.unsubs.push(onSnapshot(
      query(collection(getDb(), 'kycSubmissions'), where('status', '==', 'submitted')),
      snap => {
        this.pendingKyc.set(snap.size);
        this.checkLoading();
      }
    ));

    // 3. Fraud Reports
    this.unsubs.push(onSnapshot(
      query(collection(getDb(), 'fraudReports'), where('resolved', '==', false)),
      snap => {
        this.pendingFraud.set(snap.size);
        const fraud = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        this.recentFraud.set(fraud.sort((a, b) => {
          const da = (a as any).createdAt?.toMillis ? (a as any).createdAt.toMillis() : 0;
          const db = (b as any).createdAt?.toMillis ? (b as any).createdAt.toMillis() : 0;
          return db - da;
        }).slice(0, 4));
        this.checkLoading();
      }
    ));

    // 4. Disputes
    this.unsubs.push(onSnapshot(
      query(collection(getDb(), 'disputes'), where('status', 'in', ['open', 'in_review'])),
      snap => {
        this.pendingDisputes.set(snap.size);
        this.checkLoading();
      }
    ));
  }

  ngOnDestroy() {
    this.unsubs.forEach(u => u());
  }

  private loadCounter = 0;
  private checkLoading() {
    this.loadCounter++;
    // Once we have responses from all 4 listeners, turn off loading
    if (this.loadCounter >= 4) {
      this.isLoading.set(false);
    }
  }
}
