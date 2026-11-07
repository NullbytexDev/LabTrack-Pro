import React from 'react';

/** Decorative hero artwork: a lab bench of monitors with live status nodes. */
export default function LabSnapshotArt() {
  return (
    <svg viewBox="0 0 420 300" className="h-full w-full" role="img" aria-label="Illustration of monitored lab computers">
      <defs>
        <linearGradient id="snapStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35D3C5" />
          <stop offset="1" stopColor="#EBC15F" />
        </linearGradient>
        <linearGradient id="snapPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1D2D" />
          <stop offset="1" stopColor="#071321" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="408" height="284" rx="24" fill="url(#snapPanel)" opacity="0.96" />
      <rect x="6" y="8" width="408" height="284" rx="24" fill="none" stroke="#23384A" strokeWidth="1" />

      {[
        { x: 40, y: 56, dot: '#A7D5A6', label: 'Available' },
        { x: 160, y: 56, dot: '#EBC15F', label: 'Minor' },
        { x: 280, y: 56, dot: '#E88484', label: 'Repair' },
      ].map((screen) => (
        <g key={screen.x}>
          <rect x={screen.x} y={screen.y} width="96" height="62" rx="8" fill="#081522" stroke="url(#snapStroke)" strokeWidth="1.6" opacity="0.9" />
          <rect x={screen.x + 14} y={screen.y + 16} width="44" height="4" rx="2" fill="#3E5566" />
          <rect x={screen.x + 14} y={screen.y + 27} width="30" height="4" rx="2" fill="#2A3F4F" />
          <circle cx={screen.x + 76} cy={screen.y + 18} r="4" fill={screen.dot} />
          <path d={`M${screen.x + 40} ${screen.y + 62} v10 h16 v-10`} fill="none" stroke="#2E4657" strokeWidth="2" />
          <rect x={screen.x + 22} y={screen.y + 72} width="52" height="4" rx="2" fill="#1B3040" />
          <text x={screen.x + 48} y={screen.y + 96} textAnchor="middle" fontSize="9" fill="#AAB6C4" fontFamily="Sora, sans-serif">
            {screen.label}
          </text>
        </g>
      ))}

      <path d="M40 176 H380" stroke="#22384B" strokeWidth="1" />
      <rect x="40" y="196" width="340" height="10" rx="5" fill="#0F2233" />
      <rect x="40" y="196" width="214" height="10" rx="5" fill="url(#snapStroke)" opacity="0.85" />
      <text x="40" y="226" fontSize="9" fill="#AAB6C4" fontFamily="Plus Jakarta Sans, sans-serif">
        READY TO USE
      </text>
      <text x="380" y="226" fontSize="9" fill="#AAB6C4" textAnchor="end" fontFamily="Plus Jakarta Sans, sans-serif">
        NEEDS ATTENTION
      </text>

      <g>
        <circle cx="60" cy="258" r="5" fill="#A7D5A6" />
        <circle cx="86" cy="258" r="5" fill="#A7D5A6" />
        <circle cx="112" cy="258" r="5" fill="#EBC15F" />
        <circle cx="138" cy="258" r="5" fill="#35D3C5" />
        <circle cx="164" cy="258" r="5" fill="#E88484" />
        <circle cx="190" cy="258" r="5" fill="#8E9BE0" />
        <circle cx="216" cy="258" r="5" fill="#A7D5A6" />
      </g>
      <text x="240" y="262" fontSize="9" fill="#AAB6C4" fontFamily="Plus Jakarta Sans, sans-serif">
        live status per computer
      </text>
    </svg>
  );
}