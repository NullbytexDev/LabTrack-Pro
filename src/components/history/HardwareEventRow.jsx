import React from 'react';
import { STATUS_META, REPORT_ACTION_META, eventTone } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';

/**
 * Hardware activity only: no person, role or account identifiers are shown.
 */
export default function HardwareEventRow({ event }) {
  const meta = REPORT_ACTION_META[event.action] || {
    label: event.action?.replace(/_/g, ' ') || 'Activity',
    tone: 'bg-muted-foreground',
  };

  return (
    <li className="relative pl-6">
      <span className={`absolute left-0 top-[7px] h-2.5 w-2.5 rounded-full ${eventTone(event)}`} aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{meta.label}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={event.occurred_at}>{formatDateTime(event.occurred_at)}</time>
        {event.lab_name && <span>{event.lab_name}</span>}
        {event.pc_identifier && (
          <span className="mono-id rounded bg-secondary px-1.5 py-0.5 text-[11px]">{event.pc_identifier}</span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-foreground/85">{event.description}</p>
      {event.previous_status && event.new_status && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {STATUS_META[event.previous_status]?.label || event.previous_status} →{' '}
          {STATUS_META[event.new_status]?.label || event.new_status}
        </p>
      )}
    </li>
  );
}