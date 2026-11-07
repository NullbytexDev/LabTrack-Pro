import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AvatarArt, { avatarOptions } from '@/components/auth/AvatarArt';
import { Check } from 'lucide-react';

export default function AvatarPicker({ role, value, onChange, compact = false }) {
  const options = avatarOptions(role);
  const reduce = useReducedMotion();

  return (
    <fieldset>
      <legend className="text-sm font-medium">Choose your profile picture</legend>
      <p className="mt-1 text-xs text-muted-foreground">
        Twelve original illustrations for your role. The one you pick appears wherever you are shown in LabTrack Pro.
      </p>
      <div className={`mt-3 grid grid-cols-4 gap-2 ${compact ? '' : 'sm:grid-cols-6'}`}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
              aria-label={`Illustration ${option.index}`}
              className={`glow-hover relative flex flex-col items-center rounded-2xl border p-1.5 focus-visible:outline-none ${
                selected ? 'border-primary/70 bg-primary/[0.08]' : 'border-border/70 bg-card/60 hover:border-primary/30'
              }`}
            >
              <motion.span
                animate={reduce ? undefined : { y: selected ? -3 : 0, scale: selected ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className={`overflow-hidden rounded-full ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                <AvatarArt role={role} id={option.id} className="h-11 w-11 sm:h-12 sm:w-12" />
              </motion.span>
              {selected && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}