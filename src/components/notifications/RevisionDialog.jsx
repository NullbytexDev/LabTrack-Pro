import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

/** Reporter follow-up: "Problem still isn't fixed". */
export default function RevisionDialog({ notification, open, onOpenChange, onSubmitted }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setNote('');
      setError('');
      setBusy(false);
    }
  }, [open, notification?.id]);

  if (!notification) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (note.trim().length < 10) {
      setError('Describe what is still wrong in at least 10 characters.');
      return;
    }
    setBusy(true);
    try {
      const response = await api.functions.invoke('reportAdmin', {
        report_id: notification.report_id,
        action: 'revision',
        resolution_note: note.trim(),
      });
      const warning = response?.mail_warning || response?.data?.mail_warning;
      toast({
        title: 'Follow-up sent',
        description: 'The instructors have been notified that the problem is still there.',
      });
      if (warning) toast({ title: 'Email not sent', description: warning });
      window.dispatchEvent(new Event('labtrack:notifications-updated'));
      onSubmitted?.();
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'Your follow-up could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Problem still isn&apos;t fixed</DialogTitle>
          <DialogDescription>
            {notification.pc_identifier}
            {notification.lab_name ? ` · ${notification.lab_name}` : ''} — your note goes to the instructor who marked
            this fixed and to the other instructors.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="revision-note">What is still wrong?</Label>
            <Textarea
              id="revision-note"
              rows={4}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="The same fault is back as soon as the lab starts."
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Send follow-up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}