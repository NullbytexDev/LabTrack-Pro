// LabTrack Pro — FCI computer lab management
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CopyrightNotice from '@/components/layout/CopyrightNotice';
import NavBar from '@/components/layout/NavBar';
import PageTransition from '@/components/layout/PageTransition';
import { LogoMark } from '@/components/brand/Logo';
import { useAuth } from '@/lib/AuthContext';
import useSignInLog from '@/hooks/useSignInLog';
import useSessionGuard from '@/hooks/useSessionGuard';
import PendingAccountMove from '@/components/account/PendingAccountMove';
import SignInConfirmation from '@/components/auth/SignInConfirmation';
import StudentValidityNotice from '@/components/account/StudentValidityNotice';
import UsageStatisticsPrompt from '@/components/account/UsageStatisticsPrompt';
import TwoFactorGate from '@/components/auth/TwoFactorGate';
import AssistantDock from '@/components/ai/AssistantDock';

export default function AppShell() {
  const location = useLocation();
  const { user } = useAuth();
  useSignInLog(user);
  useSessionGuard(user);

  return (
    <div className="relative flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <NavBar />
      <PendingAccountMove user={user} />
      <main id="main-content" className="min-h-[70vh] flex-1 isolate">
        <TwoFactorGate>
          <PageTransition pageKey={location.pathname}>
            <Outlet />
          </PageTransition>
          <SignInConfirmation />
          {user?.id ? <StudentValidityNotice /> : null}
          {user?.id ? <UsageStatisticsPrompt /> : null}
          {user?.id ? <AssistantDock /> : null}
        </TwoFactorGate>
      </main>

      <footer className="mt-16 border-t border-border/60 bg-card/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="font-heading text-sm font-semibold">LabTrack Pro</p>
              <p className="text-xs text-muted-foreground">FCI · Computer Labs</p>
            </div>
          </div>
          <CopyrightNotice className="text-left text-[13px] leading-relaxed text-muted-foreground sm:text-sm" />
        </div>
      </footer>

    </div>
  );
}