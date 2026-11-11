import React from 'react';
import { Link } from 'react-router-dom';
import { labTitle } from '@/lib/format';

/**
 * One overview card listing the computers currently sitting in a given status,
 * with the lab each one belongs to and a link straight to its layout.
 */
export default function StatusSection({ title, hint, icon: Icon, tone, chip, emptyText, count, items, labs }) {
  const byId = new Map((labs || []).map((lab) => [lab.id, lab]));

  return (
    <section className="surface flex h-full flex-col p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${chip}`}>
          {count ?? 0}
        </span>
      </header>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((pc) => {
            const lab = byId.get(pc.lab_id);
            return (
              <li
                key={pc.id}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium mono-id">{pc.identifier}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {lab ? `${labTitle(lab)}${lab.code ? ` · ${lab.code}` : ''}` : 'Unknown lab'}
                  </p>
                </div>
                <Link
                  to={`/layout/${pc.lab_id}`}
                  className="shrink-0 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Open
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {(count ?? 0) > items.length && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Showing {items.length} of {count}.{' '}
          <Link to="/labs" className="font-medium text-primary hover:underline">
            Browse the labs
          </Link>
        </p>
      )}
    </section>
  );
}