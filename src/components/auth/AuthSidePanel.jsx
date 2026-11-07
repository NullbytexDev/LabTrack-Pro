import React from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/brand/Logo';
import { ROLE_META } from '@/lib/constants';
import { CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

function LabIllustration() {
  return (
    <svg viewBox="0 0 320 140" className="w-full max-w-sm" role="img" aria-label="Illustration of connected lab computers">
      <defs>
        <linearGradient id="authScreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35D3C5" />
          <stop offset="1" stopColor="#EBC15F" />
        </linearGradient>
      </defs>
      {[20, 130, 240].map((x, index) => (
        <g key={x} opacity={0.95 - index * 0.1}>
          <rect x={x} y="26" width="58" height="38" rx="6" fill="none" stroke="url(#authScreen)" strokeWidth="2" />
          <rect x={x + 10} y="36" width="30" height="3" rx="1.5" fill="url(#authScreen)" opacity="0.7" />
          <rect x={x + 10} y="44" width="20" height="3" rx="1.5" fill="url(#authScreen)" opacity="0.45" />
          <path d={`M${x + 22} 64 v10 h14 v-10`} fill="none" stroke="url(#authScreen)" strokeWidth="2" strokeLinejoin="round" />
          <rect x={x + 8} y="74" width="42" height="4" rx="2" fill="url(#authScreen)" opacity="0.5" />
        </g>
      ))}
      <path d="M78 45 H130 M188 45 H240" stroke="#35D3C5" strokeWidth="1.6" strokeDasharray="4 5" opacity="0.7" />
      <circle cx="104" cy="45" r="3" fill="#35D3C5" />
      <circle cx="214" cy="45" r="3" fill="#35D3C5" />
      <path d="M20 106 H300" stroke="url(#authScreen)" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

export default function AuthSidePanel({ role }) {
  const meta = ROLE_META[role];

  return (
    <aside className="ink-panel relative overflow-hidden px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <div aria-hidden="true" className="tex-rings pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-3 text-white">
          <LogoMark className="h-10 w-10" />
          <span>
            <span className="block font-heading text-lg font-semibold leading-none">LabTrack Pro</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-white/55">FCI · Computer Labs</span>
          </span>
        </Link>

        <h1 className="mt-10 max-w-sm text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Every lab computer, <span className="bg-gradient-to-r from-brand-teal via-brand-mint to-brand-gold bg-clip-text text-transparent">accounted for.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          Sign in with the role that matches your work. Each role gets its own permissions — checked on the server, not
          just hidden in the interface.
        </p>

        <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Selected role</p>
          <p className="mt-1 font-heading text-base font-semibold text-white">{meta.label}</p>
          <p className="mt-1 text-sm text-white/70">{meta.blurb}</p>
        </div>

        <ul className="mt-8 space-y-3 text-sm text-white/75">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" aria-hidden="true" />
            Live status for every PC in every lab
          </li>
          <li className="flex items-start gap-2.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" aria-hidden="true" />
            A six-digit email code verifies every new account
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" aria-hidden="true" />
            Reports go straight to the instructor on duty
          </li>
        </ul>

        <div className="mt-10 opacity-90">
          <LabIllustration />
        </div>
      </div>
    </aside>
  );
}