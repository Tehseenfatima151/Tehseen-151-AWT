import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { CommitteesService } from '../../core/services/committees.service';
import { TransactionsService } from '../../core/services/transactions.service';
import type { Committee, CommitteeTransaction, PayoutRecord } from '../../core/models/trustcircle.models';
import { AuthService } from '../../core/services/auth.service';
import { getDb } from '../../core/firebase/firebase-app';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-committee-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-20" *ngIf="committee(); else ghost">
      
      <!-- Top Header -->
      <div class="flex flex-col lg:flex-row lg:justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">Committee workspace</p>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  [ngClass]="committee()!.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'">
              {{ committee()!.status }}
            </span>
          </div>
          <h2 class="font-h1 text-primary dark:text-white">{{ committee()!.name }}</h2>
          <p class="text-sm text-slate-500 max-w-2xl mt-1">{{ committee()!.description }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 flex gap-6 items-center">
          <div>
            <p class="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Monthly Contribution</p>
            <p class="text-2xl font-black text-secondary">{{ committee()!.currency }} {{ committee()!.contributionAmount | number }}</p>
          </div>
          <div class="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div>
            <p class="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Pool Volume</p>
            <p class="text-2xl font-black text-primary dark:text-white">{{ committee()!.currency }} {{ committee()!.contributionAmount * committee()!.maxMembers | number }}</p>
          </div>
        </div>
      </div>

      <!-- Lifecycle Progress Tracker -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div class="flex justify-between items-end mb-4">
          <div>
            <h3 class="font-h3 text-primary dark:text-white">Lifecycle Progress</h3>
            <p class="text-xs text-slate-500 font-medium mt-1">Cycle {{ committee()!.currentCycle }} of {{ committee()!.totalCycles }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-black text-secondary">{{ completionPercentage() | number:'1.0-0' }}%</p>
            <p class="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Completed</p>
          </div>
        </div>
        <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full bg-secondary transition-all duration-1000 ease-out rounded-full" [style.width.%]="completionPercentage()"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: Payout Draw System -->
        <aside class="lg:col-span-5 space-y-6">
          
          <!-- Toss / Draw Panel -->
          <div class="rounded-2xl border-2 border-primary/10 bg-gradient-to-b from-primary/5 to-transparent p-6 relative overflow-hidden shadow-sm">
            <h3 class="font-h2 text-primary dark:text-white mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">casino</span> Payout Draw
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">Select the next recipient for Cycle {{ committee()!.currentCycle }}'s payout.</p>

            <!-- Draw Execution Area -->
            <div *ngIf="canExecuteDraw()" class="space-y-4">
              
              <!-- Pre-Draw State -->
              <div *ngIf="drawState() === 'idle'" class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 text-center">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Next in Line</p>
                <div class="flex flex-wrap gap-2 justify-center mb-5">
                  <div *ngFor="let m of eligibleMembers()" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {{ userNames()[m] || m.slice(0, 8) }}
                  </div>
                </div>
                
                <div *ngIf="eligibilityWarnings().length > 0" class="mb-4 text-left p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                  <p class="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">warning</span> Cannot run draw</p>
                  <ul class="list-disc pl-4 text-xs text-amber-700 dark:text-amber-500 space-y-1">
                    <li *ngFor="let w of eligibilityWarnings()">{{ w }}</li>
                  </ul>
                </div>

                <button type="button" class="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all"
                        [ngClass]="eligibilityWarnings().length === 0 ? 'bg-secondary hover:bg-secondary/90 shadow-secondary/30 active:scale-95' : 'bg-slate-400 cursor-not-allowed opacity-50'"
                        [disabled]="eligibilityWarnings().length > 0"
                        (click)="initiateDraw()">
                  Run Cycle {{ committee()!.currentCycle }} Toss
                </button>
              </div>

              <!-- Animating State -->
              <div *ngIf="drawState() === 'animating'" class="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center relative overflow-hidden h-[200px] flex flex-col items-center justify-center">
                <div class="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-50 animate-pulse"></div>
                <span class="material-symbols-outlined text-4xl text-secondary animate-spin mb-4 relative z-10">autorenew</span>
                <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Selecting Winner...</p>
                <p class="text-3xl font-black text-white relative z-10 animate-bounce">{{ currentAnimatedName() }}</p>
              </div>

              <!-- Result State -->
              <div *ngIf="drawState() === 'result'" class="bg-emerald-900 rounded-xl p-8 border border-emerald-800 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/50 animate-scale-up">
                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                <div class="relative z-10">
                  <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/50">
                    <span class="material-symbols-outlined text-3xl text-white">trophy</span>
                  </div>
                  <p class="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Cycle {{ committee()!.currentCycle - 1 }} Winner</p>
                  <p class="text-3xl font-black text-white mb-2">{{ winnerName() }}</p>
                  <p class="text-sm text-emerald-200">Payout of {{ committee()!.currency }} {{ committee()!.contributionAmount * committee()!.maxMembers | number }} recorded.</p>
                  
                  <button (click)="resetDraw()" class="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors backdrop-blur-sm">
                    Continue
                  </button>
                </div>
              </div>
            </div>

            <!-- Non-Creator/Admin View -->
            <div *ngIf="!canExecuteDraw()" class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
              <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">lock</span>
              <p class="text-sm font-bold text-slate-600 dark:text-slate-400">Restricted Action</p>
              <p class="text-xs text-slate-500 mt-1">Only the committee creator or system administrators can execute the payout toss.</p>
            </div>

          </div>

          <!-- Payout Timeline -->
          <div class="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shadow-sm">
            <h3 class="font-h3 text-primary dark:text-white mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-slate-400">history</span> Payout History
            </h3>
            
            <div class="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              <div *ngFor="let p of payouts()" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                <div class="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-secondary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span class="text-[10px] font-bold">{{ p.cycleIndex + 1 }}</span>
                </div>
                <div class="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-bold text-primary dark:text-white">{{ userNames()[p.recipientId] || p.recipientId.slice(0, 8) }}</p>
                    <span class="text-[9px] font-bold uppercase text-slate-400">{{ p.createdAt?.toDate() | date:'MMM d' }}</span>
                  </div>
                  <p class="text-[10px] text-slate-500">{{ p.method === 'creator_first' ? 'Creator Advance' : 'Random Draw' }}</p>
                </div>
              </div>
              <p *ngIf="!payouts().length" class="text-sm text-slate-400 text-center pt-4 relative z-10 bg-white dark:bg-slate-900">No payouts have been executed yet.</p>
            </div>
          </div>
        </aside>

        <!-- Right Column: Transactions & Members -->
        <section class="lg:col-span-7 space-y-6">
          
          <!-- Member Management (Creator Only) -->
          <div *ngIf="isCreator()" class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 class="font-h3 text-primary dark:text-white mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">person_add</span> Manage Members
            </h3>
            <p class="text-sm text-slate-500 mb-5">Directly add a user to this committee using their registered email address.</p>
            
            <div class="flex gap-3 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
              </div>
              <input type="email" #addEmailInput placeholder="Enter user's email address..." 
                     class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                     [disabled]="addMemberBusy()"
                     (keydown.enter)="addMember(addEmailInput.value); addEmailInput.value = ''">
              <button (click)="addMember(addEmailInput.value); addEmailInput.value = ''"
                      [disabled]="addMemberBusy() || !addEmailInput.value"
                      class="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white text-sm font-bold rounded-xl shadow-lg shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                <span *ngIf="addMemberBusy()" class="material-symbols-outlined text-[16px] animate-spin mr-1 align-middle">autorenew</span>
                {{ addMemberBusy() ? 'Adding...' : 'Add Member' }}
              </button>
            </div>
            <div *ngIf="addMemberError()" class="mt-3 p-3 rounded-lg bg-error/10 border border-error/20 flex gap-2 items-start text-error text-xs">
               <span class="material-symbols-outlined text-[16px]">error</span>
               <p>{{ addMemberError() }}</p>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div class="flex justify-between items-end mb-6">
              <h3 class="font-h3 text-primary dark:text-white">Cycle {{ committee()!.currentCycle }} Ledger</h3>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ txs().length }} Records</p>
            </div>
            
            <div class="overflow-x-auto custom-scrollbar">
              <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th class="px-4 py-3">Member</th>
                    <th class="px-4 py-3">Due Date</th>
                    <th class="px-4 py-3">Amount</th>
                    <th class="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
                  <tr *ngFor="let t of txs()" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-4 py-3">
                      <p class="font-semibold text-primary dark:text-white">{{ userNames()[t.userId] || t.userId.slice(0, 8) }}</p>
                    </td>
                    <td class="px-4 py-3 text-xs text-slate-500">{{ t.dueDate | date:'mediumDate' }}</td>
                    <td class="px-4 py-3 font-bold text-primary dark:text-white">{{ t.amount | number }}</td>
                    <td class="px-4 py-3 text-right">
                      <span class="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1" [ngClass]="badge(t.status)">
                        <span class="material-symbols-outlined text-[12px]">{{ statusIcon(t.status) }}</span>
                        {{ t.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="!txs().length">
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400 text-sm border-dashed border border-slate-200 dark:border-slate-800 rounded-xl">
                      No transaction records generated for this cycle yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </section>
      </div>

      <!-- Confirmation Modal -->
      <div *ngIf="showConfirmModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-6 text-center animate-scale-up">
          <div class="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl text-amber-500">warning</span>
          </div>
          <h3 class="font-h3 text-primary dark:text-white mb-2">Execute Cycle {{ committee()!.currentCycle }} Toss?</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">This action is irreversible. The system will randomly select a winner from the remaining eligible members and record the payout.</p>
          <div class="flex gap-3">
            <button (click)="showConfirmModal.set(false)" class="flex-1 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button (click)="confirmAndStartDraw()" class="flex-1 py-2.5 rounded-xl text-white font-bold text-sm bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all active:scale-95">Execute Draw</button>
          </div>
        </div>
      </div>

    </div>
    <ng-template #ghost>
      <div class="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-pulse">
        <span class="material-symbols-outlined text-5xl mb-4 opacity-50">data_usage</span>
        <p class="text-lg font-bold">{{ emptyState() }}</p>
      </div>
    </ng-template>
  `,
})
export class CommitteeDetailComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly committees = inject(CommitteesService);
  private readonly txsSvc = inject(TransactionsService);
  private readonly auth = inject(AuthService);
  private readonly userProfileService = inject(UserProfileService);

  committee = signal<(Committee & { id: string }) | null>(null);
  txs = signal<CommitteeTransaction[]>([]);
  payouts = signal<(PayoutRecord & { id: string })[]>([]);
  emptyState = signal('Loading committee workspace…');
  userNames = signal<Record<string, string>>({});

  // Draw State Management
  drawState = signal<'idle' | 'animating' | 'result'>('idle');
  currentAnimatedName = signal<string>('???');
  winnerName = signal<string>('');
  showConfirmModal = signal(false);

  // Member Management State
  addMemberBusy = signal(false);
  addMemberError = signal('');

  private routeSub?: Subscription;
  private txsSub?: Subscription;
  private animationInterval?: any;

  // Computed signals for eligibility
  completionPercentage = computed(() => {
    const c = this.committee();
    if (!c) return 0;
    return (c.payoutRecipientOrder.length / c.totalCycles) * 100;
  });

  canExecuteDraw = computed(() => {
    const c = this.committee();
    if (!c) return false;
    const uid = this.auth.getUid();
    const isCreator = uid === c.creatorId;
    const isAdmin = this.auth.hasRole('admin');
    return isCreator || isAdmin;
  });

  isCreator = computed(() => {
    const c = this.committee();
    return c ? this.auth.getUid() === c.creatorId : false;
  });

  eligibleMembers = computed(() => {
    const c = this.committee();
    if (!c) return [];
    return (c.memberIds || []).filter(m => !(c.payoutRecipientOrder || []).includes(m));
  });

  eligibilityWarnings = computed(() => {
    const warnings: string[] = [];
    const c = this.committee();
    if (!c) return warnings;

    if (c.status !== 'active') {
      warnings.push(`Committee is currently ${c.status}. Must be active.`);
    }

    if (c.payoutRecipientOrder.length >= c.totalCycles) {
      warnings.push('All cycles have been completed.');
      return warnings; // Stop here if completed
    }

    const currentTxs = this.txs();
    
    // We expect maxMembers number of transactions for the current cycle to exist
    // Note: in a real app, txs should be filtered by current cycle/monthKey.
    // For this demo, we check if there are unpaid transactions globally, which implies current cycle isn't settled.
    const unpaid = currentTxs.filter(t => t.status !== 'paid');
    if (unpaid.length > 0) {
      warnings.push(`${unpaid.length} transaction(s) are still pending or late.`);
    }
    
    // If not enough members
    if ((c.memberIds || []).length < c.maxMembers) {
      warnings.push(`Waiting for ${c.maxMembers - (c.memberIds || []).length} more members to join.`);
    }

    return warnings;
  });

  constructor() {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.txsSub?.unsubscribe();
      void this.hydrate(id);
      this.txsSub = this.txsSvc.observeForCommittee(id).subscribe(rows => this.txs.set(rows));
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.txsSub?.unsubscribe();
    clearInterval(this.animationInterval);
  }

  badge(status: CommitteeTransaction['status']) {
    if (status === 'paid') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (status === 'pending') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    if (status === 'late') return 'bg-error/15 text-error border border-error/20';
    return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }

  statusIcon(status: CommitteeTransaction['status']) {
    if (status === 'paid') return 'check_circle';
    if (status === 'pending') return 'schedule';
    if (status === 'late') return 'warning';
    return 'info';
  }

  private async hydrate(commitId: string) {
    const c = await this.committees.getCommittee(commitId);
    if (!c) {
      this.committee.set(null);
      this.emptyState.set('Committee not found or unavailable.');
      return;
    }
    this.committee.set({ ...c, id: commitId });
    await this.reloadPayouts(commitId);
    await this.loadUserNames(c.memberIds || []);
  }

  private async loadUserNames(userIds: string[]) {
    if (!userIds || userIds.length === 0) return;
    const uniqueIds = Array.from(new Set(userIds));
    const profiles = await Promise.all(uniqueIds.map(id => this.userProfileService.getOnce(id)));
    const newNames = { ...this.userNames() };
    profiles.forEach(p => {
      if (p && p.id) {
        newNames[p.id] = p.displayName || p.email?.split('@')[0] || p.id.slice(0, 8);
      }
    });
    this.userNames.set(newNames);
  }

  private async reloadPayouts(commitId: string) {
    const snap = await getDocs(query(collection(getDb(), 'payouts'), where('committeeId', '==', commitId)));
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<PayoutRecord, 'id'>) }));
    list.sort((a, b) => a.cycleIndex - b.cycleIndex);
    this.payouts.set(list);
  }

  // Draw Execution Workflow
  initiateDraw() {
    if (this.eligibilityWarnings().length > 0) return;
    this.showConfirmModal.set(true);
  }

  async confirmAndStartDraw() {
    this.showConfirmModal.set(false);
    const c = this.committee();
    if (!c) return;

    // Start UI Animation immediately
    this.drawState.set('animating');
    
    const namesList = this.eligibleMembers().map(m => this.userNames()[m] || m.slice(0,8));
    let i = 0;
    this.animationInterval = setInterval(() => {
      this.currentAnimatedName.set(namesList[i % namesList.length]!);
      i++;
    }, 100); // rapidly cycle names

    const isAdmin = this.auth.hasRole('admin');
    
    try {
      const amount = c.contributionAmount * Math.max(1, c.maxMembers);
      // Wait for backend resolution
      const result = await this.committees.runPayoutDraw(c.id, amount, c.currency, this.auth.getUid()!, isAdmin);
      
      // Keep animating for a minimum of 2.5 seconds for suspense
      setTimeout(async () => {
        clearInterval(this.animationInterval);
        if (result) {
          const finalName = this.userNames()[result.recipient] || result.recipient.slice(0,8);
          this.winnerName.set(finalName);
          this.drawState.set('result');
          await this.hydrate(c.id); // reload state
        } else {
          this.resetDraw();
        }
      }, 2500);

    } catch (e: any) {
      clearInterval(this.animationInterval);
      this.resetDraw();
      alert('Draw failed: ' + (e.message || 'Unknown error'));
    }
  }

  resetDraw() {
    this.drawState.set('idle');
    this.winnerName.set('');
    this.currentAnimatedName.set('???');
  }

  // Member Management Workflow
  async addMember(email: string) {
    if (!email) return;
    const c = this.committee();
    if (!c) return;
    
    this.addMemberBusy.set(true);
    this.addMemberError.set('');
    
    try {
      await this.committees.addMemberByEmail(c.id, email, this.auth.getUid()!);
      await this.hydrate(c.id); // Reload committee to show updated capacity
      this.addMemberError.set(''); // Clear any errors if successful
    } catch (e: any) {
      this.addMemberError.set(e.message || 'Failed to add member. Make sure the email is registered.');
    } finally {
      this.addMemberBusy.set(false);
    }
  }
}
