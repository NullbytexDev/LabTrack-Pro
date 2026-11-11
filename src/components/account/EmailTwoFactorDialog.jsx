import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import IdentityCheckFields from '@/components/account/IdentityCheckFields';
import { grantPass } from '@/lib/twoFactorPass';
import { Loader2 } from 'lucide-react';

/** Confirms the account owner before email verification is switched on or off. */
export default function EmailTwoFactorDialog({ open, enabled, userId, onOpenChange, onSaved }) {
  const [identity, setIdentity] = useState({ password: '', code: '' });
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setIdentity({ password: '', code: '' });
    setCodeSent(false);
    setError('');
  }, [open]);

  const sendCode = async () => {
    setSending(true);
    setError('');
    try {
      await api.functions.invoke('accountSecurity', { action: 'sensitive_code' });
      setCodeSent(true);
      toast({ title: 'Code sent', description: 'Check your sign-in email for the six-digit code.' });
    } catch (err) {
      setError(err?.response?.data?.error || 'The code could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.functions.invoke('accountSecurity', {
        action: 'set_email_two_factor',
        enabled: !enabled,
        password: identity.password,
        code: identity.code,
      });
      toast({
        title: enabled ? 'Email verification off' : 'Email verification on',
        description: enabled
          ? 'Sign-in no longer asks for an emailed code.'
          : 'A six-digit code is now needed after your password.',
      });
      window.dispatchEvent(new Event('labtrack:profile-updated'));
      // The password (and code) just proved identity, so this session stays open.
      if (!enabled) grantPass(userId);
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'That setting could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{enabled ? 'Turn off email verification' : 'Turn on email verification'}</DialogTitle>
          <DialogDescription>Confirm your identity before this security setting changes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <IdentityCheckFields
            value={identity}
            onChange={setIdentity}
            twoFactor={enabled}
            onSendCode={sendCode}
            sendingCode={sending}
            codeSent={codeSent}
            disabled={busy}
            passwordId="email-2fa-password"
            codeId="email-2fa-code"
          />
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {enabled ? 'Turn off' : 'Turn on'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}