import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../core/services/notifications.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import type { AppNotification } from '../../core/models/trustcircle.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h2 class="font-h1 text-primary dark:text-white">Notifications</h2>
        <p class="text-slate-500">Committee, payments, fraud desk, and onboarding updates.</p>
      </div>

      <div class="space-y-3">
        <div
          *ngFor="let note of items()"
          class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex justify-between gap-4"
        >
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-widest text-slate-400">{{ note.type }}</p>
            <h3 class="font-semibold text-primary dark:text-white">{{ note.title }}</h3>
            <p class="text-sm text-slate-500">{{ note.body }}</p>
          </div>
          <div class="text-right flex flex-col items-end gap-2">
            <span class="text-[10px] font-bold uppercase" [class.text-error]="note.type === 'fraud'" [class.text-secondary]="note.type !== 'fraud'">
              {{ note.read ? 'Read' : 'New' }}
            </span>
            <button type="button" class="text-xs underline" *ngIf="!note.read" (click)="mark(note)">Dismiss</button>
          </div>
        </div>
        <div *ngIf="!items().length" class="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          Quiet inbox ✨
        </div>
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnDestroy {
  private readonly notifications = inject(NotificationsService);
  private readonly auth = inject(AuthService);

  items = signal<AppNotification[]>([]);

  private sub?: Subscription;

  constructor() {
    const uid = this.auth.getUid();
    if (!uid) return;
    this.sub = this.notifications.observeMine(uid).subscribe(rows => this.items.set(rows));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  mark(note: AppNotification) {
    void this.notifications.markRead(note.id);
  }
}
