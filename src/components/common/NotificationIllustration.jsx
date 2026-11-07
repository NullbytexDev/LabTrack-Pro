import React from 'react';

/** Empty-state illustration for the notifications page: a bell with no messages. */
export default function NotificationIllustration({ className = 'w-full' }) {
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label="An empty notification inbox">
      <defs>
        <linearGradient id="bellEmptyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35D3C5" />
          <stop offset="1" stopColor="#EBC15F" />
        </linearGradient>
      </defs>

      {/* dotted frame */}
      <rect x="26" y="22" width="268" height="118" rx="18" fill="none" stroke="#AAB6C4" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="6 7" />

      {/* faint grid inside the frame */}
      <g stroke="#AAB6C4" strokeOpacity="0.12" strokeWidth="1">
        <path d="M26 60h268M26 100h268M96 22v118M160 22v118M224 22v118" />
      </g>

      {/* bell */}
      <g fill="none" stroke="url(#bellEmptyGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M160 48c-15 0-25 11-25 26v14l-8 11h66l-8-11V74c0-15-10-26-25-26Z" />
        <path d="M150 99a10 10 0 0 0 20 0" />
        <path d="M160 41v7" />
      </g>

      {/* muted "no new alerts" mark */}
      <g fill="none" stroke="#AAB6C4" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round">
        <circle cx="160" cy="74" r="34" strokeOpacity="0.18" />
        <path d="M137 51 183 97" strokeOpacity="0.5" />
      </g>

      {/* caption */}
      <rect x="112" y="150" width="96" height="18" rx="9" fill="#0C1E2E" stroke="#AAB6C4" strokeOpacity="0.25" strokeWidth="1" />
      <text x="160" y="163" textAnchor="middle" fontSize="9" fill="#AAB6C4" fontFamily="Sora, sans-serif">
        ALL CLEAR
      </text>
    </svg>
  );
}