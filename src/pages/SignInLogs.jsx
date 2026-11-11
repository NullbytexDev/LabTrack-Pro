// Sign-in Logs — the audit trail of newly created LabTrack Pro accounts
import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import SignInRequired from '@/components/common/SignInRequired';
import EmptyState from '@/components/common/EmptyState';
import { ROLE_META } from '@/lib/constants';
import { timeAgo } from '@/lib/format';
import { UserPlus, Clock } from 'lucide-react';

export default function SignInLogs() {
  const { user, loading } = useProfile();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return undefined;
    let alive = true;
    api.functions
      .invoke('memberLogs', {})
      .then((response) => {
        if (alive) setEntries(response.data?.entries || []);
      })
      .catch((err) => {
        if (!alive) return;
        setEntries([]);
        setError(err?.response?.data?.error || 'New accounts could not be loaded.');
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="relative">
      <PageTexture variant="dots" />
      <div className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Activity</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Sign-in Logs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every newly created LabTrack Pro account, newest first — so members can confirm each one is authorised.
            Routine sign-ins are not recorded here; your own devices live under
            <span className="text-foreground"> Account settings → Security</span>.
          </p>
        </header>

        {loading ? (
          <PageLoader label="Loading new accounts" />
        ) : !user ? (
          <div className="mt-6">
            <SignInRequired
              title="Sign-in required"
              description="New account entries are only shown to signed-in members."
            />
          </div>
        ) : (
          <>
            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <section aria-label="New accounts" className="surface mt-6 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">New accounts</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Accounts created in the last seven days. Each entry is deleted automatically after seven days.
                  </p>
                </div>
              </div>

              {entries === null ? (
                <div className="mt-4 space-y-2" role="status" aria-live="polite">
                  <span className="sr-only">Loading new accounts</span>
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-12 animate-pulse rounded-xl bg-secondary/70" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    illustration={<UserPlus className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
                    title="No new accounts this week"
                    description="When someone finishes setting up a LabTrack account, their name, role and ID appear here for seven days."
                  />
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border/60">
                  {entries.map((entry) => (
                    <li key={entry.id} className="grid grid-cols-2 items-center gap-3 py-3 sm:grid-cols-[104px_minmax(0,1fr)_auto_auto]">
                      <span className="mono-id min-w-[104px] text-sm font-semibold">{entry.reference || '—'}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{entry.full_name}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {ROLE_META[entry.role]?.label || entry.role}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] leading-none text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" /><span>{timeAgo(entry.joined_at)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}