import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Material-style on/off switch for "Send Usage Statistics".
 * On: a filled track with a large handle. Off: an outlined track with a small
 * handle — the same proportions Material uses, so both states read as one control.
 */
export default function UsageSwitch({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Send Usage Statistics"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full transition-colors duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-primary shadow-inner hover:bg-primary/90'
          : 'bg-foreground/[0.12] shadow-inner ring-1 ring-inset ring-foreground/25 hover:bg-foreground/[0.18] hover:ring-foreground/40',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none block rounded-full transition-all duration-300 ease-out',
          checked
            ? 'h-6 w-6 translate-x-[1.5rem] bg-primary-foreground shadow-[0_1px_3px_rgba(0,0,0,0.45)]'
            : 'h-4 w-4 translate-x-2 bg-foreground/70 shadow-[0_1px_2px_rgba(0,0,0,0.35)] group-hover:bg-foreground/85',
        )}
      />
    </button>
  );
}