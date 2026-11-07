import React from 'react';
import { ROLE_META, ROLE_ORDER } from '@/lib/constants';

export default function RoleTabs({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Choose your role" className="grid gap-2 sm:grid-cols-3">
      {ROLE_ORDER.map((role) => {
        const meta = ROLE_META[role];
        const selected = value === role;
        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(role)}
            className={`group rounded-2xl border px-3 py-3 text-left transition-all duration-300 focus-visible:outline-none ${
              selected
                ? 'border-primary/60 bg-primary/[0.07] shadow-[0_10px_30px_-18px_rgba(53,211,197,0.7)]'
                : 'border-border/80 bg-card/60 hover:-translate-y-0.5 hover:border-primary/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full transition ${selected ? 'bg-primary' : 'bg-muted-foreground/40'}`}
              />
              <span className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>{meta.label}</span>
            </span>
            <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{meta.blurb}</span>
          </button>
        );
      })}
    </div>
  );
}