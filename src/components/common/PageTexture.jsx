import React from 'react';

const VARIANT_CLASS = {
  mesh: 'tex-mesh',
  dots: 'tex-dots',
  blueprint: 'tex-blueprint',
  scan: 'tex-scan',
  rings: 'tex-rings',
  stripes: 'tex-stripes',
  blobs: 'tex-blobs',
  grid: 'tex-grid',
  aurora: 'tex-aurora',
};

/**
 * Decorative, non-interactive page texture.
 * The layer drifts very slowly so pages feel alive without competing with content.
 */
export default function PageTexture({ variant = 'mesh' }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden">
      <div
        className={`page-texture-anim absolute -inset-[6%] opacity-90 ${VARIANT_CLASS[variant] || VARIANT_CLASS.mesh}`}
      />
    </div>
  );
}