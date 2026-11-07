import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] focus-visible:ring-primary/60',
  positive: 'text-muted-foreground hover:text-primary hover:bg-primary/10 focus-visible:ring-primary/60',
  negative: 'text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/60',
};

const PRESSED = {
  positive: 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/30',
  negative: 'bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30',
};

/**
 * Round icon action with Material Design behaviour: an ink ripple from the touch
 * point, a state layer on hover, a pressed-scale, and a filled look once toggled on.
 * The visual response is instant — nothing waits on the network.
 */
export default function MaterialIconButton({
  tone = 'neutral',
  pressed = false,
  label,
  title,
  children,
  className,
  ...rest
}) {
  const [ripples, setRipples] = useState([]);
  const seq = useRef(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const spawn = useCallback((x, y, size) => {
    const id = ++seq.current;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    timers.current.push(
      window.setTimeout(() => setRipples((prev) => prev.filter((ripple) => ripple.id !== id)), 460),
    );
  }, []);

  const handlePointerDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    spawn(event.clientX - rect.left - size / 2, event.clientY - rect.top - size / 2, size);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = rect.width * 2.2;
    spawn(rect.width / 2 - size / 2, rect.height / 2 - size / 2, size);
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      aria-label={label}
      title={title || label}
      className={cn(
        'relative isolate inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full',
        'transition-[background-color,color,box-shadow,transform] duration-150 ease-out',
        'active:scale-[0.88] focus-visible:outline-none focus-visible:ring-2',
        TONES[tone],
        pressed && PRESSED[tone === 'negative' ? 'negative' : 'positive'],
        className,
      )}
      {...rest}
    >
      <span className="relative z-10 flex items-center justify-center">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="md-ripple pointer-events-none absolute rounded-full bg-current"
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
    </button>
  );
}