import React from 'react';
import { STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function StatusPill({ status, showDot = true, className, size = 'md' }) {
  const meta = STATUS_META[status] || STATUS_META.available;
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizing,
        meta.chip,
        className,
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />}
      {meta.label}
    </span>
  );
}