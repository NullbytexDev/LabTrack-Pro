import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Animated readiness gauge: gold-to-teal arc with the fleet percentage at its centre. */
export default function ReadinessRing({ value = 0, ready = 0, total = 0, size = 196 }) {
  const reduce = useReducedMotion();
  const stroke = 11;
  const radius = (size - stroke) / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        aria-hidden="true"
        className={`absolute inset-4 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.22),transparent_70%)] ${reduce ? '' : 'animate-glow-pulse'}`}
      />
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${value}% of computers ready`}>
        <defs>
          <linearGradient id="pulseRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(var(--brand-teal))" />
            <stop offset="0.55" stopColor="hsl(var(--brand-mint))" />
            <stop offset="1" stopColor="hsl(var(--brand-gold))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          opacity="0.7"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#pulseRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading text-4xl font-semibold tabular-nums">{value}%</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">ready</span>
        <span className="mt-1.5 text-xs text-muted-foreground tabular-nums">
          {ready} of {total}
        </span>
      </div>
    </div>
  );
}