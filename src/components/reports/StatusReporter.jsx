import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { STATUS_META, INSTRUCTOR_STATUSES } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCheck } from 'lucide-react';

/** Instructors only: mark a computer Repaired (blue) or Available (green). */
export default function StatusReporter({ labs, onSaved }) {
  const [labId, setLabId] = useState('');
  const [pcs, setPcs] = useState(null);
  const [pcId, setPcId] = useState('');
  const [status, setStatus] = useState('repaired');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setPcs(null);
    setPcId('');
    if (!labId) return () => { alive = false; };
    entities.PC
      .filter({ lab_id: labId, lifecycle: 'active' }, { sort: 'identifier', limit: 200 })
      .then((page) => {
        if (alive) setPcs(page.items);
      })
      .catch(() => {
        if (alive) setPcs([]);
      });
    return () => {
      alive = false;
    };
  }, [labId]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!pcId) {
      setError('Choose the computer you are updating.');
      return;
    }
    setBusy(true);
    try {
      const response = await api.functions.invoke('pcAdmin', { action: 'set_status', id: pcId, status });
      toast({ title: 'Information successfully updated.', description: response.data?.message || 'Status saved and logged.' });
      setPcId('');
      onSaved?.();
    } catch (err) {
      const message = err?.response?.data?.error || 'That change was not allowed.';
      setError(message);
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface p-5">
      <h2 className="text-sm font-semibold">Confirm a repair</h2>
      <p className="mt-1 text-xs text-muted-foreground">Instructors report the good news.</p>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="status-lab">Lab</Label>
          <Select value={labId} onValueChange={setLabId}>
            <SelectTrigger id="status-lab">
              <SelectValue placeholder="Choose a lab" />
            </SelectTrigger>
            <SelectContent>
              {labs.map((lab) => (
                <SelectItem key={lab.id} value={lab.id}>
                  {lab.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status-pc">Computer</Label>
          <Select value={pcId} onValueChange={setPcId} disabled={!labId || pcs === null}>
            <SelectTrigger id="status-pc">
              <SelectValue placeholder={!labId ? 'Pick a lab first' : pcs === null ? 'Loading…' : 'Choose a computer'} />
            </SelectTrigger>
            <SelectContent>
              {(pcs || []).map((pc) => (
                <SelectItem key={pc.id} value={pc.id}>
                  {pc.identifier} · {STATUS_META[pc.status]?.label || pc.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">New condition</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {INSTRUCTOR_STATUSES.map((value) => {
              const meta = STATUS_META[value];
              const active = status === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  aria-pressed={active}
                  className={`glow-hover flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    active ? `${meta.chip} ring-1 ${meta.ring}` : 'border-border/70 bg-card/60 text-muted-foreground'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} aria-hidden="true" />
                  {value === 'repaired' ? 'Repaired' : 'Available'}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
            </>
          ) : (
            <>
              <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" /> Update computer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}