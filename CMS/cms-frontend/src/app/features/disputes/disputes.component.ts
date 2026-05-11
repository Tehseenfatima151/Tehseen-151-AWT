import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { addDoc, collection, onSnapshot, query, serverTimestamp, where, type Unsubscribe } from 'firebase/firestore';
import { AuthService } from '../../core/services/auth.service';
import type { Dispute } from '../../core/models/trustcircle.models';
import { getDb } from '../../core/firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';

@Component({
  selector: 'app-disputes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in stagger-1 max-w-[900px]">
      <div>
        <h2 class="font-h1 text-primary dark:text-white">Disputes & arbitration</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          File a dispute for missed payouts, contested contributions, or identity concerns. Assigned admins adjudicate inline.
        </p>
      </div>

      <section class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 shadow-level-1">
        <h3 class="font-h3 text-primary dark:text-white mb-4">Raise a dispute</h3>
        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block space-y-2">
            <span class="text-xs uppercase text-slate-500 font-semibold">Title</span>
            <input class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="title" />
          </label>
          <label class="block space-y-2">
            <span class="text-xs uppercase text-slate-500 font-semibold">Details</span>
            <textarea rows="4" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" formControlName="description"></textarea>
          </label>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || busy()">Submit case</button>
          <p *ngIf="message()" class="text-sm text-secondary">{{ message() }}</p>
          <p *ngIf="error()" class="text-sm text-error">{{ error() }}</p>
        </form>
      </section>

      <section class="space-y-3">
        <h3 class="font-h3 text-primary dark:text-white">Your cases</h3>
        <div *ngIf="!cases().length" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500">
          No disputes yet.
        </div>
        <div *ngFor="let c of cases()" class="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="flex justify-between gap-4">
            <div>
              <p class="text-xs uppercase text-slate-400 font-bold">{{ c.status }}</p>
              <h4 class="font-semibold text-primary dark:text-white mt-1">{{ c.title }}</h4>
              <p class="text-sm text-slate-500 mt-2">{{ c.description }}</p>
            </div>
            <span class="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{{ c.priority }}</span>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DisputesComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });

  readonly cases = signal<Dispute[]>([]);
  busy = signal(false);
  message = signal<string | undefined>(undefined);
  error = signal<string | undefined>(undefined);

  private unsub?: Unsubscribe;

  constructor() {
    const uid = this.auth.getUid();
    if (!uid || !isFirebaseConfigured()) {
      return;
    }
    const qy = query(collection(getDb(), 'disputes'), where('createdBy', '==', uid));
    this.unsub = onSnapshot(qy, snap => {
      const rows = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Dispute, 'id'>),
      }));
      rows.sort((a, b) => b.id.localeCompare(a.id));
      this.cases.set(rows);
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  async submit() {
    if (this.form.invalid) {
      return;
    }
    const uid = this.auth.getUid();
    if (!uid) {
      this.error.set('Not signed in');
      return;
    }
    if (!isFirebaseConfigured()) {
      this.cases.update(list => [
        {
          id: `local_${Date.now()}`,
          title: this.form.value.title!,
          description: this.form.value.description!,
          createdBy: uid,
          status: 'open',
          priority: 'medium',
        },
        ...list,
      ]);
      this.form.reset();
      this.message.set('Saved locally — connect Firebase for persistence.');
      return;
    }
    this.busy.set(true);
    this.error.set(undefined);
    this.message.set(undefined);
    try {
      await addDoc(collection(getDb(), 'disputes'), {
        ...this.form.getRawValue(),
        createdBy: uid,
        status: 'open',
        priority: 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      this.form.reset();
      this.message.set('Dispute queued for admin review.');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unable to submit');
    } finally {
      this.busy.set(false);
    }
  }
}
