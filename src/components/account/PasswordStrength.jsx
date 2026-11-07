import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPassword } from '@/lib/passwordPolicy';

const LABELS = [
  { label: 'Weak', className: 'text-status-repair', bar: 'bg-status-repair' },
  { label: 'Weak', className: 'text-status-repair', bar: 'bg-status-repair' },
  { label: 'Medium', className: 'text-status-minor', bar: 'bg-status-minor' },
  { label: 'Medium', className: 'text-status-minor', bar: 'bg-status-minor' },
  { label: 'Strong', className: 'text-status-available', bar: 'bg-status-available' },
];

export function passwordStrengthLabel(value) {
  const { rules, ok } = checkPassword(value);
  const passed = rules.filter((rule) => rule.ok).length;
  return LABELS[ok ? 4 : passed] || LABELS[0];
}

export default function PasswordStrength({ value, showLabel = true }) {
  const { rules, ok } = checkPassword(value);
  const passed = rules.filter((rule) => rule.ok).length;
  const meta = passwordStrengthLabel(value);
  const width = `${Math.round((passed / rules.length) * 100)}%`;

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite">
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className={meta.className}>Strength: {meta.label}</span>
          {!ok && <span className="text-destructive">Password is weak</span>}
        </div>
      )}
      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div className={`h-full rounded-full transition-all duration-300 ${meta.bar}`} style={{ width }} />
      </div>
      <ul className="grid gap-1 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={`flex items-center gap-1.5 text-[11px] ${rule.ok ? 'text-status-available' : 'text-muted-foreground'}`}
          >
            {rule.ok ? <Check className="h-3 w-3 shrink-0" aria-hidden="true" /> : <X className="h-3 w-3 shrink-0" aria-hidden="true" />}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}