import React from 'react';
import useProfile from '@/hooks/useProfile';
import ProfileSetupForm from '@/components/auth/ProfileSetupForm';

/**
 * A member who reaches the app without a LabTrack Pro profile — for example one who
 * signed in with Google or Microsoft, which needs no email code — finishes joining here.
 */
export default function ProfileSetupGate({ children }) {
  const { user, profile, loading, error } = useProfile();

  const needsProfile = Boolean(user?.id) && !loading && !error && !profile && user.role !== 'admin';

  if (!needsProfile) return children;
  return <ProfileSetupForm user={user} />;
}