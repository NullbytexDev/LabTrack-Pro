import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { labTitle } from '@/lib/format';

export default function LabReadinessList({ labs }) {
  const reduce = useReducedMotion();

  return (
    <section className="surface p-5">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Readiness by lab</h2>
        <span className="text-[11px] text-muted-foreground">{labs.length} active</span>
      </header>

      {labs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No labs on record yet.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {labs.map((lab, index) => (
            <li key={lab.id}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <Link
                  to={`/layout/${lab.id}`}
                  className="group inline-flex min-w-0 items-center gap-1 font-medium transition-colors hover:text-primary"
                >
                  <span className="truncate">{labTitle(lab)}</span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </Link>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {lab.ready}/{lab.total} · {lab.rate}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-teal via-brand-mint to-brand-gold"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${lab.rate}%` }}
                  transition={{ duration: 0.9, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              {lab.attention > 0 && (
                <p className="mt-1 text-[11px] text-status-minor">{lab.attention} need attention</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}