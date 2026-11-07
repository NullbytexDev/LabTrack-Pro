import React from 'react';
import { LogoMark } from '@/components/brand/Logo';

const UserNotRegisteredError = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="surface w-full max-w-md p-8 text-center">
        <LogoMark className="mx-auto h-10 w-10" />
        <h1 className="mt-5 font-heading text-2xl font-semibold">Access restricted</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You are not registered to use this application. Please contact the lab administrator to request access.
        </p>
        <div className="mt-5 rounded-xl border border-border/70 bg-secondary/50 p-4 text-left text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">If you believe this is an error:</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Verify you are logged in with the correct account</li>
            <li>Contact the app administrator for access</li>
            <li>Try logging out and back in again</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;