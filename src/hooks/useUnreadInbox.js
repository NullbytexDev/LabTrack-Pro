import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';

/** Number of unread messages waiting in the signed-in member's inbox. */
export default function useUnreadInbox() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!user?.id) {
      setUnread(0);
      return;
    }
    try {
      const response = await api.functions.invoke('inbox', { action: 'unread' });
      setUnread(Number(response.data?.unread) || 0);
    } catch {
      setUnread(0);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onUpdated = () => load();
    window.addEventListener('labtrack:inbox-updated', onUpdated);
    window.addEventListener('focus', onUpdated);
    const timer = window.setInterval(load, 20000);
    return () => {
      window.removeEventListener('labtrack:inbox-updated', onUpdated);
      window.removeEventListener('focus', onUpdated);
      window.clearInterval(timer);
    };
  }, [load]);

  // A message that arrives or is read elsewhere updates the badge immediately.
  useEffect(() => {
    if (!user?.id) return undefined;
    const unsubscribe = api.entities.Message.subscribe(() => load());
    return () => unsubscribe?.();
  }, [user?.id, load]);

  return unread;
}