import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { isFirebaseConfigured } from '../../../environments/environment';
import { getFirebaseAuth } from '../firebase/firebase-app';
import { AuthService } from '../services/auth.service';
import { waitForUserContext } from './guards.util';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);

  if (!isFirebaseConfigured()) {
    if (auth.isAuthenticated() && auth.currentUser()) {
      await auth.navigateAfterLogin(auth.currentUser()!);
      return false;
    }
    return true;
  }

  const fbUser = await new Promise<import('firebase/auth').User | null>(resolve => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), u => {
      unsub();
      resolve(u);
    });
  });

  if (!fbUser) {
    return true;
  }

  await waitForUserContext(auth);
  if (auth.currentUser()) {
    await auth.navigateAfterLogin(auth.currentUser()!);
    return false;
  }
  return true;
};
