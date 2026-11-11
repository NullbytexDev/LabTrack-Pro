import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/api/apiClient';
import useProfile from '@/hooks/useProfile';
import { setTrackingPreference } from '@/lib/tracking';
import { Activity, Loader2 } from 'lucide-react';

const KEY = 'labtrack-usage-prompt-shown';

/** Asks for permission to send usage statistics once per sign-in, until answered. */
export default function UsageStatisticsPrompt() {
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');

  const answered = Boolean(profile?.usage_stats_answered_at);

  useEffect(() => {
    if (!profile || answered) return;
    try {
      if (sessionStorage.getItem(KEY) === '1') return;
    } catch {
      return;
    }
    // Let any other sign-in notice close first, so dialogs never stack.
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (!document.querySelector('[role="dialog"]')) {
        setOpen(true);
        clearInterval(timer);
      } else if (tries > 20) {
        clearInterval(timer);
      }
    }, 400);
    return () => clearInterval(timer);
  }, [profile?.id, answered]);

  const choose = async (enabled) => {
    setSaving(enabled);
    setError('');
    try {
      await api.functions.invoke('accountUpdate', { tracking_opt_out: !enabled });
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {
        // Storage blocked: the question simply waits for the next visit.
      }
      setTrackingPreference(!enabled);
      window.dispatchEvent(new Event('labtrack:profile-updated'));
      setOpen(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'That choice could not be saved. Try again from Account settings → Privacy.');
      setSaving(null);
      setOpen(false);
    }
  };

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      // Blocked storage means the question shows again next time.
    }
    setOpen(false);
  };

  if (!profile || answered) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            Send Usage Statistics?
          </DialogTitle>
          <DialogDescription>
            May we collect anonymous usage statistics — which pages are opened and which tools are used — to see how
            LabTrack Pro is doing? It never includes your reports, messages, name or email.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3 text-xs leading-relaxed text-muted-foreground">
          Saying no changes nothing about how the app works for you. You can switch Send Usage Statistics on or off at
          any time in Account settings → Privacy.
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => choose(false)} disabled={saving !== null}>
            {saving === false ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Don&apos;t send
          </Button>
          <Button type="button" onClick={() => choose(true)} disabled={saving !== null}>
            {saving === true ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Send usage statistics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}