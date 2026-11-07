import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Shown instead of a restricted page when the visitor is signed out. */
export default function SignInRequired({ title = 'Sign-in required', description }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Lock className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description ||
          'This page is only available to signed-in LabTrack Pro members. Sign in with your FCI account to continue.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/signin">
            <LogIn className="mr-2 h-4 w-4" aria-hidden="true" /> Sign in
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/labs">Back to Labs</Link>
        </Button>
      </div>
    </div>
  );
}