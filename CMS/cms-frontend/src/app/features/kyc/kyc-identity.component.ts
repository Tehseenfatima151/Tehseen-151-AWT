import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StorageUploadService } from '../../core/services/storage-upload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { isFirebaseConfigured } from '../../../environments/environment';

type DocKind = 'cnic' | 'selfie' | 'address';

@Component({
  selector: 'app-kyc-identity',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressBarModule],
  template: `
    <section class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-2 border border-outline-variant/30 dark:border-slate-800 p-8 md:p-10 space-y-8">
      <div class="space-y-2">
        <h2 class="font-h3 text-primary dark:text-white">Identity verification</h2>
        <p class="text-sm text-on-surface-variant dark:text-slate-400">
          Encrypted transport to Firebase Storage. Clear photos reduce compliance holds.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div *ngFor="let item of uploads" class="border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-4 bg-surface-container-low dark:bg-slate-950/60">
          <div class="flex items-center gap-3 mb-3">
            <span class="material-symbols-outlined text-primary">{{ item.icon }}</span>
            <div class="flex-1">
              <p class="font-label-md text-primary dark:text-white">{{ item.title }}</p>
              <p class="text-[11px] text-on-surface-variant dark:text-slate-400">{{ item.sub }}</p>
            </div>
            <button
              type="button"
              class="text-secondary text-xs font-bold uppercase tracking-wide hover:underline"
              (click)="activeKind = item.kind; picker.click()"
            >
              Choose
            </button>
          </div>
          <div *ngIf="urls[item.kind]" class="rounded-xl overflow-hidden border border-outline-variant/20 relative">
            <img [src]="urls[item.kind]" class="w-full max-h-44 object-cover bg-slate-900" [alt]="item.title" [class.opacity-50]="loadingKind === item.kind" />
            <div *ngIf="loadingKind === item.kind" class="absolute inset-0 flex items-center justify-center bg-black/20">
              <span class="text-white font-bold text-lg drop-shadow-md">{{ progress[item.kind] }}%</span>
            </div>
          </div>
          <mat-progress-bar *ngIf="loadingKind === item.kind" mode="determinate" [value]="progress[item.kind]" class="mt-2"></mat-progress-bar>
        </div>
      </div>

      <input
        #picker
        type="file"
        class="hidden"
        [accept]="'image/*,.pdf'"
        (change)="picked($event)"
      />

      <p *ngIf="error" class="text-sm text-error">{{ error }}</p>

      <div class="pt-6 border-t border-outline-variant/30 dark:border-slate-800 flex justify-between items-center">
        <button type="button" class="text-sm underline text-on-surface-variant" routerLink="/kyc/financial">Back</button>
        <button type="button" class="btn-primary px-8 py-3 rounded-xl" [disabled]="busy || missing()" (click)="continueStep()">
          Continue
        </button>
      </div>
    </section>
  `,
})
export class KycIdentityComponent {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageUploadService);
  private readonly router = inject(Router);

  activeKind: DocKind = 'cnic';

  readonly uploads: { kind: DocKind; icon: string; title: string; sub: string }[] = [
    { kind: 'cnic', icon: 'badge', title: 'National ID', sub: 'Government issued' },
    { kind: 'selfie', icon: 'face_retouching_natural', title: 'Live selfie', sub: 'Neutral background' },
    { kind: 'address', icon: 'home_pin', title: 'Proof of address', sub: '≤ 90 days old' },
  ];

  urls: Record<DocKind, string> = { cnic: '', selfie: '', address: '' };
  progress: Record<DocKind, number> = { cnic: 0, selfie: 0, address: 0 };
  busy = false;
  error?: string;
  loadingKind: DocKind | null = null;

  constructor() {
    const id = this.auth.firestoreUser()?.identity ?? this.auth.currentUser()?.identity;
    if (id?.cnicUrl) this.urls.cnic = id.cnicUrl;
    if (id?.selfieUrl) this.urls.selfie = id.selfieUrl;
    if (id?.addressProofUrl) this.urls.address = id.addressProofUrl;
  }

  missing() {
    return !this.urls.cnic || !this.urls.selfie || !this.urls.address;
  }

  picked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    (ev.target as HTMLInputElement).value = '';
    if (!file) {
      return;
    }
    void this.handleFile(this.activeKind, file);
  }

  private async handleFile(kind: DocKind, file: File) {
    this.loadingKind = kind;
    this.busy = true;
    this.error = undefined;
    this.progress[kind] = 0;
    
    // Create local preview
    const localUrl = URL.createObjectURL(file);
    this.urls = { ...this.urls, [kind]: localUrl };

    try {
      const uid = this.auth.getUid();
      if (!uid) throw new Error('Not signed in');

      const map = {
        cnic: 'cnic' as const,
        selfie: 'selfie' as const,
        address: 'address' as const,
      };
      
      const uploaded = await this.storage.uploadProof(
        uid, 
        map[kind], 
        file,
        (p) => this.progress[kind] = p
      );
      
      // Update with final Cloudinary URL
      this.urls = { ...this.urls, [kind]: uploaded.url };
      URL.revokeObjectURL(localUrl);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Upload failed';
      // Revert preview on failure
      this.urls = { ...this.urls, [kind]: '' };
    } finally {
      this.busy = false;
      this.loadingKind = null;
    }
  }

  async continueStep() {
    const uid = this.auth.getUid();
    if (!uid) {
      return;
    }
    if (this.missing()) {
      this.error = 'All three documents are required.';
      return;
    }
    // Prevent continue if a file is currently uploading
    if (this.loadingKind) {
      return;
    }
    this.busy = true;
    try {
      await this.auth.saveKycIdentity(uid, {
        cnicUrl: this.urls.cnic,
        selfieUrl: this.urls.selfie,
        addressProofUrl: this.urls.address,
      });
      await this.router.navigateByUrl('/kyc/review');
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unable to continue';
    } finally {
      this.busy = false;
    }
  }
}
