import React from 'react';
import { Image } from '@/components/ui/image';

// Polished lab artwork used by every lab empty state.
const LAB_EMPTY_ART = '/lab-illustration.png';

export default function LabIllustration({ className = 'w-full' }) {
  return (
    <Image
      src={LAB_EMPTY_ART}
      alt="Three lab computers on a bench, drawn as a blueprint"
      fittingType="fit"
      className={`${className} rounded-2xl border border-border/60`}
    />
  );
}