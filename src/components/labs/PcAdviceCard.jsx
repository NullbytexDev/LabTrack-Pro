// AI diagnosis for one computer, from its configuration, notes, reports and history
import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

const SEVERITY = {
  high: 'border-status-repair/40 bg-status-repair/10 text-status-repair',
  medium: 'border-status-minor/40 bg-status-minor/10 text-status-minor',
  low: 'border-border/70 bg-secondary/60 text-muted-foreground',
};

export default function PcAdviceCard({ pc }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await api.functions.invoke('aiAssist', { action: 'pc_advice', pc_id: pc.id });
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'The advice could not be generated. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 border-t border-border/70 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">AI diagnosis</p>
        <Button size="sm" variant={data ? 'ghost' : 'outline'} onClick={run} disabled={busy}>
          {busy ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          )}
          {busy ? 'Thinking…' : data ? 'Refresh' : 'Get advice'}
        </Button>
      </div>

      {error && <p className="mt-2 text-xs leading-relaxed text-destructive">{error}</p>}

      {data && (
        <div className="mt-3 space-y-3">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              SEVERITY[data.severity] || SEVERITY.medium
            }`}
          >
            {data.severity} priority
          </span>
          <p className="text-xs leading-relaxed text-foreground/85">{data.diagnosis}</p>

          {data.likely_causes?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Likely causes</p>
              <ul className="mt-1 space-y-1">
                {data.likely_causes.map((cause) => (
                  <li key={cause} className="border-l-2 border-primary/25 pl-2 text-xs leading-relaxed text-foreground/85">
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.steps?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Checks, in order</p>
              <ol className="mt-1 space-y-1">
                {data.steps.map((step, index) => (
                  <li key={step} className="text-xs leading-relaxed text-foreground/85">
                    <span className="mr-1.5 font-semibold text-primary">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}