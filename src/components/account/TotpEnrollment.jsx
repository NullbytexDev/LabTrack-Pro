import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';

/** Groups a Base32 secret into readable blocks for manual entry. */
const groupSecret = (secret) => String(secret || '').replace(/(.{4})/g, '$1 ').trim();

/** Shows the enrolment QR code, the setup key and the first-code confirmation. */
export default function TotpEnrollment({ setup, code, onCodeChange, onVerify, onCancel, busy, error }) {
  const ready = code.length === 6;
  return (
    <div className="space-y-4">
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="mx-auto w-fit rounded-xl border border-border bg-white p-3">
          <img src={setup.qr_code_uri} alt="QR code for the authenticator app" width={180} height={180} className="h-[180px] w-[180px]" />
        </div>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Scan this code with your authenticator app.
          </p>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Setup key</p>
            <code className="mono-id block rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-center text-sm tracking-[0.18em] text-foreground">
              {groupSecret(setup.secret)}
            </code>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Type this key into your app if the camera cannot scan the code.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onVerify();
        }}
        className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4"
      >
        <div>
          <label htmlFor="totp-setup-code" className="text-xs font-semibold">Enter the six-digit code shown in the app</label>
          <input
            id="totp-setup-code"
            value={code}
            onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            className="mono-id mt-2 h-11 w-full rounded-lg border border-input bg-background text-center text-lg tracking-[0.4em] outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy || !ready}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />}
            {busy ? 'Verifying…' : 'Verify & Activate'}
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}