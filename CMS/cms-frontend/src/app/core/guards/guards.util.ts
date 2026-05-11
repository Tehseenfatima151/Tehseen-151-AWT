import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export async function waitForUserContext(auth: AuthService, maxMs = 4000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const u = auth.currentUser();
    if (u?.id) {
      return;
    }
    await new Promise(r => setTimeout(r, 40));
  }
}

export function kycResumePath(auth: AuthService): string {
  const p = auth.firestoreUser();
  const step = p?.kycLatestStep ?? auth.currentUser()?.kycLatestStep;
  if (step === 'financial') {
    return '/kyc/financial';
  }
  if (step === 'identity') {
    return '/kyc/identity';
  }
  if (step === 'review') {
    return '/kyc/review';
  }
  return '/kyc/personal';
}
