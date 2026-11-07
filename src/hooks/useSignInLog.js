import { useEffect } from 'react';
import { recordSession } from '@/lib/signInSession';

/** Records one sign-in entry per browser session so the account keeps its own history. */
export default function useSignInLog(user) {
  useEffect(() => {
    if (!user?.id) return;
    recordSession(user);
  }, [user?.id]);
}