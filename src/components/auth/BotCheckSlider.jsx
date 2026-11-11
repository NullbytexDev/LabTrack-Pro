import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

/** Slots the track is divided into; the server decides which one is correct. */
const SLOTS = 24;
/** Horizontal inset of the handle's travel, so it never leaves the pill. */
const EDGE = 24;
/** Width of the arrow handle, used to line the fill up with it. */
const HANDLE = 40;

/**
 * The pill track and its arrow handle.
 * Draggable with a pointer, and fully keyboard operable: Tab to the arrow, then
 * the arrow keys nudge it, Home/End jump, Enter submits the position.
 */
export default function BotCheckSlider({ position, onChange, onCommit, disabled, verified }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const frame = useRef(0);
  const pendingX = useRef(null);
  const locked = disabled || verified;
  /** The hint only stays while nobody has touched the track yet. */
  const [touched, setTouched] = useState(false);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const slotFrom = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return position;
    const span = rect.width - EDGE * 2;
    if (span <= 0) return position;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left - EDGE) / span));
    return Math.round(ratio * (SLOTS - 1));
  };

  /** One paint-aligned update per frame keeps the handle and ring gliding. */
  const schedule = (clientX) => {
    pendingX.current = clientX;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (pendingX.current === null) return;
      onChange(slotFrom(pendingX.current));
    });
  };

  const start = (event) => {
    if (locked) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragging.current = true;
    setTouched(true);
    schedule(event.clientX);
  };

  const move = (event) => {
    if (locked || !dragging.current) return;
    schedule(event.clientX);
  };

  const finish = (event) => {
    if (locked || !dragging.current) return;
    dragging.current = false;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    pendingX.current = null;
    const slot = slotFrom(event.clientX);
    onChange(slot);
    onCommit(slot);
  };

  const onKeyDown = (event) => {
    if (locked) return;
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
    if (step) {
      event.preventDefault();
      setTouched(true);
      onChange(Math.min(SLOTS - 1, Math.max(0, position + step)));
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setTouched(true);
      onChange(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setTouched(true);
      onChange(SLOTS - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCommit(position);
    }
  };

  const ratio = position / (SLOTS - 1);

  return (
    <div
      ref={trackRef}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      className={`relative h-12 touch-none select-none overflow-hidden rounded-full border bg-secondary/70 ${
        verified ? 'border-status-available/50' : 'border-border/70'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-foreground/10"
        // Reach past the handle's own edge so a full drag ends flush with the track.
        style={{ width: `calc(${EDGE + HANDLE / 2}px + (100% - ${EDGE * 2}px) * ${ratio})` }}
      />
      {!verified && (
        <span
          aria-hidden={touched}
          className={`pointer-events-none absolute inset-0 flex items-center justify-center px-14 text-center text-[11px] font-medium tracking-wide text-muted-foreground transition-opacity duration-300 ${
            touched ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Drag the slider
        </span>
      )}
      <button
        type="button"
        role="slider"
        aria-label="Arrow position on the bot check slider"
        aria-valuemin={0}
        aria-valuemax={SLOTS - 1}
        aria-valuenow={position}
        aria-valuetext={`Position ${position} of ${SLOTS - 1}`}
        aria-disabled={locked}
        onKeyDown={onKeyDown}
        style={{ left: `calc(${EDGE}px + (100% - ${EDGE * 2}px) * ${ratio})`, cursor: locked ? 'default' : 'grab' }}
        className={`absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
          verified ? 'bg-status-available text-ink' : 'bg-foreground text-ink hover:bg-foreground/90'
        }`}
      >
        {verified ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}