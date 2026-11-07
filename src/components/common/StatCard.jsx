import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'text-primary' }) {
  return (
    <div className="surface surface-lift p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary">
            <Icon className={cn('h-4 w-4', tone)} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}