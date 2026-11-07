import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Gentle entrance that automatically becomes instant for reduced-motion users. */
export default function Reveal({ children, delay = 0, y = 14, className = '', as = 'div' }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}