import React from 'react';
import useProfile from '@/hooks/useProfile';
import PageLoader from '@/components/common/PageLoader';
import PermissionDenied from '@/components/common/PermissionDenied';

/** Route-level UI guard. The same rule is enforced again in the backend functions. */
export default function RoleGate({ allow = ['instructor'], children, title, description }) {
  const { role, loading } = useProfile();

  if (loading) return <PageLoader label="Checking your permissions" />;
  if (!allow.includes(role)) return <PermissionDenied title={title} description={description} />;

  return children;
}