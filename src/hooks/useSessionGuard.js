import { useEffect } from 'react';
import { api } from '@/api/client';
import { getSessionId, recordSession } from '@/lib/signInSession';

const CHECK_MS = 45000;

/**
 * Keeps this device honest about its session: if the session is signed out
 * from the Sign-in Logs page (here or on another device), the app logs out.
 * Reloading or navigating never re-registers a signed-out session.
 */
export default function useSessionGuard(user) {
  useEffect(() => {
    if (!user?.id) return undefined;
    let alive = true;
    let timer;

    const check = async () => {
      try {
        const response = await api.functions.invoke('signInEvents', { action: 'touch', session_id: getSessionId() });
        if (!alive) return;
        if (response.data?.active === false) {
          api.auth.logout('/login?session=ended');
        }
      } catch {
        // A network hiccup must not sign anyone out.
      }
    };

    recordSession(user).then(() => {
      if (!alive) return;
      check();
      timer = window.setInterval(check, CHECK_MS);
    });

    return () => {
      alive = false;
      if (timer) window.clearInterval(timer);
    };
  }, [user?.id]);
}