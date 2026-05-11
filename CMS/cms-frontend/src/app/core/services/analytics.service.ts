import { Injectable, inject } from '@angular/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import { Committee, CommitteeTransaction, TrustCircleUser } from '../models/trustcircle.models';

export interface AnalyticsData {
  totalPaid: number;
  totalPending: number;
  latePayments: number;
  activeCommittees: number;
  completedCommittees: number;
  totalMembers: number;
  avgTrustScore: number;
  paymentConsistency: number; 
  highRiskCommittees: number; 
  monthlyTrends: { label: string; amount: number }[];
  statusRatio: { onTime: number; late: number; grace: number };
  topCommittees: {
    id: string;
    name: string;
    members: number;
    capital: number;
    efficiency: number;
    status: string;
  }[];
}

export type TimePeriod = '30days' | '90days' | 'all';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private rawCommittees: Committee[] = [];
  private rawTxs: CommitteeTransaction[] = [];
  private rawUserScore: number = 0;
  private hasFetched = false;

  async fetchRawData(userId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }
    const db = getDb();
    
    const [committeesSnap, userTxsSnap, userProfileSnap] = await Promise.all([
      getDocs(query(collection(db, 'committees'), where('memberIds', 'array-contains', userId))),
      getDocs(query(collection(db, 'transactions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'users'), where('__name__', '==', userId)))
    ]);

    this.rawCommittees = committeesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Committee));
    this.rawTxs = userTxsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CommitteeTransaction));
    
    if (!userProfileSnap.empty) {
        const u = userProfileSnap.docs[0].data() as TrustCircleUser;
        this.rawUserScore = u.trustScore || 0;
    }
    
    this.hasFetched = true;
  }

  getDashboardAnalytics(period: TimePeriod): AnalyticsData {
    if (!isFirebaseConfigured() || !this.hasFetched) {
      return this.getMockData(period);
    }

    const now = new Date();
    const cutoffDate = new Date();
    if (period === '30days') cutoffDate.setDate(now.getDate() - 30);
    else if (period === '90days') cutoffDate.setDate(now.getDate() - 90);
    else cutoffDate.setFullYear(2000); 

    let filteredTxs = this.rawTxs;
    if (period !== 'all') {
      filteredTxs = this.rawTxs.filter(t => {
        const date = t.createdAt ? (t.createdAt as any).toDate() : new Date();
        return date >= cutoffDate;
      });
    }

    let totalPaid = 0;
    let totalPending = 0;
    let latePayments = 0;
    let onTimePayments = 0;

    filteredTxs.forEach(t => {
      if (t.status === 'paid') {
        totalPaid += t.amount;
        onTimePayments++;
      } else if (t.status === 'pending') {
        totalPending += t.amount;
      } else if (t.status === 'late') {
        latePayments++;
      }
    });

    const totalTxs = onTimePayments + latePayments;
    const paymentConsistency = totalTxs > 0 ? (onTimePayments / totalTxs) * 100 : 0;

    const uniqueMembers = new Set<string>();
    this.rawCommittees.forEach(c => c.memberIds.forEach(m => uniqueMembers.add(m)));

    const topCommittees = this.rawCommittees.map(c => {
       const efficiency = c.currentCycle && c.totalCycles ? (c.currentCycle / c.totalCycles) * 100 : 100;
       return {
         id: c.id,
         name: c.name,
         members: c.memberIds.length,
         capital: c.contributionAmount * c.maxMembers,
         efficiency,
         status: c.status
       };
    }).sort((a, b) => b.efficiency - a.efficiency).slice(0, 5);

    const trendsMap = new Map<string, number>();
    
    // Prefill last 6 months to ensure a continuous line graph
    const d = new Date();
    for(let i=5; i>=0; i--) {
       const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
       const y = past.getFullYear();
       const m = String(past.getMonth() + 1).padStart(2, '0');
       trendsMap.set(`${y}-${m}`, 0);
    }

    filteredTxs.filter(t => t.status === 'paid').forEach(t => {
       const m = t.monthKey || 'N/A';
       trendsMap.set(m, (trendsMap.get(m) || 0) + t.amount);
    });
    
    const monthlyTrends = Array.from(trendsMap.entries())
       .map(([label, amount]) => ({ label, amount }))
       .sort((a, b) => a.label.localeCompare(b.label));

    return {
      totalPaid,
      totalPending,
      latePayments,
      activeCommittees: this.rawCommittees.filter(c => c.status === 'active').length,
      completedCommittees: this.rawCommittees.filter(c => c.status === 'completed').length,
      totalMembers: uniqueMembers.size,
      avgTrustScore: this.rawUserScore,
      paymentConsistency,
      highRiskCommittees: 0,
      monthlyTrends: monthlyTrends.length ? monthlyTrends : [{ label: 'No Data', amount: 0 }],
      statusRatio: {
        onTime: onTimePayments,
        late: latePayments,
        grace: filteredTxs.filter(t => t.status === 'pending').length 
      },
      topCommittees
    };
  }

  private getEmptyData(): AnalyticsData {
    return {
      totalPaid: 0,
      totalPending: 0,
      latePayments: 0,
      activeCommittees: 0,
      completedCommittees: 0,
      totalMembers: 0,
      avgTrustScore: 0,
      paymentConsistency: 0,
      highRiskCommittees: 0,
      monthlyTrends: [],
      statusRatio: { onTime: 0, late: 0, grace: 0 },
      topCommittees: []
    };
  }

  public getRawTransactions() {
    return this.rawTxs;
  }

  private getMockData(period: TimePeriod): AnalyticsData {
    const factor = period === '30days' ? 0.3 : period === '90days' ? 0.7 : 1;
    return {
      totalPaid: 452890 * factor,
      totalPending: 15400 * factor,
      latePayments: Math.floor(12 * factor),
      activeCommittees: 4,
      completedCommittees: 2,
      totalMembers: 81,
      avgTrustScore: 94.8,
      paymentConsistency: 91,
      highRiskCommittees: 0,
      monthlyTrends: [
        { label: 'JAN', amount: 18000 * factor },
        { label: 'FEB', amount: 19000 * factor },
        { label: 'MAR', amount: 15000 * factor },
        { label: 'APR', amount: 12000 * factor },
        { label: 'MAY', amount: 9000 * factor },
        { label: 'JUN', amount: 4000 * factor }
      ],
      statusRatio: { onTime: Math.floor(412 * factor), late: Math.floor(64 * factor), grace: Math.floor(28 * factor) },
      topCommittees: [
        { id: '1', name: 'Vanguard Circle', members: 24, capital: 124000, efficiency: 99.2, status: 'active' },
        { id: '2', name: 'Equity Hub Alpha', members: 12, capital: 58500, efficiency: 94.5, status: 'active' },
        { id: '3', name: 'Prime Trust Collective', members: 45, capital: 210300, efficiency: 87.8, status: 'completed' }
      ]
    };
  }
}

