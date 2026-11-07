import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/** Computers that keep coming back — ranked by how many reports they collected. */
export default function Watchlist({ reports, pcs }) {
  const rows = useMemo(() => {
    const byPc = new Map();
    reports.forEach((report) => {
      if (!report.pc_id) return;
      const current = byPc.get(report.pc_id) || {
        id: report.pc_id,
        identifier: report.pc_identifier || 'Unknown unit',
        labName: report.lab_name || '',
        labId: report.lab_id,
        count: 0,
        open: 0,
      };
      current.count += 1;
      if (report.status === 'open' || report.status === 'in_review') current.open += 1;
      byPc.set(report.pc_id, current);
    });

    const known = new Set(pcs.map((pc) => pc.id));
    return Array.from(byPc.values())
      .filter((row) => known.size === 0 || known.has(row.id))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reports, pcs]);

  return (
    <section className="surface p-5">
      <header className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-status-minor" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Repeat offenders</h2>
      </header>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Computers with the most reports on record.</p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No repeat faults yet — nothing needs a closer look.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2">
              <span className="font-mono text-[11px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium mono-id">{row.identifier}</p>
                <p className="truncate text-[11px] text-muted-foreground">{row.labName || 'Lab'}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                {row.count}
              </span>
              {row.labId && (
                <Link
                  to={`/layout/${row.labId}`}
                  className="shrink-0 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Open
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}