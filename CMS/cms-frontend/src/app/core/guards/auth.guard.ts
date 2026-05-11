import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { isFirebaseConfigured } from '../../../environments/environment';
import { getFirebaseAuth } from '../firebase/firebase-app';
import { AuthService } from '../services/auth.service';
import { waitForUserContext } from './guards.util';

export const authGuard: CanActivateFn = async route => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!isFirebaseConfigured()) {
    if (!authService.isAuthenticated()) {
      return router.parseUrl('/login');
    }
    return checkRole(route, authService, router);
  }

  const user = await new Promise<unknown>(resolve => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), u => {
      unsub();
      resolve(u);
    });
  });

  if (!user) {
    return router.parseUrl('/login');
  }

  await waitForUserContext(authService);
  return checkRole(route, authService, router);
};

function checkRole(
  route: { data?: Record<string, unknown> },
  authService: AuthService,
  router: Router,
): boolean | UrlTree {
  const requiredRole = route.data?.['role'] as string | undefined;
  if (requiredRole && !authService.hasRole(requiredRole as 'user' | 'admin')) {
    const userRole = authService.currentUser()?.role;
    if (userRole === 'admin') {
      return router.parseUrl('/admin/overview');
    }
    return router.parseUrl('/dashboard');
  }
  return true;
}
