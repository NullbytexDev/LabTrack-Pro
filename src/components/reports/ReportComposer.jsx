import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { STATUS_META } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';

export default function ReportComposer({ labs, onSubmitted }) {
  const [labId, setLabId] = useState('');
  const [pcs, setPcs] = useState(null);
  const [pcId, setPcId] = useState('');
  const [status, setStatus] = useState('minor_issue');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setPcs(null);
    setPcId('');
    if (!labId) return () => { alive = false; };
    api.entities.PC
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

  const options = [
    { value: 'minor_issue', label: 'Minor Issue', blurb: 'Still usable with a small fault' },
    { value: 'need_repair', label: 'Needs Repair', blurb: 'Out of service until fixed' },
  ];

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!pcId) {
      setError('Choose the computer you are reporting.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Describe the issue in at least 10 characters.');
      return;
    }
    setBusy(true);
    try {
      const response = await api.functions.invoke('submitReport', {
        pc_id: pcId,
        reported_status: status,
        description: description.trim(),
      });
      const warning = response?.mail_warning || response?.data?.mail_warning;
      toast({ title: 'Your report was successfully submitted.' });
      if (warning) toast({ title: 'Confirmation email not sent', description: warning });
      setDescription('');
      setPcId('');
      onSubmitted?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'That report could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface p-5">
      <h2 className="text-sm font-semibold">Report a fault</h2>
      <p className="mt-1 text-xs text-muted-foreground">Takes about ten seconds — no paperwork.</p>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="report-lab">Lab</Label>
          <Select value={labId} onValueChange={setLabId}>
            <SelectTrigger id="report-lab">
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
          <Label htmlFor="report-pc">Computer</Label>
          <Select value={pcId} onValueChange={setPcId} disabled={!labId || pcs === null}>
            <SelectTrigger id="report-pc">
              <SelectValue placeholder={!labId ? 'Pick a lab first' : pcs === null ? 'Loading…' : 'Choose a computer'} />
            </SelectTrigger>
            <SelectContent>
              {(pcs || []).map((pc) => (
                <SelectItem key={pc.id} value={pc.id}>
                  {pc.identifier}
                  {pc.label ? ` · ${pc.label}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">What is wrong?</legend>
          <div className="mt-2 grid gap-2">
            {options.map((option) => {
              const meta = STATUS_META[option.value];
              const active = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  aria-pressed={active}
                  className={`glow-hover flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left ${
                    active ? `${meta.chip} ring-1 ${meta.ring}` : 'border-border/70 bg-card/60 text-muted-foreground'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-[11px] opacity-80">{option.blurb}</span>
                  </span>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="report-description">What happened?</Label>
          <Textarea
            id="report-description"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="For example: monitor does not wake up from sleep and the keyboard light is off."
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" /> Send report
            </>
          )}
        </Button>
      </div>
    </form>
  );
}