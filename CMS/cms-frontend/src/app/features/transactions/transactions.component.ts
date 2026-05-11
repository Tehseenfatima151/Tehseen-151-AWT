import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { TransactionsService } from '../../core/services/transactions.service';
import { CommitteesService } from '../../core/services/committees.service';
import { StorageUploadService } from '../../core/services/storage-upload.service';
import { TrustAndFraudService } from '../../core/services/trust-and-fraud.service';
import { AuthService } from '../../core/services/auth.service';
import type { Committee, CommitteeTransaction } from '../../core/models/trustcircle.models';
import { NotificationsService } from '../../core/services/notifications.service';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-up">
        <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <p class="text-xs uppercase tracking-widest text-slate-400">Rolling volume</p>
          <p class="text-3xl font-black text-secondary mt-3">{{ totals().volume | currency }}</p>
        </div>
        <div class="rounded-2xl border border-amber-200/40 bg-amber-500/10 p-6">
          <p class="text-xs uppercase tracking-widest text-amber-700">Pending</p>
          <p class="text-3xl font-black text-warning mt-3">{{ totals().pending }}</p>
        </div>
        <div class="rounded-2xl border border-error/30 bg-error/10 p-6">
          <p class="text-xs uppercase tracking-widest text-error">Late / missed</p>
          <p class="text-3xl font-black text-error mt-3">{{ totals().risk }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section class="lg:col-span-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-level-1">
            <h3 class="font-h3 text-primary dark:text-white mb-4">Record contribution</h3>
            <form class="space-y-4 text-sm" [formGroup]="form" (ngSubmit)="submit()">
              <label class="block space-y-2 font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wide">
                Committee
                <select formControlName="committeeId" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="">Select circle</option>
                  <option *ngFor="let c of committees()" [value]="c.id">{{ c.name }}</option>
                </select>
              </label>
              <label class="block space-y-2 font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wide">
                Contributor UID (Firestore)
                <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="memberId" />
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block space-y-2 font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wide">
                  Amount $
                  <input type="number" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="amount" />
                </label>
                <label class="block space-y-2 font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wide">
                  Due date
                  <input type="date" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="dueDate" />
                </label>
              </div>
              <label class="block space-y-2 font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wide">
                Status
                <select formControlName="status" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="late">Late</option>
                  <option value="missed">Missed</option>
                </select>
              </label>

              <label class="block space-y-2 font-semibold text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wide">
                Receipt / proof
                <input type="file" class="w-full text-xs" accept="image/*,.pdf" (change)="onFile($event)" />
              </label>

              <div *ngIf="previewUrl()" class="rounded-xl overflow-hidden border border-outline-variant/20 relative mt-2">
                <img [src]="previewUrl()" class="w-full max-h-44 object-cover bg-slate-900" alt="Proof preview" [class.opacity-50]="busy()" />
                <div *ngIf="busy()" class="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span class="text-white font-bold text-lg drop-shadow-md">{{ uploadProgress() }}%</span>
                </div>
                <div *ngIf="busy()" class="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" [style.width.%]="uploadProgress()"></div>
              </div>

              <button type="submit" class="w-full btn-primary py-4" [disabled]="form.invalid || busy()">Submit treasury record</button>
              <p *ngIf="formError()" class="text-xs text-error">{{ formError() }}</p>
              <p *ngIf="formSuccess()" class="text-xs text-secondary">{{ formSuccess() }}</p>
            </form>
          </div>
        </section>

        <section class="lg:col-span-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-level-1">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-h3 text-primary dark:text-white">Ledger</h3>
            <span class="text-[11px] uppercase text-slate-400">{{ txRows().length }} rows</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-950 text-[11px] uppercase text-slate-400 tracking-wider">
                <tr>
                  <th class="px-6 py-3">Contributor</th>
                  <th class="px-6 py-3">Cycle</th>
                  <th class="px-6 py-3">Amount</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3">Proof</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-900">
                <tr *ngFor="let txn of txRows()" class="hover:bg-slate-50/80 dark:hover:bg-slate-950/40 transition-colors">
                  <td class="px-6 py-4 font-mono">{{ userNames()[txn.userId] || txn.userId.slice(0, 8) }}</td>
                  <td class="px-6 py-4 text-xs text-slate-500">{{ txn.monthKey }}</td>
                  <td class="px-6 py-4 font-bold">{{ txn.amount | currency }}</td>
                  <td class="px-6 py-4 capitalize text-[11px] font-black">{{ txn.status }}</td>
                  <td class="px-6 py-4">
                    <a *ngIf="txn.proofUrl" class="underline text-xs" target="_blank" rel="noopener" [href]="txn.proofUrl">Evidence</a>
                    <span *ngIf="!txn.proofUrl" class="text-xs text-slate-400">n/a</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="!txRows().length" class="py-14 text-center text-slate-500 text-sm italic">Quiet ledger · add your committee's first payout above.</div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class TransactionsComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly txsSvc = inject(TransactionsService);
  private readonly committeesSvc = inject(CommitteesService);
  private readonly uploads = inject(StorageUploadService);
  private readonly risk = inject(TrustAndFraudService);
  private readonly notifier = inject(NotificationsService);
  private readonly auth = inject(AuthService);
  private readonly userProfileService = inject(UserProfileService);

  committees = signal<(Committee & { id: string })[]>([]);
  txRows = signal<CommitteeTransaction[]>([]);
  busy = signal(false);
  formError = signal<string | undefined>(undefined);
  formSuccess = signal<string | undefined>(undefined);
  totals = signal({ volume: 0, pending: 0, risk: 0 });
  userNames = signal<Record<string, string>>({});

  uploadProgress = signal<number>(0);
  previewUrl = signal<string | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    committeeId: ['', Validators.required],
    memberId: ['', Validators.required],
    amount: [250, Validators.required],
    dueDate: ['', Validators.required],
    status: ['paid', Validators.required],
  });

  private file?: File;

  private subs = new Subscription();

  constructor() {
    const uid = this.auth.getUid();
    if (!uid) return;

    const committee$ = this.committeesSvc.listMine(uid).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.subs.add(committee$.subscribe(rows => this.committees.set(rows)));
    this.subs.add(
      committee$.pipe(
        switchMap(list => {
          const ids = list.map(c => c.id);
          if (!ids.length) {
            return of<CommitteeTransaction[]>([]);
          }
          return combineLatest(ids.map(id => this.txsSvc.observeForCommittee(id))).pipe(
            map(groups => groups.flat().sort((a, b) => b.monthKey.localeCompare(a.monthKey))),
          );
        }),
      ).subscribe(rows => {
        this.txRows.set(rows);
        this.recalcTotals(rows);
        void this.loadUserNames(rows.map(r => r.userId));
      }),
    );

    const today = new Date().toISOString().substring(0, 10);
    this.form.patchValue({ dueDate: today });
    this.form.patchValue({
      memberId: uid,
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onFile(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    this.file = f ?? undefined;
    if (this.file) {
      if (this.file.type.startsWith('image/')) {
        this.previewUrl.set(URL.createObjectURL(this.file));
      } else {
        this.previewUrl.set(undefined);
      }
    } else {
      this.previewUrl.set(undefined);
    }
  }

  private recalcTotals(rows: CommitteeTransaction[]) {
    const uid = this.auth.getUid();
    
    let volume = 0;
    // Calculate total rolling volume from all paid transactions in the user's committees
    rows.forEach(r => {
      if (r.status === 'paid') volume += r.amount;
    });

    let pending = 0;
    let risk = 0;

    if (uid) {
      const now = new Date();
      const todayDate = now.getDate();

      const activeCommittees = this.committees().filter(c => c.status === 'active');
      const userTxs = rows.filter(r => r.userId === uid);

      activeCommittees.forEach(c => {
        // Check if the user has made enough paid transactions to cover the current cycle
        const userPaidTxs = userTxs.filter(t => 
          t.committeeId === c.id && 
          t.status === 'paid'
        );

        const hasPaidCurrentCycle = userPaidTxs.length >= (c.currentCycle || 1);

        if (!hasPaidCurrentCycle) {
          const dueDay = c.monthlyDueDay || 5;
          if (todayDate > dueDay) {
            risk += 1; // Late
          } else {
            pending += 1; // Pending
          }
        }
      });
    }

    this.totals.set({ volume, pending, risk });
  }

  private async loadUserNames(userIds: string[]) {
    if (!userIds || userIds.length === 0) return;
    const uniqueIds = Array.from(new Set(userIds));
    const profiles = await Promise.all(
      uniqueIds.map(id => this.userProfileService.getOnce(id))
    );
    const newNames = { ...this.userNames() };
    profiles.forEach(p => {
      if (p && p.id) {
        newNames[p.id] = p.displayName || p.email?.split('@')[0] || p.id.slice(0, 8);
      }
    });
    this.userNames.set(newNames);
  }

  async submit() {
    const uidOps = this.auth.getUid();
    if (!uidOps || this.form.invalid) return;

    const { committeeId, memberId, amount, dueDate, status } = this.form.getRawValue();
    this.busy.set(true);
    this.formError.set(undefined);
    this.formSuccess.set(undefined);

    const monthKey = dueDate.slice(0, 7);

    try {
      let proofUrl = '';
      let proofHash = '';
      if (this.file) {
        this.uploadProgress.set(0);
        proofHash = await this.uploads.calculateHash(this.file);
        const upload = await this.uploads.uploadProof(
          memberId === uidOps ? uidOps : memberId, 
          'payment', 
          this.file,
          (p) => this.uploadProgress.set(p)
        );
        proofUrl = upload.url;
      }

      await this.txsSvc.recordContribution({
        committeeId,
        userId: memberId,
        amount,
        currency: 'USD',
        dueDate,
        paidAt: status === 'paid' ? new Date().toISOString() : undefined,
        status: status as CommitteeTransaction['status'],
        proofUrl,
        proofHash,
        monthKey,
      });

      await this.risk.syncScoresAndFlags(memberId);
      await this.notifier.push({
        userId: memberId,
        title: 'Contribution logged',
        body: `Recorded ${monthKey} for committee ${committeeId.slice(0, 6)}…`,
        type: 'payment',
      });

      this.formSuccess.set('Synced to TrustCircle treasury mesh.');
      this.file = undefined;
      this.previewUrl.set(undefined);
      this.uploadProgress.set(0);
    } catch (e) {
      this.formError.set(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      this.busy.set(false);
    }
  }
}
