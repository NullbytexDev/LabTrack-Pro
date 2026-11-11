import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getSessionId, resetSessionRecord } from '@/lib/signInSession';
import { timeAgo, formatDateTime } from '@/lib/format';
import { MonitorSmartphone, LogOut, Loader2, ShieldAlert } from 'lucide-react';

/** Live devices on this account, plus the sign-in devices detected for the first time. */
export default function ActiveSessions() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    let alive = true;
    api.functions
      .invoke('signInEvents', { action: 'sessions', session_id: getSessionId() })
      .then((response) => {
        if (alive) setSessions(response.data?.sessions || []);
      })
      .catch((err) => {
        if (!alive) return;
        setSessions([]);
        setError(err?.response?.data?.error || 'Your devices could not be loaded.');
      });
    return () => {
      alive = false;
    };
  }, []);

  const signOutDevice = async (session) => {
    setBusyId(session.id);
    setError('');
    try {
      await api.functions.invoke('signInEvents', { action: 'sign_out', id: session.id });
      if (session.current) {
        // This device's session is over, so leave the app entirely.
        resetSessionRecord();
        api.auth.logout('/login?session=ended');
        return;
      }
      setSessions((current) => (current || []).filter((item) => item.id !== session.id));
      toast({ title: 'Device signed out', description: `${session.device} must sign in again to use LabTrack Pro.` });
    } catch (err) {
      setError(err?.response?.data?.error || 'That device could not be signed out.');
    } finally {
      setBusyId('');
    }
  };

  const newDevices = (sessions || []).filter((session) => session.new_device);

  return (
    <section className="surface p-5" aria-label="Active sessions">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MonitorSmartphone className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Active sessions</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Every device signed in to this account right now. A new sign-in sends an alert to your email, and a session
            ends by itself after 14 days without use.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {newDevices.length > 0 && (
        <div className="mt-4 rounded-xl border border-status-minor/40 bg-status-minor/10 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-status-minor">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> New sign-in devices
          </p>
          <ul className="mt-1.5 space-y-1">
            {newDevices.map((device) => (
              <li key={device.id} className="text-[11px] text-muted-foreground">
                {device.device} · first seen {formatDateTime(device.occurred_at)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sessions === null ? (
        <div className="mt-4 space-y-2" role="status" aria-live="polite">
          <span className="sr-only">Loading your devices</span>
          {[0, 1].map((key) => (
            <div key={key} className="h-14 animate-pulse rounded-xl bg-secondary/70" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No active sessions are recorded for this account yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/60">
          {sessions.map((session) => (
            <li key={session.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/70 text-muted-foreground">
                <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {session.device}
                  {session.current && (
                    <span className="rounded-full border border-status-available/40 bg-status-available/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-available">
                      This device
                    </span>
                  )}
                  {session.new_device && (
                    <span className="rounded-full border border-status-minor/40 bg-status-minor/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-minor">
                      New device
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  Signed in {formatDateTime(session.occurred_at)} · last active {timeAgo(session.last_seen_at)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={busyId === session.id}
                onClick={() => signOutDevice(session)}
              >
                {busyId === session.id ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                )}
                Sign out
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}