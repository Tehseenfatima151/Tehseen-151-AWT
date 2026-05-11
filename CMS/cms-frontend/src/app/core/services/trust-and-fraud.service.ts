import { Injectable } from '@angular/core';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { getDb } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import type { CommitteeTransaction } from '../models/trustcircle.models';
import { UserProfileService } from './user-profile.service';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

@Injectable({ providedIn: 'root' })
export class TrustAndFraudService {
  constructor(private readonly users: UserProfileService) {}

  async syncScoresAndFlags(uid: string) {
    if (!isFirebaseConfigured()) {
      return;
    }
    const qr = query(collection(getDb(), 'transactions'), where('userId', '==', uid));
    const snap = await getDocs(qr);
    const txs: CommitteeTransaction[] = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<CommitteeTransaction, 'id'>),
    }));
    let onTime = 0;
    let late = 0;
    let missed = 0;
    txs.forEach(t => {
      if (t.status === 'paid') {
        onTime++;
      }
      if (t.status === 'late') {
        late++;
      }
      if (t.status === 'missed') {
        missed++;
      }
    });
    const score = clamp(500 + onTime * 12 - late * 22 - missed * 55 + (txs.length > 15 ? 20 : 0), 260, 999);
    await this.users.update(uid, { trustScore: score });

    const reasons: string[] = [];
    if (late >= 3) {
      reasons.push('Repeated late payments flagged');
    }
    if (missed >= 2) {
      reasons.push('Multiple missed contributions');
    }
    if (late >= 2 && missed >= 1) {
      reasons.push('Mixed delinquency pattern');
    }
    let riskScore = 10;
    if (reasons.length) {
      riskScore += late * 5 + missed * 12 + reasons.length * 8;
    }
    riskScore = clamp(riskScore, 0, 99);
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 65) {
      severity = 'high';
    } else if (riskScore > 38) {
      severity = 'medium';
    }

    if (severity === 'high') {
      await addDoc(collection(getDb(), 'fraudReports'), {
        userId: uid,
        reasons,
        severity,
        resolved: false,
        riskScore,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(getDb(), 'notifications'), {
        userId: uid,
        title: 'Fraud Desk alert',
        body: `${reasons[0] ?? 'Suspicious behaviour detected'} (risk ${riskScore})`,
        read: false,
        type: 'fraud',
        createdAt: serverTimestamp(),
      });
    }
  }
}
