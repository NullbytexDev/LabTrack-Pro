import { clearPasses } from '@/lib/twoFactorPass';

export function startSignInSession() {
  sessionStorage.removeItem('labtrack-signin-logged');
  sessionStorage.setItem('labtrack:signed-in', '1');
  // A fresh sign-in always asks for a second factor again.
  clearPasses();
}