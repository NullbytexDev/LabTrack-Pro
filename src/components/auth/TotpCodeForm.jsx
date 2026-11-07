import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound } from 'lucide-react';

/**
 * Six-digit authenticator entry, shared by sign-in and the security settings page.
 * One of the member's backup codes works in the same field.
 */
export default function TotpCodeForm({ title, description, value, onChange, onSubmit, onCancel, submitLabel = 'Verify code', busy, error, cancelLabel = 'Cancel', onSwitch, switchLabel, allowBackupCode = true }) {
  const cleaned = String(value || '').replace(/[^A-Za-z0-9]/g, '');
  const ready = cleaned.length === 6 || (allowBackupCode && cleaned.length === 8);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit();
      }}
      className="surface mx-auto w-full max-w-md p-6"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <KeyRound className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="totp-code">{allowBackupCode ? 'Six-digit code or backup code' : 'Six-digit code'}</Label>
        <Input
          id="totp-code"
          value={value}
          onChange={(event) => onChange(
            allowBackupCode
              ? event.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 9)
              : event.target.value.replace(/\D/g, '').slice(0, 6),
          )}
          inputMode={allowBackupCode ? 'text' : 'numeric'}
          autoComplete="one-time-code"
          autoFocus
          placeholder="000000"
          maxLength={allowBackupCode ? 9 : 6}
          className="mono-id text-center text-lg tracking-[0.4em]"
        />
        {allowBackupCode && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Lost access to your authenticator app? Enter one of your backup codes instead.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !ready} className="flex-1">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? 'Checking…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
        )}
      </div>

      {onSwitch && (
        <button
          type="button"
          onClick={onSwitch}
          disabled={busy}
          className="mt-3 text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          {switchLabel}
        </button>
      )}
    </form>
  );
}