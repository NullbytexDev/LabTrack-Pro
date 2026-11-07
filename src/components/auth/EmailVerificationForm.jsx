import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailCheck, Loader2 } from 'lucide-react';

export default function EmailVerificationForm({ email, busy, error, cooldown, onVerify, onResend, onSwitch, switchLabel, onUseRecovery }) {
  const [code, setCode] = useState('');
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="surface w-full p-6">
        <MailCheck className="mb-4 h-7 w-7 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-semibold">Email verification</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">Enter the six-digit code sent to {email}. Codes expire after 10 minutes.</p>
        <form className="mt-5 space-y-3" onSubmit={(event) => { event.preventDefault(); onVerify(code); }}>
          <Label htmlFor="email-2fa-code">Six-digit code</Label>
          <Input id="email-2fa-code" value={code} inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" disabled={busy || code.length !== 6}>{busy && <Loader2 className="animate-spin" />}Confirm and continue</Button>
        </form>
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
        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <button disabled={busy || cooldown > 0} onClick={onResend} className="text-primary disabled:opacity-50">{cooldown ? `Resend in ${cooldown}s` : 'Send a new code'}</button>
          <button className="text-muted-foreground" onClick={() => api.auth.logout('/signin')}>Sign out</button>
        </div>
        {onUseRecovery && (
          <button
            type="button"
            onClick={onUseRecovery}
            disabled={busy}
            className="mt-3 text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            Can&apos;t open this mailbox? Send the code to my recovery email
          </button>
        )}
      </section>
    </div>
  );
}