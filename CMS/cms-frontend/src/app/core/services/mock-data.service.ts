import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  constructor() {}

  getDashboardStats(): Observable<any> {
    return of({
      committeesJoined: 3,
      activeCommittees: 2,
      upcomingPayment: 250.00,
      paymentDate: 'Oct 15, 2023',
      payoutStatus: 'November Cycle',
      isQualified: true,
      trustScore: 850,
      onTimePaymentRate: 98
    }).pipe(delay(500));
  }

  getAdminStats(): Observable<any> {
    return of({
      totalUsers: 1240,
      userGrowth: 12,
      activeCommittees: 156,
      committeeGrowth: 5,
      flaggedActivities: 4
    }).pipe(delay(500));
  }

  getRecentTransactions(): Observable<any[]> {
    return of([
      { id: 'TR-9021', member: 'Alexander Pierce', date: 'Oct 24, 2023', amount: 1200.00, status: 'paid', hasProof: true },
      { id: 'TR-9022', member: 'Sarah Jenkins', date: 'Oct 25, 2023', amount: 1200.00, status: 'pending', hasProof: true },
      { id: 'TR-9023', member: 'Michael Chen', date: 'Oct 20, 2023', amount: 1200.00, status: 'late', hasProof: false },
      { id: 'TR-9024', member: 'Leila Vance', date: 'Oct 24, 2023', amount: 1200.00, status: 'paid', hasProof: true }
    ]).pipe(delay(600));
  }

  getAlerts(): Observable<any[]> {
    return of([
      { type: 'warning', title: 'Payment Reminder', message: 'Monthly contribution for "Home Fund" is due in 3 days', time: '2 HOURS AGO' },
      { type: 'info', title: 'Committee Update', message: 'New member "Sarah J." joined the Vacation Circle', time: 'YESTERDAY' },
      { type: 'success', title: 'Security Alert', message: 'Two-factor authentication successfully enabled', time: '2 DAYS AGO' }
    ]).pipe(delay(400));
  }

  getFraudAlerts(): Observable<any[]> {
    return of([
      { id: 1, severity: 'critical', user: '@john_doe', message: 'User flagged for late payment in 3 committees simultaneously.', time: 'Just Now' },
      { id: 2, severity: 'warning', user: '@clara_v', message: 'Multiple login attempts from unverified IP range (Eastern Europe).', time: '14m ago' },
      { id: 3, severity: 'warning', user: '@apex_invest', message: 'Trust Score anomaly detected. Rapid drop from 98 to 45.', time: '1h ago' }
    ]).pipe(delay(700));
  }
}
