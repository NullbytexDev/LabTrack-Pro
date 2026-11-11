import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { STATUS_META } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

export default function ReportDialog({ pc, open, onOpenChange, onSubmitted }) {
  const [reportedStatus, setReportedStatus] = useState('minor_issue');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setSent(false);
      setError('');
      setDescription('');
      setReportedStatus('minor_issue');
    }
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (description.trim().length < 10) {
      setError('Describe the issue in at least 10 characters so the instructor knows what to check.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.functions.invoke('submitReport', {
        pc_id: pc.id,
        reported_status: reportedStatus,
        description: description.trim(),
      });
      const warning = response?.mail_warning || response?.data?.mail_warning;
      setSent(true);
      toast({ title: 'Your report was successfully submitted.' });
      if (warning) toast({ title: 'Confirmation email not sent', description: warning });
      onSubmitted?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'The report could not be sent. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!pc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report an issue with {pc.identifier}</DialogTitle>
          <DialogDescription>
            Your report is delivered to the instructor and recorded in the lab history. You cannot change a PC to
            Available or Repaired — only an instructor can.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-4 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-available/10">
              <CheckCircle2 className="h-6 w-6 text-status-available" aria-hidden="true" />
            </span>
            <p className="mt-4 font-heading text-lg font-semibold">Your report was successfully submitted.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {pc.identifier} is now marked as {STATUS_META[reportedStatus]?.label || 'reported'} until an instructor
              reviews it.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <fieldset>
              <legend className="text-sm font-medium">Reported condition</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {['minor_issue', 'need_repair'].map((option) => {
                  const meta = STATUS_META[option];
                  const active = reportedStatus === option;
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 transition ${
                        active ? 'border-primary/60 bg-primary/[0.06]' : 'border-border/70 hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reported_status"
                        value={option}
                        checked={active}
                        onChange={() => setReportedStatus(option)}
                        className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                      />
                      <span>
                        <span className="block text-sm font-medium">{meta.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{meta.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor="report-description" className="text-sm font-medium">
                What is wrong?
              </label>
              <Textarea
                id="report-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="For example: the monitor flickers and the keyboard does not respond."
                rows={4}
                maxLength={1000}
              />
              <p className="text-[11px] text-muted-foreground">{description.length}/1000 characters</p>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" aria-hidden="true" /> Send report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}