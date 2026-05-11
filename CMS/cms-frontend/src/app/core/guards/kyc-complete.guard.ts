import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { kycResumePath, waitForUserContext } from './guards.util';

/** Blocks main app until user finished KYC wizard (submitted or approved). Admins bypass. */
export const kycCompleteGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForUserContext(auth);
  const u = auth.currentUser();
  if (!u) {
    return router.parseUrl('/login');
  }
  if (auth.hasRole('admin')) {
    return true;
  }
  const status = auth.firestoreUser()?.kycStatus ?? u.kycStatus;
  if (status === 'approved' || status === 'submitted') {
    return true;
  }
  return router.parseUrl(kycResumePath(auth));
};
