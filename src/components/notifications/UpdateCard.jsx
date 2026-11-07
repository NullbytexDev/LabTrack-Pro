import React from 'react';
import { Link } from 'react-router-dom';
import StatusPill from '@/components/common/StatusPill';
import { timeAgo, roleLabel } from '@/lib/format';
import { STATUS_META } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { BellRing, Check, MessageSquareWarning, Trash2 } from 'lucide-react';

const STATUS_LABEL = {
  resolved: { label: 'Marked fixed', className: 'border-status-available/30 bg-status-available/10 text-status-available' },
  dismissed: { label: 'Closed', className: 'border-border bg-secondary text-muted-foreground' },
  revision_pending: { label: 'Waiting on instructor', className: 'border-status-revision/40 bg-status-revision/10 text-status-revision' },
  in_review: { label: 'In review', className: 'border-primary/30 bg-primary/10 text-primary' },
  open: { label: 'Open', className: 'border-status-minor/30 bg-status-minor/10 text-status-minor' },
};

/** One update addressed to this member: what an instructor did, in their words. */
export default function UpdateCard({ notification, onOpen, onRevision, onDelete }) {
  const status = STATUS_LABEL[notification.report_status] || STATUS_LABEL.open;
  const canRevise =
    Boolean(onRevision) &&
    notification.kind === 'resolution' &&
    notification.report_status === 'resolved';

  return (
    <article className="surface surface-lift p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold">
            {notification.pc_identifier}
            {notification.lab_name ? ` · ${notification.lab_name}` : ''}
          </p>
          {!notification.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}>
          {status.label}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{notification.body || notification.issue_summary}</p>

      {notification.revision_note && (
        <p className="mt-2 rounded-xl border border-status-revision/30 bg-status-revision/[0.07] px-3 py-2 text-xs leading-relaxed text-foreground/85">
          Follow-up: {notification.revision_note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {STATUS_META[notification.reported_status] && <StatusPill status={notification.reported_status} size="sm" />}
        <span>
          {notification.actor_name ? `${notification.actor_name} · ${roleLabel(notification.actor_role)} · ` : ''}
          {timeAgo(notification.submitted_at)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/reports" className="font-medium text-primary hover:underline">
            Open report
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(notification)}
              aria-label="Delete notification"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {(canRevise || (onOpen && !notification.is_read)) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 pt-3.5">
          {canRevise && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRevision(notification)}
              className="h-9 gap-2 rounded-full border-status-revision/45 bg-status-revision/10 px-4 text-[12px] font-semibold text-status-revision shadow-none transition-colors hover:border-status-revision/70 hover:bg-status-revision/20 hover:text-status-revision"
            >
              <MessageSquareWarning className="h-3.5 w-3.5" aria-hidden="true" />
              Follow up: still not fixed
            </Button>
          )}

          {onOpen && !notification.is_read && (
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <Check className="h-3 w-3" aria-hidden="true" /> Mark as read
            </button>
          )}
        </div>
      )}
    </article>
  );
}