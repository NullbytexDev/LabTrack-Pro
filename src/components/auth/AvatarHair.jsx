import React from 'react';

// Original portrait silhouettes, recovered from the first 24-illustration set.
const HAIR = {
  bob: <path d="M30 44c-9 0-15-6-15-14 0-9 7-14 15-14s15 5 15 14c0 8-6 14-15 14Z" />,
  short: <path d="M31 31c-7 0-11-4-11-10 0-5 5-8 11-8s11 4 11 9-4 9-11 9Z" />,
  curly: <><circle cx="22" cy="20" r="6" /><circle cx="31" cy="15" r="6.5" /><circle cx="40" cy="20" r="6" /><circle cx="31" cy="21" r="6" /></>,
  bun: <><circle cx="31" cy="12" r="5" /><path d="M31 32c-8 0-13-4-13-10s5-9 13-9 13 4 13 9-5 10-13 10Z" /></>,
  long: <><path d="M31 19c-8 0-13 5-13 12v14c2-6 4-9 5-15 1 4 4 6 8 6s7-2 8-6c1 6 3 9 5 15V31c0-7-5-12-13-12Z" /><path d="M18 31c0-9 6-14 13-14s13 5 13 14c0 4-2 7-3 9 0-8-4-12-10-12s-10 4-10 12c-1-2-3-5-3-9Z" /></>,
  fade: <><path d="M20 27c0-8 5-13 11-13s11 5 11 13c-2-3-6-5-11-5s-9 2-11 5Z" /><path d="M20 27h22v3H20Z" opacity="0.75" /></>,
  ponytail: <><path d="M31 32c-8 0-13-5-13-12s5-11 13-11 13 4 13 11c0 2-1 4-2 5-1-6-5-9-11-9s-10 3-11 9c-1-1-2-3-2-5Z" /><path d="M43 20c5 2 7 8 6 15-1 5-3 8-5 8-2 0-2-2-1-6 1-6 0-10-3-13Z" /></>,
  wavy: <><path d="M18 32c-1-10 5-16 13-16s14 6 13 16c-2 0-3-1-4-3-2 2-4 2-6 1-2 2-4 2-6 0-2 2-4 2-6-1-1 2-2 3-4 3Z" /><path d="M19 30c-2 6-1 12 2 18 1-6 0-9-1-13Z" /><path d="M43 30c2 6 1 12-2 18-1-6 0-9 1-13Z" /></>,
  buzz: <path d="M21 26c0-7 5-11 10-11s10 4 10 11c-2-2-6-3-10-3s-8 1-10 3Z" opacity="0.92" />,
  braids: <><path d="M31 32c-8 0-13-5-13-12s5-11 13-11 13 4 13 11-5 12-13 12Z" /><circle cx="18" cy="28" r="3" /><circle cx="18" cy="34" r="2.6" /><circle cx="18" cy="40" r="2.2" /><circle cx="44" cy="28" r="3" /><circle cx="44" cy="34" r="2.6" /><circle cx="44" cy="40" r="2.2" /></>,
  quiff: <path d="M20 26c0-6 4-11 9-12-1 4 1 6 4 6 4 0 8 2 9 6-4-2-9-2-13-1s-7 1-9 1Z" />,
  sidepart: <><path d="M20 27c0-8 5-13 11-13 7 0 11 5 11 13-3-4-8-6-13-6-3 0-6 2-9 6Z" /><path d="M20 27c3-1 6-3 8-6" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" fill="none" /></>,
  updo: <><ellipse cx="31" cy="12" rx="8" ry="6" /><path d="M31 32c-8 0-13-5-13-12s5-11 13-11 13 4 13 11-5 12-13 12Z" /></>,
  twists: <><path d="M31 32c-8 0-13-4-13-11s5-12 13-12 13 5 13 12-5 11-13 11Z" /><g stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.1" strokeLinecap="round"><path d="M22 20l6 5" /><path d="M32 15l4 7" /><path d="M41 20l-6 5" /></g></>,
  curls: <><circle cx="20" cy="24" r="5" /><circle cx="24" cy="17" r="5.4" /><circle cx="31" cy="14" r="5.6" /><circle cx="38" cy="17" r="5.4" /><circle cx="42" cy="24" r="5" /><circle cx="19" cy="32" r="4.2" /><circle cx="43" cy="32" r="4.2" /></>,
  afro: <><ellipse cx="31" cy="22" rx="15" ry="12" /><ellipse cx="20" cy="27" rx="5" ry="6" /><ellipse cx="42" cy="27" rx="5" ry="6" /></>,
};

export default function AvatarHair({ look, color, opacity = 1 }) {
  return <g fill={color} opacity={opacity} aria-hidden="true">{HAIR[look] || HAIR.short}</g>;
}