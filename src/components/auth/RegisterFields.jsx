import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarPicker from '@/components/auth/AvatarPicker';
import UsageChoice from '@/components/auth/UsageChoice';
import PasswordInput from '@/components/account/PasswordInput';
import { ROLE_META } from '@/lib/constants';
import { Mail, Lock, User, Hash, KeyRound } from 'lucide-react';

export const REF_FIELD = { student: 'roll_number', lab_assistant: 'assistant_id', instructor: 'instructor_id' };

function Field({ id, label, hint, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        )}
        {children}
      </div>
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function RegisterFields({ role, form, onChange, disabled }) {
  const meta = ROLE_META[role];
  const refKey = REF_FIELD[role];
  const set = (key) => (event) => onChange(key, event.target.value);

  return (
    <div className="space-y-4">
      <Field id="full_name" label="Full name" icon={User}>
        <Input id="full_name" autoComplete="name" className="pl-10" value={form.full_name} onChange={set('full_name')} disabled={disabled} required />
      </Field>

      <Field id="email" label="Email" icon={Mail}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="pl-10"
          placeholder="you@fci.edu"
          value={form.email}
          onChange={set('email')}
          disabled={disabled}
          required
        />
      </Field>

      <Field id={refKey} label={meta.referenceLabel} icon={Hash} hint="Used on reports so instructors know who logged the issue.">
        <Input id={refKey} className="pl-10" value={form[refKey]} onChange={set(refKey)} disabled={disabled} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="password" label="Password" icon={Lock} hint="At least 12 characters, including a number and a symbol.">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className="pl-10"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            disabled={disabled}
            required
          />
        </Field>
        <Field id="confirm" label="Confirm password" icon={Lock}>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            className="pl-10"
            placeholder="••••••••"
            value={form.confirm}
            onChange={set('confirm')}
            disabled={disabled}
            required
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-brand-gold/35 bg-brand-gold/[0.08] p-4">
        <Field
          id="access_code"
          label={`${meta.label} access key`}
          icon={KeyRound}
          hint="Checked on the server against the institute secret. Incorrect keys are rate limited."
        >
          <PasswordInput
            id="access_code"
            autoComplete="off"
            className="pl-10"
            placeholder={`${meta.label} access key`}
            value={form.access_code}
            onChange={set('access_code')}
            disabled={disabled}
            required
          />
        </Field>
      </div>

      <AvatarPicker role={role} value={form.avatar_id} onChange={(id) => onChange('avatar_id', id)} />

      <UsageChoice
        checked={form.usage_stats !== false}
        onChange={(next) => onChange('usage_stats', next)}
        disabled={disabled}
      />
    </div>
  );
}