import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

// What the assistant is actually doing behind the scenes, in the member's words.
const STAGES = [
  { label: 'Reading your lab data', detail: 'labs · computers · statuses' },
  { label: 'Checking open reports', detail: 'who reported what' },
  { label: 'Writing the answer', detail: 'almost there' },
];

/** Thinking indicator shown while the assistant works on a question. */
export default function AssistantThinking({ label = 'LabTrack Pro Assistant' }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setStage((current) => (current + 1) % STAGES.length), 1700);
    return () => window.clearInterval(timer);
  }, []);

  const current = STAGES[stage];

  return (
    <div role="status" aria-live="polite" aria-label={`${label} is thinking: ${current.label}`} className="flex items-start gap-2.5">
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
        <span className="assistant-halo absolute inset-0 rounded-full bg-primary/25" aria-hidden="true" />
        <Sparkles className="relative h-3.5 w-3.5 text-primary" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border/70 bg-secondary/40 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <p key={current.label} className="fade-in-soft assistant-shimmer text-xs font-semibold">
            {current.label}
          </p>
          <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="assistant-dot h-1 w-1 rounded-full bg-primary"
                style={{ animationDelay: `${dot * 160}ms` }}
              />
            ))}
          </span>
        </div>

        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{current.detail}</p>

        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-border/60" aria-hidden="true">
          <span className="assistant-scan block h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  );
}