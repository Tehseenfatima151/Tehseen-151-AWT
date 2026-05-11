import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { getDb } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { CommitteeTransaction, TransactionStatus } from '../models/trustcircle.models';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  observeForUser(uid: string): Observable<CommitteeTransaction[]> {
    return new Observable(sub => {
      if (!isFirebaseConfigured()) {
        sub.next([]);
        sub.complete();
        return () => {};
      }
      const q = query(collection(getDb(), 'transactions'), where('userId', '==', uid));
      const unsub: Unsubscribe = onSnapshot(q, snap => {
        const rows = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<CommitteeTransaction, 'id'>),
        }));
        sub.next(rows);
      }, err => sub.error(err));
      return () => unsub();
    });
  }

  observeForCommittee(committeeId: string): Observable<CommitteeTransaction[]> {
    return new Observable(sub => {
      if (!isFirebaseConfigured()) {
        sub.next([]);
        sub.complete();
        return () => {};
      }
      const q = query(collection(getDb(), 'transactions'), where('committeeId', '==', committeeId));
      const unsub: Unsubscribe = onSnapshot(q, snap => {
        const rows = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<CommitteeTransaction, 'id'>),
        }));
        rows.sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
        sub.next(rows);
      }, err => sub.error(err));
      return () => unsub();
    });
  }

  async recordContribution(input: Omit<CommitteeTransaction, 'id' | 'createdAt'>) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured');
    }
    if (input.proofHash) {
      const clash = await getDocs(
        query(collection(getDb(), 'transactions'), where('proofHash', '==', input.proofHash)),
      );
      if (!clash.empty) {
        throw new Error('Duplicate payment proof detected');
      }
    }
    await addDoc(collection(getDb(), 'transactions'), {
      ...input,
      createdAt: serverTimestamp(),
    });
  }

  async updateStatus(id: string, status: TransactionStatus) {
    if (!isFirebaseConfigured()) {
      return;
    }
    await updateDoc(doc(getDb(), 'transactions', id), { status });
  }
}
