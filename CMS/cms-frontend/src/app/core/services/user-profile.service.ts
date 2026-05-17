import { Injectable } from '@angular/core';
import {
  doc,
  DocumentReference,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { ReplaySubject } from 'rxjs';
import { getDb } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { KycStatus, TrustCircleUser } from '../models/trustcircle.models';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly profile$ = new ReplaySubject<TrustCircleUser | null>(1);
  private unsubscribe?: () => void;

  watchProfile(uid: string | null) {
    this.cleanup();
    if (!uid || !isFirebaseConfigured()) {
      this.profile$.next(null);
      return this.profile$.asObservable();
    }
    const ref = doc(getDb(), 'users', uid) as DocumentReference<TrustCircleUser>;
    this.unsubscribe = onSnapshot(ref, snap => {
      if (!snap.exists()) {
        this.profile$.next(null);
        return;
      }
      this.profile$.next({ id: uid, ...(snap.data() as Omit<TrustCircleUser, 'id'>) });
    });
    return this.profile$.asObservable();
  }

  cleanup() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  ref(uid: string): DocumentReference {
    return doc(getDb(), 'users', uid);
  }

  async getOnce(uid: string): Promise<TrustCircleUser | null> {
    if (!isFirebaseConfigured()) return null;
    const s = await getDoc(this.ref(uid));
    if (!s.exists()) return null;
    return { id: uid, ...(s.data() as Omit<TrustCircleUser, 'id'>) };
  }

  async ensureUserDoc(uid: string, payload: Partial<TrustCircleUser>): Promise<void> {
    if (!isFirebaseConfigured()) return;
    const r = this.ref(uid);
    const snap = await getDoc(r);
    const base: Record<string, unknown> = {
      id: uid,
      email: payload.email ?? '',
      displayName: payload.displayName ?? '',
      role: payload.role ?? 'user',
      blocked: false,
      kycStatus: 'not_started' as KycStatus,
      trustScore: payload.trustScore ?? 500,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(r, { ...base, ...payload } as Omit<TrustCircleUser, 'id'>);
    } else {
      await updateDoc(r, { ...payload, updatedAt: serverTimestamp() });
    }
    await this.syncPublicProfile(uid, { ...base, ...payload });
  }

  async update(uid: string, data: Partial<TrustCircleUser>): Promise<void> {
    if (!isFirebaseConfigured()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(this.ref(uid), { ...(data as any), updatedAt: serverTimestamp() });
    await this.syncPublicProfile(uid, data);
  }

  private async syncPublicProfile(uid: string, data: Partial<TrustCircleUser>): Promise<void> {
    if (!isFirebaseConfigured()) return;
    const publicRef = doc(getDb(), 'publicProfiles', uid);
    const publicData: any = { updatedAt: serverTimestamp() };
    
    // Only pick safe fields
    if (data.displayName !== undefined) publicData.displayName = data.displayName;
    if (data.trustScore !== undefined) publicData.trustScore = data.trustScore;
    if (data.createdAt !== undefined) publicData.memberSince = data.createdAt;
    
    // In a real app we'd trigger a cloud function to count completed committees,
    // for now we set default if creating.
    if (data.createdAt) {
      publicData.completedCommittees = 0;
    }
    
    await setDoc(publicRef, publicData, { merge: true });
  }
}
