import React from 'react';
import { Image } from '@/components/ui/image';
import { MEDIA_ORIGIN } from '@/components/ui/image-helpers';

// Polished lab artwork used by every lab empty state.
const LAB_EMPTY_ART = `${MEDIA_ORIGIN}/images/public/87965c868_generated_image.png`;

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