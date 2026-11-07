import React from 'react';

/** Original LabTrack Pro mark: two connected lab computers inside a rounded tile. */
export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="LabTrack Pro">
      <defs>
        <linearGradient id="ltpMarkStroke" x1="4" y1="6" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#35D3C5" />
          <stop offset="0.55" stopColor="#A7D5A6" />
          <stop offset="1" stopColor="#EBC15F" />
        </linearGradient>
        <linearGradient id="ltpMarkFill" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0B1B2A" />
          <stop offset="1" stopColor="#050F1A" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#ltpMarkFill)" />
      <rect x="8.5" y="12.5" width="15" height="11.5" rx="3" fill="none" stroke="url(#ltpMarkStroke)" strokeWidth="2.4" />
      <rect x="24.5" y="22.5" width="15" height="11.5" rx="3" fill="none" stroke="url(#ltpMarkStroke)" strokeWidth="2.4" />
      <path d="M23.5 18.2 L24.5 22.6" stroke="#35D3C5" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 35.5 h5.5 M29 38 h5.5" stroke="#A7D5A6" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="32" cy="28.2" r="2.1" fill="#EBC15F" />
      <circle cx="16" cy="18.2" r="1.7" fill="#35D3C5" />
    </svg>
  );
}

export function Logo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={compact ? 'h-8 w-8' : 'h-10 w-10'} />
      <span className="leading-none">
        <span className={`block font-heading font-semibold tracking-tight ${compact ? 'text-base' : 'text-lg'}`}>
          LabTrack<span className="bg-gradient-to-r from-brand-teal to-brand-mint bg-clip-text text-transparent"> Pro</span>
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          FCI · Computer Labs
        </span>
      </span>
    </span>
  );
}

export default Logo;