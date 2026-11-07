// AI triage of unresolved reports — instructors and lab assistants only
import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import AiTriageItem from '@/components/reports/AiTriageItem';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function AiTriageCard() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await api.functions.invoke('aiAssist', { action: 'triage' });
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'The triage could not run. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">AI triage</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Sorts the unresolved reports by how much they block a lab session.
            </p>
          </div>
        </div>
        <Button size="sm" variant={data ? 'outline' : 'default'} onClick={run} disabled={busy}>
          {busy ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : data ? (
            <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Sparkles className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          )}
          {busy ? 'Triaging…' : data ? 'Refresh' : 'Triage reports'}
        </Button>
      </div>

      {error && <p className="mt-3 text-xs leading-relaxed text-destructive">{error}</p>}

      {data && (
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-foreground/85">{data.summary}</p>
          {data.items?.length > 0 && (
            <ul className="mt-4 space-y-3">
              {data.items.map((item) => (
                <AiTriageItem key={item.report_id} item={item} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}