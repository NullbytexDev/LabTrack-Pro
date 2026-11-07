import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const PAGE_VARIANTS = {
  hidden: { opacity: 0, y: 18, scale: 0.988, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.62,
      ease: EASE,
      opacity: { duration: 0.4, ease: 'easeOut' },
      filter: { duration: 0.46, ease: 'easeOut' },
    },
  },
};

/**
 * Fades, lifts and soft-focuses the page whenever the route changes,
 * and sweeps a thin light line across the top of the content.
 */
export default function PageTransition({ pageKey, children }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div key={pageKey}>{children}</div>;
  }

  return (
    <div className="relative">
      <motion.span
        key={`${pageKey}-sweep`}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-3 z-10 h-px origin-left bg-gradient-to-r from-transparent via-primary/80 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.1, ease: 'easeInOut', times: [0, 0.4, 1] }}
      />
      <motion.div key={pageKey} variants={PAGE_VARIANTS} initial="hidden" animate="visible">
        {children}
      </motion.div>
    </div>
  );
}