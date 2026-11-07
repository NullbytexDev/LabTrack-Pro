import React from 'react';
import { Monitor } from 'lucide-react';
import { STATUS_META } from '@/lib/constants';

export default function PcTile({ pc, selected, onSelect }) {
  const meta = STATUS_META[pc.status] || STATUS_META.available;

  return (
    <button
      type="button"
      onClick={() => onSelect(pc)}
      aria-pressed={selected}
      aria-label={`${pc.identifier}, ${meta.label}`}
      className={`group relative flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all duration-300 focus-visible:outline-none ${
        selected
          ? 'border-primary/60 bg-primary/[0.07] shadow-[0_16px_38px_-26px_rgba(53,211,197,0.85)]'
          : 'border-border/70 bg-card/75 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_34px_-28px_rgba(11,16,32,0.7)]'
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <Monitor className={`h-4 w-4 ${meta.tone}`} aria-hidden="true" />
        <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
      </span>
      <span className="mono-id text-[11px] font-semibold leading-tight">{pc.identifier}</span>
      <span className="text-[10px] font-medium leading-tight text-muted-foreground">{meta.short}</span>
    </button>
  );
}