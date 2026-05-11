import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { waitForUserContext } from './guards.util';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForUserContext(auth);
  return auth.hasRole('admin') ? true : router.parseUrl('/dashboard');
};
