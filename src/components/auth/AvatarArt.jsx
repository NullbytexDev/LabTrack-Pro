import React, { useId } from 'react';
import AvatarHair from '@/components/auth/AvatarHair';

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
  { bg: '#EAF0FF', skin: '#6B4229', hair: '#0F0C16', top: '#3C5DBF', trim: '#F2C14E' },
  { bg: '#FFF1F1', skin: '#FAD9BE', hair: '#7A4B23', top: '#D06A4C', trim: '#2F4B93' },
  { bg: '#EFFAF7', skin: '#B06B3F', hair: '#1D1520', top: '#2C8E7E', trim: '#E0982F' },
  { bg: '#F6F1FF', skin: '#E3AE86', hair: '#2A1E3B', top: '#6A3FBF', trim: '#12B5A5' },
  { bg: '#FDF5E9', skin: '#9B6844', hair: '#16121C', top: '#B98A2E', trim: '#2F7D5B' },
  { bg: '#E9F4F1', skin: '#F2CBA6', hair: '#4A2C1E', top: '#1E6B62', trim: '#C8476B' },
  { bg: '#F3F0FB', skin: '#7E4E33', hair: '#120D1A', top: '#4F3A96', trim: '#F2A93B' },
  { bg: '#FBF3E4', skin: '#F6DCC0', hair: '#8C5B2F', top: '#A77A32', trim: '#1F6F8B' },
  { bg: '#EAF7EA', skin: '#C2814F', hair: '#1B1518', top: '#3A7A45', trim: '#F2C14E' },
  { bg: '#FCEFF6', skin: '#A86B45', hair: '#2E1B2C', top: '#B34C8B', trim: '#12B5A5' },
  { bg: '#EDF3FA', skin: '#EFC1A0', hair: '#232A38', top: '#33527E', trim: '#E0982F' },
  { bg: '#F8F1E6', skin: '#6E4630', hair: '#100C14', top: '#8A5F2A', trim: '#2F4B93' },
];

// The original silhouettes intentionally overlap the face with a translucent
// black layer. Keep that treatment shared by every role and every picker.

/**
 * Original vector illustrations used as role avatars.
 * Never emoji — each avatar is drawn from shapes so it stays crisp at any size.
 */
export default function AvatarArt({ role = 'student', id, className = 'h-16 w-16' }) {
  const index = Number(String(id || '').split('-').pop()) || 1;
  const safeIndex = Math.min(Math.max(index, 1), AVATAR_COUNT);
  const palette = PALETTES[((ROLE_OFFSET[role] || 0) + safeIndex - 1) % PALETTES.length] || PALETTES[0];
  const look = LOOKS[safeIndex - 1];
  const clipId = `avClip-${useId().replace(/:/g, '')}`;

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`${role.replace('_', ' ')} illustration ${safeIndex}`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="64" height="64" fill={palette.bg} />
        <circle cx="32" cy="70" r="26" fill={palette.top} />
        <path d="M18 70c1-12 6-19 14-19s13 7 14 19Z" fill={palette.top} />
        <path d="M26 52h12v6a6 6 0 0 1-12 0Z" fill={palette.skin} />
        <rect x="28" y="46" width="8" height="9" rx="4" fill={palette.skin} />

        <AvatarHair look={look.style} color={palette.hair} />
        <circle cx="32" cy="33" r="13" fill={palette.skin} />
        <AvatarHair look={look.style} color="#000000" opacity={0.22} />

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

// Twenty-four looks: exactly twelve female and twelve male, alternating so the
// grid never clusters either set. Index 1 is the original first illustration.
const ROLE_OFFSET = { student: 0, lab_assistant: 2, instructor: 4 };

const LOOKS = [
  { style: 'bob', gender: 'female' },
  { style: 'short', gender: 'male' },
  { style: 'long', gender: 'female' },
  { style: 'fade', gender: 'male' },
  { style: 'ponytail', gender: 'female' },
  { style: 'quiff', gender: 'male' },
  { style: 'bun', gender: 'female' },
  { style: 'buzz', gender: 'male' },
  { style: 'wavy', gender: 'female' },
  { style: 'sidepart', gender: 'male' },
  { style: 'braids', gender: 'female' },
  { style: 'twists', gender: 'male' },
  { style: 'updo', gender: 'female' },
  { style: 'afro', gender: 'male' },
  { style: 'curls', gender: 'female' },
  { style: 'curly', gender: 'male' },
  { style: 'bob', gender: 'female' },
  { style: 'short', gender: 'male' },
  { style: 'long', gender: 'female' },
  { style: 'quiff', gender: 'male' },
  { style: 'ponytail', gender: 'female' },
  { style: 'fade', gender: 'male' },
  { style: 'bun', gender: 'female' },
  { style: 'sidepart', gender: 'male' },
];

const PREFIX = { student: 'st', lab_assistant: 'la', instructor: 'in' };

export const AVATAR_COUNT = 24;

export function avatarOptions(role) {
  return Array.from({ length: AVATAR_COUNT }, (_, i) => ({ id: `${PREFIX[role] || 'st'}-${i + 1}`, index: i + 1 }));
}