import React from 'react';

export default function PageLoader({ label = 'Loading' }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-16 sm:px-6 lg:px-8" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-4 w-32 animate-pulse rounded-full bg-secondary" />
      <div className="h-10 w-72 animate-pulse rounded-2xl bg-secondary" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-28 animate-pulse rounded-3xl bg-secondary/80" />
        ))}
      </div>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-44 animate-pulse rounded-3xl bg-secondary/60" />
        ))}
      </div>
    </div>
  );
}