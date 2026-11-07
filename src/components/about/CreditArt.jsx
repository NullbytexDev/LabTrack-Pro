import React, { useId } from 'react';

/**
 * Workstation illustration: monitor, keyboard and a wireless mouse drawn in the
 * same stroke language as the rest of the scene. The mouse stands on its own to
 * the right of the keyboard instead of hanging off it.
 */
export default function CreditArt() {
  const id = useId();
  return (
    <svg viewBox="0 0 240 160" className="block aspect-[3/2] w-full text-primary" role="img" aria-label="Complete computer workstation with monitor, keyboard and wireless mouse">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="hsl(var(--brand-teal))" /><stop offset="0.55" stopColor="hsl(var(--brand-mint))" /><stop offset="1" stopColor="hsl(var(--brand-gold))" /></linearGradient></defs>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="48" cy="69" r="26" opacity="0.55" /><circle cx="48" cy="69" r="16" opacity="0.4" />
        <path d="M74 69h14M48 95v25h42" strokeDasharray="4 5" />
        <rect x="88" y="27" width="114" height="76" rx="8" />
        <path d="M88 88h114M135 103v17m20-17v17m-32 0h44" />
        <path d="m112 49-8 8 8 8m29-16 8 8-8 8m-19 4 9-24" />
        <path d="M100 129h88l9 15H92l8-15Z" />
        <path d="M106 136h74" opacity="0.45" />
        <path d="M111 133.5v-1m10 1v-1m10 1v-1m10 1v-1m10 1v-1m10 1v-1" opacity="0.6" />
      </g>

      {/* Wireless mouse: centred on its own footprint, well clear of the keyboard. */}
      <g>
        <ellipse cx="215" cy="153" rx="13" ry="1.8" fill="currentColor" opacity="0.18" />
        <g fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="204" y="131" width="22" height="21" rx="10.5" />
          <path d="M215 131v8" opacity="0.55" />
        </g>
        <rect x="212.5" y="133.5" width="5" height="6" rx="2.5" fill="hsl(var(--brand-gold))" opacity="0.85" />
      </g>

      <path d="M18 152h207" opacity="0.3" stroke={`url(#${id})`} strokeWidth="1.5" />
      <circle cx="145" cy="95" r="2" fill="currentColor" />
      <circle cx="48" cy="69" r="4" fill="hsl(var(--brand-teal))" />
    </svg>
  );
}