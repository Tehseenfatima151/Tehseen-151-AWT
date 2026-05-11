import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { getDb } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { Committee, PayoutRecord } from '../models/trustcircle.models';

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function makeInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

@Injectable({ providedIn: 'root' })
export class CommitteesService {
  listMine(uid: string): Observable<Committee[]> {
    return new Observable(sub => {
      if (!isFirebaseConfigured()) {
        sub.next([]);
        sub.complete();
        return;
      }
      const qy = query(collection(getDb(), 'committees'), where('memberIds', 'array-contains', uid));
      const unsub: Unsubscribe = onSnapshot(qy, snap => {
        const rows: Committee[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Committee, 'id'>) }));
        sub.next(rows);
      }, err => sub.error(err));
    });
  }

  listAvailable(uid: string): Observable<Committee[]> {
    return new Observable(sub => {
      if (!isFirebaseConfigured()) {
        sub.next([]);
        sub.complete();
        return;
      }
      // Cannot use not-in or complex arrays easily in Firebase without specific indexes,
      // so we fetch active ones and filter client-side.
      const qy = query(collection(getDb(), 'committees'), where('status', '==', 'active'));
      const unsub: Unsubscribe = onSnapshot(qy, snap => {
        const rows: Committee[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Committee, 'id'>) }));
        const available = rows.filter(c => 
          !(c.memberIds || []).includes(uid) && 
          (c.memberIds || []).length < c.maxMembers
        );
        sub.next(available);
      }, err => sub.error(err));
      return () => unsub();
    });
  }

  async createCommittee(uid: string, input: { name: string; description?: string; contributionAmount: number; maxMembers: number }) {
    if (!isFirebaseConfigured()) {
      return { id: `local_${Date.now()}`, inviteCode: 'DEMO' };
    }
    const inviteCode = makeInviteCode();
    const ref = await addDoc(collection(getDb(), 'committees'), {
      name: input.name,
      description: input.description ?? '',
      creatorId: uid,
      inviteCode,
      contributionAmount: input.contributionAmount,
      currency: 'USD',
      maxMembers: input.maxMembers,
      memberIds: [uid],
      status: 'active',
      payoutRecipientOrder: [], // Creator gets first in advancePayoutDrawing, but we keep it empty initially here so it strictly follows the advance logic
      monthlyDueDay: new Date().getDate(),
      totalCycles: input.maxMembers,
      currentCycle: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, inviteCode };
  }

  async getCommittee(id: string): Promise<Committee | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }
    const s = await getDoc(doc(getDb(), 'committees', id));
    if (!s.exists()) {
      return null;
    }
    return { id: s.id, ...(s.data() as Omit<Committee, 'id'>) };
  }

  async joinByInvite(uid: string, code: string): Promise<string | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }
    const trimmed = code.trim().toUpperCase();
    const snap = await getDocs(
      query(collection(getDb(), 'committees'), where('inviteCode', '==', trimmed), limit(1)),
    );
    if (snap.empty) {
      return null;
    }
    const d = snap.docs[0]!;
    const c = d.data() as Omit<Committee, 'id'>;
    if (c.memberIds?.includes(uid)) {
      return d.id;
    }
    if ((c.memberIds?.length ?? 0) >= c.maxMembers) {
      throw new Error('Committee is full');
    }
    await updateDoc(doc(getDb(), 'committees', d.id), {
      memberIds: arrayUnion(uid),
      updatedAt: serverTimestamp(),
    });
    return d.id;
  }

  /**
   * Runs next payout draw. Creator is always first.
   * Further payouts pick a random member among those who haven't received it yet.
   */
  async runPayoutDraw(committeeId: string, amount: number, currency: string, executedBy: string, isAdminExecutor: boolean = false) {
    if (!isFirebaseConfigured()) {
      return;
    }
    const ref = doc(getDb(), 'committees', committeeId);
    const s = await getDoc(ref);
    if (!s.exists()) {
      throw new Error('Committee not found');
    }
    const c = { id: committeeId, ...(s.data() as Omit<Committee, 'id'>) };
    const payoutsSnap = await getDocs(
      query(collection(getDb(), 'payouts'), where('committeeId', '==', committeeId)),
    );
    let nextCycle = 0;
    payoutsSnap.forEach(d => {
      const p = d.data() as PayoutRecord;
      nextCycle = Math.max(nextCycle, p.cycleIndex + 1);
    });

    const members = [...(c.memberIds ?? [])];
    if (members.length === 0) {
      return;
    }

    const unpaidMembers = members.filter(m => !(c.payoutRecipientOrder ?? []).includes(m));
    if (unpaidMembers.length === 0) {
      throw new Error('All members have already received a payout.');
    }

    let recipient: string;
    let method: 'creator_first' | 'random_draw';

    if (nextCycle === 0) {
      recipient = c.creatorId;
      method = 'creator_first';
    } else {
      method = 'random_draw';
      recipient = randomChoice(unpaidMembers);
    }

    const batch = writeBatch(getDb());
    const payoutRef = doc(collection(getDb(), 'payouts'));
    batch.set(payoutRef, {
      committeeId,
      cycleIndex: nextCycle,
      recipientId: recipient,
      method,
      amount,
      currency,
      executedBy,
      selectedWinner: recipient,
      cycleNumber: nextCycle,
      createdAt: serverTimestamp(),
    });

    // If an admin executed this, log it securely.
    if (isAdminExecutor) {
      const auditRef = doc(collection(getDb(), 'adminAuditLogs'));
      batch.set(auditRef, {
        action: 'RUN_PAYOUT_DRAW',
        actionBy: executedBy,
        actionTimestamp: serverTimestamp(),
        targetId: committeeId,
        targetCollection: 'committees',
        reason: `Ran payout draw for cycle ${nextCycle + 1}. Winner: ${recipient}`,
        metadata: { cycleNumber: nextCycle, selectedWinner: recipient, amount }
      });
    }

    const newCycle = (c.currentCycle || 1) + 1;
    const isCompleted = newCycle > c.totalCycles;

    batch.update(ref, {
      payoutRecipientOrder: arrayUnion(recipient),
      currentCycle: isCompleted ? c.totalCycles : newCycle,
      status: isCompleted ? 'completed' : c.status,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return { payoutId: payoutRef.id, recipient };
  }
}
