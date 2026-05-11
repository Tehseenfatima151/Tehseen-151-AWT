import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDb } from '../firebase/firebase-app';
import { isFirebaseConfigured } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type { CommitteeStatus, DisputeStatus } from '../models/trustcircle.models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly auth = inject(AuthService);

  private async logAction(
    actionType: string,
    actionReason: string,
    targetId: string,
    targetCollection: string,
    metadata?: any
  ) {
    if (!isFirebaseConfigured()) return;
    const adminUser = this.auth.currentUser();
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action.');
    }

    const logRef = doc(collection(getDb(), 'adminAuditLogs'));
    await setDoc(logRef, {
      id: logRef.id,
      actionBy: adminUser.id,
      actionByEmail: adminUser.email,
      actionType,
      actionReason,
      targetId,
      targetCollection,
      actionTimestamp: serverTimestamp(),
      metadata: metadata || null,
    });
  }

  // --- User Management ---
  async toggleUserBlock(userId: string, currentBlocked: boolean, reason: string) {
    if (!isFirebaseConfigured()) return;
    await updateDoc(doc(getDb(), 'users', userId), { blocked: !currentBlocked });
    await this.logAction(
      !currentBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
      reason,
      userId,
      'users'
    );
  }

  async changeUserRole(userId: string, newRole: 'admin' | 'user', reason: string) {
    if (!isFirebaseConfigured()) return;
    await updateDoc(doc(getDb(), 'users', userId), { role: newRole });
    await this.logAction('CHANGE_ROLE', reason, userId, 'users', { newRole });
  }

  // --- Committee Management ---
  async updateCommitteeStatus(committeeId: string, newStatus: CommitteeStatus, reason: string) {
    if (!isFirebaseConfigured()) return;
    await updateDoc(doc(getDb(), 'committees', committeeId), { status: newStatus });
    await this.logAction('UPDATE_COMMITTEE_STATUS', reason, committeeId, 'committees', { newStatus });
  }

  // --- Fraud Operations ---
  async resolveFraudReport(reportId: string, resolutionNote: string, recalculateScore: boolean, targetUserId: string) {
    if (!isFirebaseConfigured()) return;
    const adminUser = this.auth.currentUser();
    if (!adminUser) throw new Error('Unauthorized');

    await updateDoc(doc(getDb(), 'fraudReports', reportId), {
      resolved: true,
      resolvedAt: serverTimestamp(),
      resolvedBy: adminUser.id,
      resolutionNote,
    });

    if (recalculateScore && targetUserId) {
      // In a real app, this would trigger a Cloud Function to recalculate based on complex logic.
      // For this frontend demo, we apply a severe penalty directly.
      const userRef = doc(getDb(), 'users', targetUserId);
      await updateDoc(userRef, {
        trustScore: 300 // Set to minimum viable score indicating extreme risk
      });
    }

    await this.logAction('RESOLVE_FRAUD', resolutionNote, reportId, 'fraudReports', { recalculateScore });
  }

  async dismissFraudReport(reportId: string, reason: string) {
    if (!isFirebaseConfigured()) return;
    const adminUser = this.auth.currentUser();
    if (!adminUser) throw new Error('Unauthorized');

    await updateDoc(doc(getDb(), 'fraudReports', reportId), {
      resolved: true,
      resolvedAt: serverTimestamp(),
      resolvedBy: adminUser.id,
      resolutionNote: `Dismissed: ${reason}`,
    });

    await this.logAction('DISMISS_FRAUD', reason, reportId, 'fraudReports');
  }

  // --- Dispute Management ---
  async resolveDispute(disputeId: string, resolution: DisputeStatus, reason: string) {
    if (!isFirebaseConfigured()) return;
    const adminUser = this.auth.currentUser();
    if (!adminUser) throw new Error('Unauthorized');

    await updateDoc(doc(getDb(), 'disputes', disputeId), {
      status: resolution,
      resolutionNote: reason,
      resolvedAt: serverTimestamp(),
      assigneeAdminId: adminUser.id,
    });

    await this.logAction('RESOLVE_DISPUTE', reason, disputeId, 'disputes', { resolution });
  }
}
