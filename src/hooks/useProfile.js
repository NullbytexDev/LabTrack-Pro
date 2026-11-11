import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { storeTrackingOptOut } from '@/lib/trackingPreference';

/** Shared, identity-scoped profile cache: navigation never restarts the account check. */
export default function useProfile() {
  const { user, isLoadingAuth } = useAuth();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const page = await entities.Profile.filter({ user_id: user.id }, { limit: 1 });
      return page.items[0] || null;
    },
    staleTime: 60000,
    refetchOnMount: false,
    retry: false,
  });
  const refresh = useCallback(() => client.invalidateQueries(
    { queryKey: ['profile', user?.id] }, { cancelRefetch: false },
  ), [client, user?.id]);
  useEffect(() => {
    window.addEventListener('labtrack:profile-updated', refresh);
    return () => window.removeEventListener('labtrack:profile-updated', refresh);
  }, [refresh]);
  const profile = user ? query.data || null : null;

  // Keep "Send Usage Statistics" in step with the stored preference.
  useEffect(() => {
    if (profile) storeTrackingOptOut(profile.tracking_opt_out === true);
  }, [profile?.id, profile?.tracking_opt_out]);
  const role = profile?.role || (user?.role === 'admin' ? 'instructor' : null);
  return {
    user, profile, role, refresh,
    loading: isLoadingAuth || Boolean(user?.id && query.isPending),
    error: user ? query.error : null,
    isInstructor: role === 'instructor',
    canReport: role === 'student' || role === 'lab_assistant',
  };
}