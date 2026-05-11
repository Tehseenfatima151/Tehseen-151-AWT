import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommitteesService } from '../../core/services/committees.service';
import { AuthService } from '../../core/services/auth.service';
import type { Committee } from '../../core/models/trustcircle.models';
import { Router } from '@angular/router';
import { isFirebaseConfigured } from '../../../environments/environment';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-committees-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="font-h1 text-primary dark:text-white">Committees</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Operate your circles, onboard members, and steward payouts.</p>
        </div>
        <button class="btn-primary" routerLink="/committees/create">
          <span class="material-symbols-outlined text-sm">add</span> New committee
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section class="xl:col-span-2 space-y-8">
          
          <!-- My Committees -->
          <div class="space-y-4">
            <h3 class="font-h3 text-primary dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">verified_user</span>
              Your Committees
            </h3>
            
            <article
              *ngFor="let committee of myCommittees()"
              class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:border-emerald-400/40 transition-colors relative overflow-hidden"
            >
              <div class="absolute top-0 right-0 pt-6 pr-6">
                <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{{ committee.status | uppercase }}</span>
              </div>
              
              <div class="flex flex-wrap justify-between gap-4 mt-1">
                <div class="pr-20">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
                          [ngClass]="committee.isCreator ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'">
                      {{ committee.isCreator ? 'Creator' : 'Member' }}
                    </span>
                  </div>
                  <h3 class="font-h3 text-primary dark:text-white">{{ committee.name }}</h3>
                  <p class="text-sm text-slate-500 mt-1">{{ committee.description || 'No memo provided' }}</p>
                </div>
              </div>
              <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Seat cap</dt>
                  <dd>{{ committee.memberIds?.length ?? 0 }} / {{ committee.maxMembers }}</dd>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Monthly</dt>
                  <dd class="text-secondary font-semibold">{{ committee.contributionAmount | currency:committee.currency }}</dd>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Invite</dt>
                  <dd class="font-mono text-xs">{{ committee.inviteCode }}</dd>
                </div>
                <div class="flex items-end">
                  <a [routerLink]="['/committees', committee.id]" class="text-sm font-bold text-primary dark:text-white hover:text-secondary underline transition-colors">Open cockpit</a>
                </div>
              </dl>
              <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-sm">
                 <span class="text-slate-400">Created by: </span>
                 <span class="font-bold text-primary dark:text-white">{{ committee.creatorName || 'Loading...' }}</span>
              </div>
            </article>

            <div
              *ngIf="!myCommittees().length"
              class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 py-12 text-center space-y-4"
            >
              <span class="material-symbols-outlined text-4xl text-slate-300">groups</span>
              <p class="text-slate-500">You haven't joined any committees yet.</p>
            </div>
          </div>

          <!-- Discover Committees -->
          <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 class="font-h3 text-primary dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">explore</span>
              Discover Public Committees
            </h3>
            
            <article
              *ngFor="let committee of availableCommittees()"
              class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-colors"
            >
              <div class="flex flex-wrap justify-between gap-4">
                <div>
                  <h3 class="font-h3 text-primary dark:text-white">{{ committee.name }}</h3>
                  <p class="text-sm text-slate-500 mt-1">{{ committee.description || 'Public committee open for members' }}</p>
                </div>
                <button 
                  (click)="joinWithCode(committee.inviteCode)"
                  class="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50"
                  [disabled]="joinBusy()"
                >
                  Join Circle
                </button>
              </div>
              <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Seats Left</dt>
                  <dd>{{ committee.maxMembers - (committee.memberIds?.length || 0) }} Available</dd>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Duration</dt>
                  <dd>{{ committee.totalCycles || committee.maxMembers }} Months</dd>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Monthly</dt>
                  <dd class="text-primary dark:text-white font-bold">{{ committee.contributionAmount | currency:committee.currency }}</dd>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Invite Code</dt>
                  <dd class="font-mono text-xs mt-0.5 tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{{ committee.inviteCode }}</dd>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs uppercase font-bold">Payout</dt>
                  <dd class="text-emerald-500 font-bold">{{ (committee.contributionAmount * committee.maxMembers) | currency:committee.currency }}</dd>
                </div>
              </dl>
              <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-sm">
                 <span class="text-slate-400">Created by: </span>
                 <span class="font-bold text-primary dark:text-white">{{ committee.creatorName || 'Loading...' }}</span>
              </div>
            </article>

            <div
              *ngIf="!availableCommittees().length"
              class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 py-12 text-center space-y-2"
            >
              <p class="text-slate-500 text-sm">No available public committees right now.</p>
            </div>
          </div>

        </section>

        <aside class="space-y-6">
          <div class="rounded-2xl bg-primary-container text-white p-6 space-y-4">
            <div>
              <h3 class="font-h3 mb-1">Join via invite</h3>
              <p class="text-sm text-white/80">Paste a private invite code from your chairperson.</p>
            </div>
            <form class="space-y-3" [formGroup]="inviteForm" (ngSubmit)="joinFromForm()">
              <input
                class="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm uppercase tracking-widest text-white placeholder-white/40 outline-none focus:border-secondary transition-colors"
                formControlName="code"
                placeholder="CODE"
              />
              <button type="submit" class="w-full bg-secondary hover:bg-emerald-600 text-slate-900 font-bold rounded-xl py-3 transition-colors" [disabled]="inviteForm.invalid || joinBusy()">
                {{ joinBusy() ? 'Joining...' : 'Authenticate & join' }}
              </button>
              <p class="text-[11px] text-red-400" *ngIf="joinError()">{{ joinError() }}</p>
            </form>
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class CommitteesListComponent implements OnDestroy {
  private readonly committeesSvc = inject(CommitteesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly userProfile = inject(UserProfileService);

  myCommittees = signal<(Committee & { id: string; creatorName?: string; isCreator?: boolean })[]>([]);
  availableCommittees = signal<(Committee & { id: string; creatorName?: string })[]>([]);
  
  joinBusy = signal(false);
  joinError = signal<string | undefined>(undefined);

  readonly inviteForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
  });

  private subMine?: Subscription;
  private subAvailable?: Subscription;

  constructor() {
    const uid = this.auth.getUid();
    if (!uid) {
      return;
    }
    
    this.subMine = this.committeesSvc.listMine(uid).subscribe(async rows => {
      const enrichedRows = await Promise.all(rows.map(async (c) => {
        if (c.creatorId === uid) {
          return { ...c, creatorName: 'You', isCreator: true };
        }
        const profile = await this.userProfile.getOnce(c.creatorId);
        return {
          ...c,
          creatorName: profile?.displayName || 'Unknown User',
          isCreator: false
        };
      }));
      this.myCommittees.set(enrichedRows);
    });

    this.subAvailable = this.committeesSvc.listAvailable(uid).subscribe(async rows => {
      // Fetch creator names for each available committee
      const enrichedRows = await Promise.all(rows.map(async (c) => {
        const profile = await this.userProfile.getOnce(c.creatorId);
        return {
          ...c,
          creatorName: profile?.displayName || 'Unknown User'
        };
      }));
      this.availableCommittees.set(enrichedRows);
    });
  }

  ngOnDestroy(): void {
    this.subMine?.unsubscribe();
    this.subAvailable?.unsubscribe();
  }

  joinFromForm() {
    this.joinWithCode(this.inviteForm.getRawValue().code);
  }

  async joinWithCode(code: string) {
    if (!isFirebaseConfigured()) {
      this.joinError.set('Firebase not configured.');
      return;
    }
    const uid = this.auth.getUid();
    if (!uid) return;
    
    this.joinBusy.set(true);
    this.joinError.set(undefined);
    try {
      const id = await this.committeesSvc.joinByInvite(uid, code.trim());
      if (!id) {
        this.joinError.set('Invalid code');
        return;
      }
      await this.router.navigate(['/committees', id]);
    } catch (e) {
      this.joinError.set(e instanceof Error ? e.message : 'Unable to join');
    } finally {
      this.joinBusy.set(false);
    }
  }
}
