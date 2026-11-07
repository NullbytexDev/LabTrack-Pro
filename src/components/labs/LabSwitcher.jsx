import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { MonitorSmartphone } from 'lucide-react';
import { labTitle } from '@/lib/format';

/** Subpage buttons: one per lab, opening that lab's arrangement of PCs. */
export default function LabSwitcher({ labs, activeId, counts = {} }) {
  const reduce = useReducedMotion();

  return (
    <nav aria-label="Choose a lab" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {labs.map((lab, index) => {
        const active = lab.id === activeId;
        const entry = counts[lab.id] || { total: 0, available: 0, attention: 0 };
        return (
          <motion.div
            key={lab.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={`/layout/${lab.id}`}
              aria-current={active ? 'page' : undefined}
              data-active={active ? 'true' : 'false'}
              className={`glow-target glow-hover flex h-full flex-col justify-between gap-2 rounded-2xl border px-4 py-3 ${
                active
                  ? 'border-primary/60 bg-primary/[0.09] shadow-[0_0_28px_-14px_hsl(var(--primary)/0.9)]'
                  : 'border-border/70 bg-card/60'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{labTitle(lab)}</span>
                {lab.code && (
                  <span className="mono-id rounded-md border border-border/70 bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {lab.code}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
                {entry.total} PC{entry.total === 1 ? '' : 's'} · {entry.available} ready
              </span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}