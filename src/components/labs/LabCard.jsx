import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { STATUS_META } from '@/lib/constants';
import { labTitle } from '@/lib/format';

const ACCENTS = {
  indigo: 'from-[#35D3C5] to-[#11707d]',
  teal: 'from-[#A7D5A6] to-[#35D3C5]',
  violet: 'from-[#4C7FB0] to-[#8FB8D6]',
  amber: 'from-[#EBC15F] to-[#B98A2E]',
  rose: 'from-[#D9778C] to-[#F2B8A0]',
};

export default function LabCard({ lab, counts, opening, onOpen }) {
  const reduce = useReducedMotion();
  const total = counts?.total || 0;
  const available = counts?.available || 0;
  const minor = counts?.minor_issue || 0;
  const repair = counts?.need_repair || 0;
  const repaired = counts?.repaired || 0;
  const revision = counts?.revision_pending || 0;
  const attention = minor + repair + revision;

  // Every computer available is exactly 100% — no rounding drift.
  const ready = total === 0 ? 0 : available === total ? 100 : Math.round((available / total) * 100);

  const segments = [
    { key: 'available', count: available },
    { key: 'minor_issue', count: minor },
    { key: 'need_repair', count: repair },
    { key: 'repaired', count: repaired },
    { key: 'revision_pending', count: revision },
  ].filter((segment) => segment.count > 0);

  const accent = ACCENTS[lab.accent] || ACCENTS.indigo;
  const title = labTitle(lab);

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -5 }}
      animate={opening ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <Link
        to={`/layout/${lab.id}`}
        onClick={(event) => {
          event.preventDefault();
          onOpen(lab);
        }}
        className="surface surface-lift group block overflow-hidden p-0 focus-visible:outline-none"
        aria-label={`Open layout for ${title}`}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {lab.code ? <span className="mono-id mr-2 rounded bg-secondary px-1.5 py-0.5">{lab.code}</span> : null}
                {lab.location || 'Location not set'}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="font-heading text-2xl font-semibold tabular-nums">{total}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">computers</p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              <span className="text-foreground">{available}</span> of {total} available
            </p>
          </div>

          <div
            className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-secondary"
            role="img"
            aria-label={`${ready}% of computers in ${title} are available`}
          >
            {total === 0 ? (
              <span className="h-full w-full bg-border" />
            ) : (
              segments.map((segment) => (
                <span
                  key={segment.key}
                  className={`h-full ${STATUS_META[segment.key].bar}`}
                  style={{ flexGrow: segment.count, flexBasis: 0 }}
                />
              ))
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META.available.dot}`} aria-hidden="true" />
              {available} available
            </span>
            <span className="inline-flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META.need_repair.dot}`} aria-hidden="true" />
              {attention} need attention
            </span>
            {lab.capacity > 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" /> seats {lab.capacity}
              </span>
            )}
            <span className={`ml-auto font-semibold ${ready === 100 ? 'text-status-available' : 'text-foreground'}`}>
              {ready}% ready
            </span>
          </div>

          {lab.description && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{lab.description}</p>}
        </div>
      </Link>
    </motion.div>
  );
}