import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { formatDateTime, roleLabel } from '@/lib/format';
import StatusPill from '@/components/common/StatusPill';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, Eye, XCircle } from 'lucide-react';

export default function NotificationDetail({ notification, open, onOpenChange, onUpdated }) {
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('repaired');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNote('');
      setNewStatus('repaired');
      setError('');
      setBusy('');
    }
  }, [open, notification?.id]);

  if (!notification) return null;

  const run = async (action) => {
    setBusy(action);
    setError('');
    try {
      const response = await api.functions.invoke('reportAdmin', {
        report_id: notification.report_id,
        action,
        resolution_note: note.trim(),
        new_pc_status: newStatus,
      });
      const warning = response?.mail_warning || response?.data?.mail_warning;
      toast({ title: 'Information successfully updated.' });
      if (warning) toast({ title: 'Email to the reporter not sent', description: warning });
      onUpdated?.();
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'That update could not be saved.');
    } finally {
      setBusy('');
    }
  };

  const reported = STATUS_META[notification.reported_status];
  const finished = notification.report_status === 'resolved' || notification.report_status === 'dismissed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {notification.pc_identifier} · {notification.lab_name}
          </DialogTitle>
          <DialogDescription>
            Reported {formatDateTime(notification.submitted_at)} by {notification.reporter_name} (
            {roleLabel(notification.reporter_role)}
            {notification.reporter_reference ? ` · ${notification.reporter_reference}` : ''})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-secondary/50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {reported && <StatusPill status={notification.reported_status} size="sm" />}
              <span className="text-[11px] text-muted-foreground">reported condition</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{notification.issue_summary}</p>
          </div>

          {finished ? (
            <p className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
              This report is already {notification.report_status}. It stays in the history record.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="resolution-note" className="text-sm font-medium">
                  Resolution note (optional)
                </label>
                <Textarea
                  id="resolution-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you check or replace?"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="new-status" className="text-sm font-medium sm:w-48">
                  Set the computer to
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="new-status" aria-label="New computer status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {!finished && (
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => run('dismiss')} disabled={Boolean(busy)}>
              <XCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Dismiss
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => run('in_review')} disabled={Boolean(busy)}>
                {busy === 'in_review' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Mark in review
              </Button>
              <Button onClick={() => run('resolve')} disabled={Boolean(busy)}>
                {busy === 'resolve' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Resolve report
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}