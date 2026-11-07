import React, { useEffect, useRef, useState } from 'react';

/**
 * Reveals an answer gradually. The reveal state lives here on purpose, so the
 * per-frame updates never re-render the copy and rating controls below it.
 */
export default function AssistantProse({ text, animate, onGrow, onDone }) {
  const [shown, setShown] = useState(animate ? 0 : text.length);
  const growRef = useRef(onGrow);
  const doneRef = useRef(onDone);
  growRef.current = onGrow;
  doneRef.current = onDone;

  useEffect(() => {
    if (!animate) {
      setShown(text.length);
      doneRef.current?.(true);
      return undefined;
    }
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !text) {
      setShown(text.length);
      doneRef.current?.(true);
      return undefined;
    }

    setShown(0);
    let current = 0;
    let frame = 0;
    const step = Math.max(1, Math.ceil(text.length / 54));
    const tick = () => {
      current = Math.min(text.length, current + step);
      setShown(current);
      if (current % (step * 8) === 0 || current === text.length) growRef.current?.();
      if (current < text.length) {
        frame = requestAnimationFrame(tick);
      } else {
        doneRef.current?.(true);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, animate]);

  const complete = shown >= text.length;

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
      {text.slice(0, shown)}
      {!complete && (
        <span
          className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-primary align-baseline"
          aria-hidden="true"
        />
      )}
    </p>
  );
}