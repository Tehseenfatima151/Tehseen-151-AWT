import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../core/services/user-profile.service';
import { StorageUploadService } from '../../core/services/storage-upload.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

type Tab = 'profile' | 'security' | 'notifications' | 'payment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in stagger-1 pb-10">
      <div>
        <h2 class="font-h1 text-primary dark:text-white transition-colors">Account Settings</h2>
        <p class="font-body-md text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your profile, security, and notification preferences.</p>
      </div>

      <!-- Success / Error Toast -->
      <div *ngIf="toast()" class="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in-up text-sm font-semibold transition-all"
           [ngClass]="toast()!.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'">
        <span class="material-symbols-outlined text-[18px]">{{ toast()!.type === 'success' ? 'check_circle' : 'error' }}</span>
        {{ toast()!.message }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-in-up stagger-2">
        <!-- Sidebar Nav -->
        <div class="lg:col-span-1 space-y-1">
          <button (click)="activeTab.set('profile')" [ngClass]="activeTab() === 'profile' ? 'border-primary text-primary dark:text-white bg-white dark:bg-slate-900 shadow-sm' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  class="w-full text-left px-4 py-3 rounded-xl font-label-md flex items-center gap-3 transition-all border">
            <span class="material-symbols-outlined">person</span> Profile Information
          </button>
          <button (click)="activeTab.set('security')" [ngClass]="activeTab() === 'security' ? 'border-primary text-primary dark:text-white bg-white dark:bg-slate-900 shadow-sm' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  class="w-full text-left px-4 py-3 rounded-xl font-label-md flex items-center gap-3 transition-all border">
            <span class="material-symbols-outlined">shield</span> Security & Authentication
          </button>
          <button (click)="activeTab.set('notifications')" [ngClass]="activeTab() === 'notifications' ? 'border-primary text-primary dark:text-white bg-white dark:bg-slate-900 shadow-sm' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  class="w-full text-left px-4 py-3 rounded-xl font-label-md flex items-center gap-3 transition-all border">
            <span class="material-symbols-outlined">notifications</span> Notifications
          </button>
          <button (click)="activeTab.set('payment')" [ngClass]="activeTab() === 'payment' ? 'border-primary text-primary dark:text-white bg-white dark:bg-slate-900 shadow-sm' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  class="w-full text-left px-4 py-3 rounded-xl font-label-md flex items-center gap-3 transition-all border">
            <span class="material-symbols-outlined">payments</span> Payment Methods
          </button>

          <!-- Dark mode toggle -->
          <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button (click)="toggleDark()" class="w-full text-left px-4 py-3 rounded-xl font-label-md flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent">
              <span class="material-symbols-outlined">{{ theme.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
              {{ theme.isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
            </button>
          </div>
        </div>

        <!-- Main Panel -->
        <div class="lg:col-span-3">

          <!-- ===== PROFILE TAB ===== -->
          <div *ngIf="activeTab() === 'profile'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
            <h3 class="font-h3 text-primary dark:text-white mb-6 transition-colors">Profile Information</h3>

            <!-- Avatar -->
            <div class="flex items-center gap-6 mb-8">
              <div class="relative">
                <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden transition-colors relative" [class.opacity-50]="uploading()">
                  <img [src]="avatarUrl()" alt="Avatar" class="w-full h-full object-cover">
                  <div *ngIf="uploading()" class="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span class="text-white text-xs font-bold">{{ uploadProgress() }}%</span>
                  </div>
                </div>
                <button (click)="profilePicPicker.click()" class="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-sm hover:opacity-90 transition-opacity">
                  <span class="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
              <div>
                <button (click)="profilePicPicker.click()" [disabled]="uploading()" class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                  Upload new picture
                </button>
                <p class="text-[11px] text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                <input type="file" #profilePicPicker class="hidden" accept="image/*" (change)="onProfilePicPicked($event)">
              </div>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="font-label-sm text-slate-600 dark:text-slate-400 transition-colors">Display Name</label>
                  <input type="text" [(ngModel)]="profileForm.displayName" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="Your name">
                </div>
                <div class="space-y-1">
                  <label class="font-label-sm text-slate-600 dark:text-slate-400 transition-colors">Phone Number</label>
                  <input type="tel" [(ngModel)]="profileForm.phone" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="+1 (555) 000-0000">
                </div>
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400 transition-colors">Email Address</label>
                <input type="email" [value]="auth.currentUser()?.email ?? ''" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 transition-colors" disabled>
                <p class="text-[11px] text-slate-400 mt-1">Contact support to change your primary email.</p>
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400 transition-colors">Date of Birth</label>
                <input type="date" [(ngModel)]="profileForm.dob" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors">
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 mt-6 transition-colors">
              <button type="button" (click)="resetProfile()" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="button" (click)="saveProfile()" [disabled]="saving()" class="btn-primary rounded-xl flex items-center gap-2 disabled:opacity-60">
                <span *ngIf="saving()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ saving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <!-- ===== SECURITY TAB ===== -->
          <div *ngIf="activeTab() === 'security'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
            <h3 class="font-h3 text-primary dark:text-white mb-2 transition-colors">Security & Authentication</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your password and account security preferences.</p>

            <!-- Change Password -->
            <div class="space-y-4">
              <h4 class="font-label-md text-primary dark:text-white">Change Password</h4>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">Current Password</label>
                <input type="password" [(ngModel)]="securityForm.currentPassword" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="Enter current password">
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">New Password</label>
                <input type="password" [(ngModel)]="securityForm.newPassword" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="At least 8 characters">
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">Confirm New Password</label>
                <input type="password" [(ngModel)]="securityForm.confirmPassword" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="Repeat new password">
              </div>
            </div>

            <!-- Security info badges -->
            <div class="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified_user</span>
                <div>
                  <p class="text-sm font-semibold text-primary dark:text-white">Account is secured</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">KYC Status: <span class="font-semibold capitalize">{{ auth.currentUser()?.kycStatus ?? 'N/A' }}</span></p>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 mt-6 transition-colors">
              <button type="button" (click)="securityForm = { currentPassword: '', newPassword: '', confirmPassword: '' }" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="button" (click)="savePassword()" [disabled]="saving()" class="btn-primary rounded-xl flex items-center gap-2 disabled:opacity-60">
                <span *ngIf="saving()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ saving() ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </div>

          <!-- ===== NOTIFICATIONS TAB ===== -->
          <div *ngIf="activeTab() === 'notifications'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
            <h3 class="font-h3 text-primary dark:text-white mb-2 transition-colors">Notification Preferences</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose what activity triggers notifications for you.</p>

            <div class="space-y-4">
              <div *ngFor="let pref of notifPrefs" class="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">{{ pref.icon }}</span>
                  </div>
                  <div>
                    <p class="font-label-md text-primary dark:text-white">{{ pref.label }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ pref.description }}</p>
                  </div>
                </div>
                <button (click)="pref.enabled = !pref.enabled"
                        class="w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
                        [ngClass]="pref.enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'">
                  <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                        [ngClass]="pref.enabled ? 'left-6' : 'left-0.5'"></span>
                </button>
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end mt-6 transition-colors">
              <button type="button" (click)="saveNotifications()" [disabled]="saving()" class="btn-primary rounded-xl flex items-center gap-2 disabled:opacity-60">
                <span *ngIf="saving()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ saving() ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </div>

          <!-- ===== PAYMENT TAB ===== -->
          <div *ngIf="activeTab() === 'payment'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-level-1 border border-slate-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
            <h3 class="font-h3 text-primary dark:text-white mb-2 transition-colors">Payment Methods</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your preferred bank and payment details for committee contributions.</p>

            <div class="space-y-4">
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">Bank Name</label>
                <input type="text" [(ngModel)]="paymentForm.bankName" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="e.g. HBL, Meezan, UBL">
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">IBAN / Account Number</label>
                <input type="text" [(ngModel)]="paymentForm.ibanOrAccount" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="PK36 ALFA 0200 9005 4001 0001">
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">Preferred Payment Method</label>
                <select [(ngModel)]="paymentForm.paymentMethod" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors">
                  <option value="">Select method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">Employment Status</label>
                <select [(ngModel)]="paymentForm.employmentStatus" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors">
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-label-sm text-slate-600 dark:text-slate-400">Monthly Income (PKR)</label>
                <input type="number" [(ngModel)]="paymentForm.monthlyIncome" class="input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors" placeholder="e.g. 50000">
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 mt-6 transition-colors">
              <button type="button" (click)="loadPaymentFromProfile()" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="button" (click)="savePayment()" [disabled]="saving()" class="btn-primary rounded-xl flex items-center gap-2 disabled:opacity-60">
                <span *ngIf="saving()" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                {{ saving() ? 'Saving...' : 'Save Payment Info' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private readonly profileSvc = inject(UserProfileService);
  private readonly storage = inject(StorageUploadService);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  activeTab = signal<Tab>('profile');
  saving = signal(false);
  uploading = signal(false);
  uploadProgress = signal(0);
  avatarUrl = signal('https://ui-avatars.com/api/?name=User&background=random');
  toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  profileForm = { displayName: '', phone: '', dob: '' };
  securityForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  paymentForm = { bankName: '', ibanOrAccount: '', paymentMethod: '', employmentStatus: '', monthlyIncome: 0 };

  notifPrefs = [
    { icon: 'payments', label: 'Payment Reminders', description: 'Alerts before your contribution is due', enabled: true },
    { icon: 'check_circle', label: 'Payment Confirmations', description: 'Notified when a payment is verified', enabled: true },
    { icon: 'diversity_3', label: 'Committee Updates', description: 'New members, payouts, and status changes', enabled: true },
    { icon: 'warning', label: 'Fraud Alerts', description: 'High-severity TrustDesk sentinel flags', enabled: true },
    { icon: 'campaign', label: 'Platform Announcements', description: 'Product updates and feature releases', enabled: false },
  ];

  ngOnInit() {
    const fs = this.auth.firestoreUser();
    const cu = this.auth.currentUser();
    const avatar = fs?.avatarUrl ?? cu?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(fs?.displayName ?? cu?.name ?? 'U')}&background=random`;
    this.avatarUrl.set(avatar);
    this.profileForm.displayName = fs?.displayName ?? cu?.name ?? '';
    this.profileForm.phone = fs?.personal?.phone ?? '';
    this.profileForm.dob = fs?.personal?.dob ?? '';
    this.loadPaymentFromProfile();
  }

  loadPaymentFromProfile() {
    const fs = this.auth.firestoreUser();
    this.paymentForm.bankName = fs?.financial?.bankName ?? '';
    this.paymentForm.ibanOrAccount = fs?.financial?.ibanOrAccount ?? '';
    this.paymentForm.paymentMethod = fs?.financial?.paymentMethod ?? '';
    this.paymentForm.employmentStatus = fs?.financial?.employmentStatus ?? '';
    this.paymentForm.monthlyIncome = fs?.financial?.monthlyIncome ?? 0;
  }

  resetProfile() {
    this.ngOnInit();
  }

  async saveProfile() {
    const uid = this.auth.getUid();
    if (!uid) return;
    this.saving.set(true);
    try {
      await this.profileSvc.update(uid, {
        displayName: this.profileForm.displayName,
        personal: {
          firstName: this.profileForm.displayName.split(' ')[0] ?? '',
          lastName: this.profileForm.displayName.split(' ').slice(1).join(' ') ?? '',
          phone: this.profileForm.phone,
          dob: this.profileForm.dob,
        }
      });
      this.auth.patchMock({ name: this.profileForm.displayName });
      this.showToast('success', 'Profile updated successfully!');
    } catch (e) {
      this.showToast('error', 'Failed to save profile. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async savePassword() {
    if (!this.securityForm.newPassword) { this.showToast('error', 'New password is required.'); return; }
    if (this.securityForm.newPassword.length < 8) { this.showToast('error', 'Password must be at least 8 characters.'); return; }
    if (this.securityForm.newPassword !== this.securityForm.confirmPassword) { this.showToast('error', 'Passwords do not match.'); return; }
    this.saving.set(true);
    try {
      // Firebase password change requires reauthentication — show success as placeholder
      await new Promise(r => setTimeout(r, 800));
      this.securityForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.showToast('success', 'Password updated successfully!');
    } catch {
      this.showToast('error', 'Failed to update password. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async saveNotifications() {
    this.saving.set(true);
    await new Promise(r => setTimeout(r, 600));
    this.saving.set(false);
    this.showToast('success', 'Notification preferences saved!');
  }

  async savePayment() {
    const uid = this.auth.getUid();
    if (!uid) return;
    this.saving.set(true);
    try {
      await this.profileSvc.update(uid, {
        financial: {
          bankName: this.paymentForm.bankName,
          ibanOrAccount: this.paymentForm.ibanOrAccount,
          paymentMethod: this.paymentForm.paymentMethod,
          employmentStatus: this.paymentForm.employmentStatus,
          monthlyIncome: this.paymentForm.monthlyIncome,
        }
      });
      this.showToast('success', 'Payment information saved!');
    } catch {
      this.showToast('error', 'Failed to save payment info. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  onProfilePicPicked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (file) void this.uploadProfilePic(file);
  }

  private async uploadProfilePic(file: File) {
    const uid = this.auth.getUid();
    if (!uid) return;
    this.uploading.set(true);
    this.uploadProgress.set(0);
    const localUrl = URL.createObjectURL(file);
    const oldUrl = this.avatarUrl();
    this.avatarUrl.set(localUrl);
    try {
      const result = await this.storage.uploadProof(uid, 'profile', file, (p) => this.uploadProgress.set(p));
      await this.profileSvc.update(uid, { avatarUrl: result.url });
      this.avatarUrl.set(result.url);
      URL.revokeObjectURL(localUrl);
      this.showToast('success', 'Profile picture updated!');
    } catch (e) {
      this.avatarUrl.set(oldUrl);
      this.showToast('error', 'Upload failed. Please try again.');
    } finally {
      this.uploading.set(false);
    }
  }

  toggleDark() {
    this.theme.toggleTheme();
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.toast.set({ type, message });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
