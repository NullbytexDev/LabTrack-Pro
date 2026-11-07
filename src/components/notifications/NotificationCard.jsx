import React from 'react';
import { STATUS_META } from '@/lib/constants';
import { timeAgo, roleLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';

const REPORT_STATUS = {
  open: { label: 'Open', className: 'border-status-minor/30 bg-status-minor/10 text-status-minor' },
  in_review: { label: 'In review', className: 'border-primary/30 bg-primary/10 text-primary' },
  resolved: { label: 'Resolved', className: 'border-status-available/30 bg-status-available/10 text-status-available' },
  dismissed: { label: 'Dismissed', className: 'border-border bg-secondary text-muted-foreground' },
};

export default function NotificationCard({ notification, onOpen }) {
  const status = REPORT_STATUS[notification.report_status] || REPORT_STATUS.open;
  const reported = STATUS_META[notification.reported_status];

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className="surface surface-lift w-full p-5 text-left focus-visible:outline-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {notification.reporter_name}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {roleLabel(notification.reporter_role)}
            </span>
            {!notification.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {notification.reporter_reference ? `${notification.reporter_reference} · ` : ''}
            {timeAgo(notification.submitted_at)}
          </p>
        </div>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/85">{notification.issue_summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="mono-id rounded bg-secondary px-1.5 py-0.5">{notification.pc_identifier}</span>
        <span>{notification.lab_name}</span>
        {reported && (
          <span className="inline-flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${reported.dot}`} aria-hidden="true" />
            reported {reported.label}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
          Review <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}