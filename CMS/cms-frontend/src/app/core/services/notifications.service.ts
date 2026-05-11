import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
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
import type { AppNotification } from '../models/trustcircle.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  observeMine(uid: string): Observable<AppNotification[]> {
    return new Observable(sub => {
      if (!isFirebaseConfigured()) {
        sub.next([]);
        sub.complete();
        return () => {};
      }
      const q = query(collection(getDb(), 'notifications'), where('userId', '==', uid));
      const unsub: Unsubscribe = onSnapshot(q, snap => {
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) }));
        rows.sort((a, b) => {
          const ta = a.createdAt && 'seconds' in a.createdAt ? (a.createdAt as { seconds: number }).seconds : 0;
          const tb = b.createdAt && 'seconds' in b.createdAt ? (b.createdAt as { seconds: number }).seconds : 0;
          return tb - ta;
        });
        sub.next(rows);
      }, err => sub.error(err));
      return () => unsub();
    });
  }

  async push(input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { read?: boolean }) {
    if (!isFirebaseConfigured()) {
      return;
    }
    await addDoc(collection(getDb(), 'notifications'), {
      ...input,
      read: input.read ?? false,
      createdAt: serverTimestamp(),
    });
  }

  async markRead(id: string) {
    if (!isFirebaseConfigured()) {
      return;
    }
    await updateDoc(doc(getDb(), 'notifications', id), { read: true });
  }
}
