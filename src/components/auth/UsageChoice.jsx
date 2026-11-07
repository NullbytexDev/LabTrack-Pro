import React from 'react';
import UsageSwitch from '@/components/account/UsageSwitch';
import { Activity } from 'lucide-react';

/** Usage-statistics choice shown while an account is being created. */
export default function UsageChoice({ checked, onChange, disabled }) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
      <div className="flex items-start gap-3">
        <Activity className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Send Usage Statistics</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            May we collect anonymous usage statistics — which pages are opened and which tools are used — to see how
            LabTrack Pro is doing? It never includes your reports, messages, name or email. You can change this any time
            in Account settings → Privacy.
          </p>
        </div>
        <div className="shrink-0 pt-0.5">
          <UsageSwitch checked={checked} disabled={disabled} onChange={onChange} />
        </div>
      </div>
      <p className="mt-3 text-[11px] font-medium leading-relaxed text-muted-foreground">
        {checked
          ? 'Usage statistics will be shared.'
          : 'You are opting out — no usage statistics will be shared.'}
      </p>
    </div>
  );
}