import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/api/client';
import { STATUS_META, ROLE_META } from '@/lib/constants';
import { Inbox } from 'lucide-react';

export default function ReportFeed({ reloadKey = 0, role }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setItems(null);
    api.functions
      .invoke('reportsList', { limit: 40 })
      .then((response) => {
        if (alive) setItems(response.data?.items || []);
      })
      .catch(() => {
        if (alive) {
          setItems([]);
          setError('Reports could not be loaded right now.');
        }
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  return (
    <section aria-label="Report feed" className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{role === 'instructor' ? 'Every report' : 'Your reports'}</h2>
        <span className="text-[11px] text-muted-foreground">Newest first</span>
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      {items === null && (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-16 animate-pulse rounded-xl bg-secondary/70" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="mt-8 text-center">
          <Inbox className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium">No reports yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Reports you file appear here with their condition colour.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="mt-4 divide-y divide-border/70">
          {items.map((report) => {
            const meta = STATUS_META[report.reported_status] || STATUS_META.minor_issue;
            const reporter = report.reporter_name || 'Unknown reporter';
            const reporterRole = ROLE_META[report.reporter_role]?.label || report.reporter_role || '';
            return (
              <li key={report.id} className="glow-target fade-in py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
                    {meta.label}
                  </span>
                  <span className="mono-id text-sm font-semibold">{report.pc_identifier}</span>
                  <span className="text-xs text-muted-foreground">{report.lab_name}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {report.created_date ? formatDistanceToNow(new Date(report.created_date), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{report.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {reporter}
                  {reporterRole ? ` · ${reporterRole}` : ''}
                  {report.reporter_reference ? ` · ${report.reporter_reference}` : ''}
                  {report.status ? ` · ${report.status.replace('_', ' ')}` : ''}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}