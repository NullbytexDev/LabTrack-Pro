import React from 'react';

const PALETTES = [
  { bg: '#EDEBFF', skin: '#F1C7A3', hair: '#241E33', top: '#5B4BF6', trim: '#12B5A5' },
  { bg: '#E3F7F3', skin: '#C98A5E', hair: '#171326', top: '#0F9E90', trim: '#5B4BF6' },
  { bg: '#FDF0DC', skin: '#F5D3B0', hair: '#5A3A22', top: '#E0982F', trim: '#2C2550' },
  { bg: '#FDE9EE', skin: '#8E5B3C', hair: '#140F1F', top: '#C8476B', trim: '#F2C14E' },
  { bg: '#E8EEFB', skin: '#EFC4A1', hair: '#3B2A4D', top: '#2F4B93', trim: '#12B5A5' },
  { bg: '#F1ECFB', skin: '#D79C74', hair: '#20182D', top: '#7C4DD6', trim: '#F2A93B' },
  { bg: '#EAF6E4', skin: '#A9714B', hair: '#1A1424', top: '#2F7D5B', trim: '#F2C14E' },
  { bg: '#FBEEE4', skin: '#F7D9BC', hair: '#6B4227', top: '#B8562F', trim: '#2F4B93' },
  { bg: '#F3F0E6', skin: '#E8B98F', hair: '#2B2230', top: '#8A6A2F', trim: '#0F9E90' },
  { bg: '#E6F2F7', skin: '#B87A50', hair: '#101A2B', top: '#1F6F8B', trim: '#E0982F' },
  { bg: '#F7EAF4', skin: '#F0C6A8', hair: '#3A1F33', top: '#A03C7A', trim: '#12B5A5' },
  { bg: '#EFF1E9', skin: '#8A5A3B', hair: '#1C1A18', top: '#4B5B31', trim: '#C8476B' },
];

const HAIR = {
  bob: (c) => <path d="M30 44c-9 0-15-6-15-14 0-9 7-14 15-14s15 5 15 14c0 8-6 14-15 14Z" fill={c} />,
  short: (c) => <path d="M31 31c-7 0-11-4-11-10 0-5 5-8 11-8s11 4 11 9-4 9-11 9Z" fill={c} />,
  curly: (c) => (
    <g fill={c}>
      <circle cx="22" cy="20" r="6" />
      <circle cx="31" cy="15" r="6.5" />
      <circle cx="40" cy="20" r="6" />
      <circle cx="31" cy="21" r="6" />
    </g>
  ),
  bun: (c) => (
    <g fill={c}>
      <circle cx="31" cy="12" r="5" />
      <path d="M31 32c-8 0-13-4-13-10s5-9 13-9 13 4 13 9-5 10-13 10Z" />
    </g>
  ),
  long: (c) => (
    <g fill={c}>
      <path d="M31 19c-8 0-13 5-13 12v14c2-6 4-9 5-15 1 4 4 6 8 6s7-2 8-6c1 6 3 9 5 15V31c0-7-5-12-13-12Z" />
      <path d="M18 31c0-9 6-14 13-14s13 5 13 14c0 4-2 7-3 9 0-8-4-12-10-12s-10 4-10 12c-1-2-3-5-3-9Z" />
    </g>
  ),
  fade: (c) => (
    <g fill={c}>
      <path d="M20 27c0-8 5-13 11-13s11 5 11 13c-2-3-6-5-11-5s-9 2-11 5Z" />
      <path d="M20 27h22v3H20Z" opacity="0.75" />
    </g>
  ),
};

/**
 * Original vector illustrations used as role avatars.
 * Never emoji — each avatar is drawn from shapes so it stays crisp at any size.
 */
export default function AvatarArt({ role = 'student', id, className = 'h-16 w-16' }) {
  const index = Number(String(id || '').split('-').pop()) || 1;
  const safeIndex = Math.min(Math.max(index, 1), 12);
  const palette = PALETTES[((ROLE_OFFSET[role] || 0) + safeIndex - 1) % PALETTES.length] || PALETTES[0];
  const hairStyle = HAIR[HAIR_ORDER[(safeIndex - 1) % HAIR_ORDER.length]];

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`${role.replace('_', ' ')} illustration ${safeIndex}`}>
      <defs>
        <clipPath id={`avClip${role}${safeIndex}`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#avClip${role}${safeIndex})`}>
        <rect width="64" height="64" fill={palette.bg} />
        <circle cx="32" cy="70" r="26" fill={palette.top} />
        <path d="M18 70c1-12 6-19 14-19s13 7 14 19Z" fill={palette.top} />
        <path d="M26 52h12v6a6 6 0 0 1-12 0Z" fill={palette.skin} />
        <rect x="28" y="46" width="8" height="9" rx="4" fill={palette.skin} />
        <circle cx="32" cy="33" r="13" fill={palette.skin} />
        {hairStyle(palette.hair)}
        <circle cx="27" cy="34" r="1.6" fill="#1B1526" />
        <circle cx="37" cy="34" r="1.6" fill="#1B1526" />
        <path d="M28.5 40c2 1.6 5 1.6 7 0" stroke="#1B1526" strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {role === 'instructor' && (
          <g stroke={palette.trim} strokeWidth="1.7" fill="none">
            <circle cx="27" cy="34" r="4" />
            <circle cx="37" cy="34" r="4" />
            <path d="M31 34h2" />
          </g>
        )}
        {role === 'lab_assistant' && (
          <g>
            <path d="M19 30a13 13 0 0 1 26 0" stroke="#1B1526" strokeWidth="2.4" fill="none" />
            <rect x="15.5" y="28" width="6" height="9" rx="3" fill={palette.trim} />
            <rect x="42.5" y="28" width="6" height="9" rx="3" fill={palette.trim} />
          </g>
        )}
        {role === 'student' && (
          <path d="M23 52c3-3 5.5-4 9-4s6 1 9 4" stroke={palette.trim} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
}

const HAIR_ORDER = ['bob', 'short', 'curly', 'bun', 'long', 'fade', 'curly', 'long', 'bun', 'short', 'bob', 'fade'];
const ROLE_OFFSET = { student: 0, lab_assistant: 2, instructor: 4 };

const PREFIX = { student: 'st', lab_assistant: 'la', instructor: 'in' };

export const AVATAR_COUNT = 12;

export function avatarOptions(role) {
  return Array.from({ length: AVATAR_COUNT }, (_, i) => ({ id: `${PREFIX[role] || 'st'}-${i + 1}`, index: i + 1 }));
}