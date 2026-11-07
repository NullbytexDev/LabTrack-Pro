import React from 'react';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import SignInRequired from '@/components/common/SignInRequired';
import PageLoader from '@/components/common/PageLoader';
import HardwareHistory from '@/components/history/HardwareHistory';

export default function History() {
  const { user, loading } = useProfile();

  return (
    <div className="relative">
      <PageTexture variant="scan" />
      <div className="mx-auto w-full max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Maintenance history</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">What changed, and when</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every report, repair and status change recorded against a computer, in one place. Sign in to open it.
          </p>
        </header>

        {loading ? (
          <PageLoader label="Checking your session" />
        ) : user ? (
          <HardwareHistory />
        ) : (
          <div className="mt-4">
            <SignInRequired
              title="Sign-in required for Hardware History"
              description="Hardware History records who changed what in the labs, so it is limited to signed-in LabTrack members. Sign in with your FCI account to open it."
            />
          </div>
        )}
      </div>
    </div>
  );
}