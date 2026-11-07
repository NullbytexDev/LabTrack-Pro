import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PermissionDenied({ title = 'This area is instructor only', description }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldAlert className="h-6 w-6 text-destructive" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description ||
          'Your role does not include this permission. Permissions are checked on the server, so this page cannot be opened by changing the address.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/labs">Go to Labs</Link>
        </Button>
        <Button asChild>
          <Link to="/">Back to Overview</Link>
        </Button>
      </div>
    </div>
  );
}