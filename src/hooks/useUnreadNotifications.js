import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';

/** Number of unread notifications for the signed-in member. */
export default function useUnreadNotifications() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!user?.id) {
      setUnread(0);
      return;
    }
    try {
      const response = await api.functions.invoke('listNotifications', { action: 'unread_count' });
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
    window.addEventListener('labtrack:notifications-updated', onUpdated);
    window.addEventListener('focus', onUpdated);
    // A new notification has to show up without a reload.
    const timer = window.setInterval(load, 20000);
    return () => {
      window.removeEventListener('labtrack:notifications-updated', onUpdated);
      window.removeEventListener('focus', onUpdated);
      window.clearInterval(timer);
    };
  }, [load]);

  return unread;
}