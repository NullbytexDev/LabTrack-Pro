import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import StatusPill from '@/components/common/StatusPill';
import { configurationSummary } from '@/components/edit/PcConfigFields';
import { timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import PcAdviceCard from '@/components/labs/PcAdviceCard';
import { AlertTriangle, Lock, X, ClipboardList, Wrench } from 'lucide-react';

export default function PcDetailPanel({ pc, labName, role, signedIn, onReport, onClose, refreshKey }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    if (!pc || !signedIn) return undefined;
    let alive = true;
    setEvents(null);
    api.functions
      .invoke('listHistory', { pc_id: pc.id, limit: 5 })
      .then((response) => {
        if (alive) setEvents(response.data?.events || []);
      })
      .catch(() => {
        if (alive) setEvents([]);
      });
    return () => {
      alive = false;
    };
  }, [pc?.id, signedIn, refreshKey]);

  if (!pc) {
    return (
      <div className="surface flex h-full min-h-[240px] flex-col items-center justify-center p-6 text-center">
        <ClipboardList className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium">Pick a computer</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Select any PC tile to see its identifier, lab, current status and recent issue history.
        </p>
      </div>
    );
  }

  return (
    <div className="surface sticky top-20 p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{labName}</p>
          <h3 className="mono-id mt-1 text-lg font-semibold">{pc.identifier}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Close computer details"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusPill status={pc.status} />
        {pc.label && <span className="text-xs text-muted-foreground">{pc.label}</span>}
      </div>

      {signedIn && pc.notes && (
        <p className="mt-3 rounded-xl bg-secondary/70 p-3 text-xs leading-relaxed text-foreground/80">{pc.notes}</p>
      )}

      <div className="mt-4 border-t border-border/70 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Configuration</p>
        {signedIn ? (
          configurationSummary(pc) ? (
            <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{configurationSummary(pc)}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Configuration has not been recorded yet. Lab staff can add it in Edit Labs &amp; PCs.
            </p>
          )
        ) : (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            <Link to="/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            to see this computer's configuration.
          </p>
        )}
      </div>

      <div className="mt-4">
        {role === 'student' || role === 'lab_assistant' ? (
          <Button className="w-full" onClick={() => onReport(pc)}>
            <AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" /> Report an issue
          </Button>
        ) : signedIn ? (
          <Button asChild variant="outline" className="w-full">
            <Link to="/edit">
              <Wrench className="mr-2 h-4 w-4" aria-hidden="true" /> Update status in Edit Labs
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link to="/signin">
              <Lock className="mr-2 h-4 w-4" aria-hidden="true" /> Sign in to report
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-5 border-t border-border/70 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Issue history</p>
        {!signedIn ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Issue history is limited to signed-in members.{' '}
            <Link to="/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            to view it.
          </p>
        ) : events === null ? (
          <p className="mt-2 text-xs text-muted-foreground">Loading history…</p>
        ) : events.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No reports or status changes recorded for this PC yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {events.map((event) => (
              <li key={event.id} className="border-l-2 border-primary/25 pl-3">
                <p className="text-xs leading-snug text-foreground/85">{event.description}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {timeAgo(event.occurred_at)} · {event.actor_name || 'System'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {signedIn && <PcAdviceCard key={pc.id} pc={pc} />}
    </div>
  );
}