import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import SignInRequired from '@/components/common/SignInRequired';

/** Layout route: renders the page for signed-in members, a clear message for visitors. */
export default function RequireSignIn({ title, description }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) return <SignInRequired title={title} description={description} />;

  return <Outlet />;
}