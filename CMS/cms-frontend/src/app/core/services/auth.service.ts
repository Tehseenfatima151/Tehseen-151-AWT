import { Injectable, NgZone, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { User as FbUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type {
  AuthUserView,
  TrustCircleUser,
  UserFinancial,
  UserIdentityDocs,
  UserPersonal,
  UserRole,
} from '../models/trustcircle.models';
import { getDb, getFirebaseAuth } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import { UserProfileService } from './user-profile.service';

const LS_USER = 'trustcircle_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly firestoreUser = signal<TrustCircleUser | null>(null);
  readonly currentUser = signal<AuthUserView | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly ready = signal<boolean>(false);

  readonly hasCompletedKycFlow = computed(() => {
    const k = this.firestoreUser()?.kycStatus ?? this.currentUser()?.kycStatus;
    return k === 'submitted' || k === 'approved';
  });

  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly userProfile: UserProfileService,
  ) {
    this.init();
  }

  private init() {
    if (!isFirebaseConfigured()) {
      this.restoreMockSession();
      this.ready.set(true);
      return;
    }
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, user => {
      this.zone.run(() => {
        if (!user) {
          this.userProfile.cleanup();
          this.firestoreUser.set(null);
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.ready.set(true);
          return;
        }
        this.isAuthenticated.set(true);
        this.userProfile.watchProfile(user.uid).subscribe(p => {
          this.zone.run(() => {
            this.firestoreUser.set(p);
            if (p) {
              if (p.blocked) {
                void this.logout();
                return;
              }
              this.currentUser.set(this.mapProfile(p));
            } else {
              void this.bootstrapEmptyProfile(user);
            }
            this.ready.set(true);
          });
        });
      });
    });
  }

  private mapProfile(u: TrustCircleUser): AuthUserView {
    return {
      id: u.id,
      name: u.displayName,
      email: u.email,
      role: u.role,
      avatar:
        u.avatarUrl ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=random`,
      trustScore: u.trustScore,
      kycStatus: u.kycStatus,
      kycLatestStep: u.kycLatestStep,
      blocked: u.blocked,
      personal: u.personal,
      financial: u.financial,
      identity: u.identity,
    };
  }

  private restoreMockSession() {
    const raw = localStorage.getItem(LS_USER);
    if (!raw) {
      return;
    }
    try {
      const u = JSON.parse(raw) as AuthUserView;
      this.currentUser.set(u);
      this.isAuthenticated.set(true);
    } catch {
      localStorage.removeItem(LS_USER);
    }
  }

  private persistMock(user: AuthUserView) {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  }

  private mockLogin(email: string) {
    const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const mock: AuthUserView = {
      id: Math.random().toString(36).slice(2),
      name: email.split('@')[0],
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
      trustScore: role === 'user' ? 720 : undefined,
      kycStatus: 'approved',
    };
    if (sessionStorage.getItem('tc_demo_kyc') === 'pending') {
      mock.kycStatus = 'in_progress';
    }
    this.currentUser.set(mock);
    this.isAuthenticated.set(true);
    this.persistMock(mock);
    void this.navigateAfterLogin(mock);
  }

  navigateAfterLogin(u: AuthUserView) {
    if (u.role === 'admin') {
      return this.router.navigate(['/admin/overview']);
    }
    const k = u.kycStatus;
    if (k === 'approved' || k === 'submitted') {
      return this.router.navigate(['/dashboard']);
    }
    return this.router.navigate(['/kyc/personal']);
  }

  async login(email: string, password: string) {
    if (!password) {
      return;
    }
    if (!isFirebaseConfigured()) {
      this.mockLogin(email);
      return;
    }
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // Wait up to 6s for onAuthStateChanged → Firestore profile → currentUser to be set
    const start = Date.now();
    while (Date.now() - start < 6000) {
      if (this.currentUser()?.id) break;
      await new Promise(r => setTimeout(r, 60));
    }
    const user = this.currentUser();
    if (user) {
      void this.navigateAfterLogin(user);
    }
  }

  async signup(email: string, password: string, displayName: string) {
    if (!isFirebaseConfigured()) {
      sessionStorage.setItem('tc_demo_kyc', 'pending');
      const mock: AuthUserView = {
        id: Math.random().toString(36).slice(2),
        name: displayName,
        email,
        role: 'user',
        kycStatus: 'in_progress',
        kycLatestStep: 'personal',
        trustScore: 500,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
      };
      this.currentUser.set(mock);
      this.isAuthenticated.set(true);
      this.persistMock(mock);
      return this.router.navigate(['/kyc/personal']);
    }
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    const uid = cred.user.uid;
    await this.userProfile.ensureUserDoc(uid, {
      email,
      displayName,
      role: 'user',
      kycStatus: 'in_progress',
      kycLatestStep: 'personal',
      trustScore: 500,
      blocked: false,
    });
    return this.router.navigate(['/kyc/personal']);
  }

  async bootstrapEmptyProfile(user: FbUser) {
    const display = user.displayName || user.email?.split('@')[0] || 'Member';
    await this.userProfile.ensureUserDoc(user.uid, {
      email: user.email ?? '',
      displayName: display,
      role: 'user',
      kycStatus: 'in_progress',
      kycLatestStep: 'personal',
      trustScore: 500,
      blocked: false,
    });
  }

  async forgotPassword(email: string) {
    if (!isFirebaseConfigured()) {
      return;
    }
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  }

  async logout() {
    if (isFirebaseConfigured()) {
      await signOut(getFirebaseAuth());
      this.userProfile.cleanup();
    }
    this.firestoreUser.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem(LS_USER);
    await this.router.navigate(['/login']);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  getUid(): string | null {
    if (!isFirebaseConfigured()) {
      return this.currentUser()?.id ?? null;
    }
    const u = getFirebaseAuth().currentUser;
    return u?.uid ?? null;
  }

  async saveKycPersonal(uid: string, data: UserPersonal) {
    if (!isFirebaseConfigured()) {
      this.patchMock({ personal: data, kycStatus: 'in_progress', kycLatestStep: 'financial' });
      return;
    }
    await this.userProfile.update(uid, {
      personal: data,
      kycLatestStep: 'financial',
      kycStatus: 'in_progress',
    });
  }

  async saveKycFinancial(uid: string, data: UserFinancial) {
    if (!isFirebaseConfigured()) {
      this.patchMock({ financial: data, kycStatus: 'in_progress', kycLatestStep: 'identity' });
      return;
    }
    await this.userProfile.update(uid, {
      financial: data,
      kycLatestStep: 'identity',
      kycStatus: 'in_progress',
    });
  }

  async saveKycIdentity(uid: string, docs: UserIdentityDocs) {
    if (!isFirebaseConfigured()) {
      this.patchMock({ identity: docs, kycStatus: 'in_progress', kycLatestStep: 'review' });
      return;
    }
    await this.userProfile.update(uid, {
      identity: docs,
      kycLatestStep: 'review',
      kycStatus: 'in_progress',
    });
    await setDoc(
      doc(getDb(), 'kycSubmissions', uid),
      { userId: uid, status: 'submitted', identity: docs, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  async finalizeKycSubmit(uid: string) {
    if (!isFirebaseConfigured()) {
      const u = this.currentUser();
      if (!u) {
        return;
      }
      const next: AuthUserView = { ...u, kycStatus: 'submitted' };
      this.currentUser.set(next);
      this.persistMock(next);
      return this.router.navigate(['/kyc/complete']);
    }
    await this.userProfile.update(uid, { kycStatus: 'submitted', kycLatestStep: 'review' });
    const p = await this.userProfile.getOnce(uid);
    if (p) {
      await setDoc(
        doc(getDb(), 'kycSubmissions', uid),
        {
          userId: uid,
          status: 'submitted',
          personal: p.personal ?? null,
          financial: p.financial ?? null,
          identity: p.identity ?? null,
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
    return this.router.navigate(['/kyc/complete']);
  }

  async signInWithGoogle(): Promise<void> {
    if (!isFirebaseConfigured()) {
      this.mockLogin('google@gmail.com');
      return;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const cred = await signInWithPopup(getFirebaseAuth(), provider);
    await this.ensureOAuthProfile(cred.user);
    const start = Date.now();
    while (Date.now() - start < 6000) {
      if (this.currentUser()?.id) break;
      await new Promise(r => setTimeout(r, 60));
    }
    const user = this.currentUser();
    if (user) void this.navigateAfterLogin(user);
  }

  async signInWithApple(): Promise<void> {
    if (!isFirebaseConfigured()) {
      this.mockLogin('apple@icloud.com');
      return;
    }
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const cred = await signInWithPopup(getFirebaseAuth(), provider);
    await this.ensureOAuthProfile(cred.user);
    const start = Date.now();
    while (Date.now() - start < 6000) {
      if (this.currentUser()?.id) break;
      await new Promise(r => setTimeout(r, 60));
    }
    const user = this.currentUser();
    if (user) void this.navigateAfterLogin(user);
  }

  private async ensureOAuthProfile(fbUser: FbUser): Promise<void> {
    const display = fbUser.displayName || fbUser.email?.split('@')[0] || 'Member';
    await this.userProfile.ensureUserDoc(fbUser.uid, {
      email: fbUser.email ?? '',
      displayName: display,
      role: 'user',
      kycStatus: 'in_progress',
      kycLatestStep: 'personal',
      trustScore: 500,
      blocked: false,
      avatarUrl: fbUser.photoURL ?? undefined,
    });
  }

  patchMock(patch: Partial<AuthUserView>) {
    const u = this.currentUser();
    if (!u) {
      return;
    }
    const next = { ...u, ...patch };
    this.currentUser.set(next);
    this.persistMock(next);
  }
}
