import React from 'react';

/** Shared copyright block: bold, tightly typeset, with a hairline finish. */
export default function CopyrightNotice({ className = '' }) {
  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      <p className="font-semibold text-foreground/90">
        Designed and developed by{' '}
        <span className="font-extrabold tracking-tight text-primary">Nullbytex</span>
      </p>
      <p className="font-semibold text-foreground/75">
        Concept provided by <span className="font-bold text-foreground/90">Tanbihul Asrar</span>
      </p>
      <div className="hairline my-2" aria-hidden="true" />
      <p className="font-bold uppercase tracking-[0.12em] text-foreground/60">
        © 2026 LabTrack Pro · FCI · All rights reserved
      </p>
    </div>
  );
}