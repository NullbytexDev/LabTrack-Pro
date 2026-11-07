import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import IdentityCheckFields from '@/components/account/IdentityCheckFields';
import { savePendingMove, readPendingMove, clearPendingMove } from '@/components/account/PendingAccountMove';
import { Loader2, Mail, ArrowRight, Info } from 'lucide-react';

/**
 * Moving the account to a new email: password (+ emailed code when verification
 * is on), then a code sent to the new address. LabTrack identities are tied to
 * the sign-in address, so the move finishes as soon as the member signs in with
 * the new address — profile, role and history come along.
 */
export default function EmailChangeSection({ user, profile, twoFactor, onChanged }) {
  const [step, setStep] = useState('form');
  const [newEmail, setNewEmail] = useState('');
  const [identity, setIdentity] = useState({ password: '', code: '' });
  const [code, setCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState(readPendingMove()?.email || '');
  const [busy, setBusy] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');

  const sendIdentityCode = async () => {
    setSendingCode(true);
    setError('');
    try {
      await api.functions.invoke('accountSecurity', { action: 'sensitive_code' });
      setCodeSent(true);
      toast({ title: 'Code sent', description: `Check ${user?.email} for the six-digit code.` });
    } catch (err) {
      setError(err?.response?.data?.error || 'The code could not be sent.');
    } finally {
      setSendingCode(false);
    }
  };

  /** For a member who cannot open the main mailbox any more: same code, other address. */
  const sendIdentityCodeToRecovery = async () => {
    setSendingCode(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('accountSecurity', { action: 'sensitive_code', channel: 'recovery' });
      setCodeSent(true);
      toast({ title: 'Code sent', description: `Check ${data?.sent_to || 'your recovery email'} for the six-digit code.` });
    } catch (err) {
      setError(err?.response?.data?.error || 'The code could not be sent.');
    } finally {
      setSendingCode(false);
    }
  };

  const requestChange = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.functions.invoke('accountSecurity', {
        action: 'request_email_change',
        new_email: newEmail.trim(),
        password: identity.password,
        code: identity.code,
      });
      setPendingEmail(data?.pending_email || newEmail.trim().toLowerCase());
      setStep('code');
      toast({ title: 'Code sent', description: `A confirmation code is on its way to ${data?.pending_email || newEmail}.` });
    } catch (err) {
      setError(err?.response?.data?.error || 'The email change could not be started.');
    } finally {
      setBusy(false);
    }
  };

  const confirmChange = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.functions.invoke('accountSecurity', { action: 'confirm_email_change', code: code.trim() });
      savePendingMove({ token: data.token, email: data.pending_email });
      setPendingEmail(data.pending_email);
      setStep('pending');
      setCode('');
      setIdentity({ password: '', code: '' });
      toast({ title: 'Address verified', description: `Sign in with ${data.pending_email} to finish the move.` });
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'That code could not be confirmed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Account email</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Currently <span className="font-medium text-foreground">{user?.email}</span>. Changing it proves the new
            address before anything moves.
          </p>
        </div>
      </div>

      {step === 'form' && (
        <form onSubmit={requestChange} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-email">New email address</Label>
            <Input
              id="new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="you@example.com"
              maxLength={254}
              required
            />
            {profile?.recovery_email && (
              <p className="text-[11px] text-muted-foreground">
                Your recovery email ({profile.recovery_email}) cannot be used as the account email.
              </p>
            )}
          </div>
          <IdentityCheckFields
            value={identity}
            onChange={setIdentity}
            twoFactor={twoFactor}
            onSendCode={sendIdentityCode}
            sendingCode={sendingCode}
            codeSent={codeSent}
            disabled={busy}
            passwordId="email-change-password"
            codeId="email-change-code"
          />
          {twoFactor && profile?.recovery_email && (
            <button
              type="button"
              onClick={sendIdentityCodeToRecovery}
              disabled={sendingCode || busy}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              Can&apos;t open your main mailbox? Send the code to your recovery email
            </button>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Send code to new address
          </Button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={confirmChange} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-email-code">Code sent to {pendingEmail}</Label>
            <Input
              id="new-email-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Verify new address
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setStep('form')}>
              Back
            </Button>
          </div>
        </form>
      )}

      {step === 'pending' && (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/[0.07] p-3 text-xs leading-relaxed text-primary">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {pendingEmail} is verified. Sign in — or create the account — with that address and your LabTrack profile,
              role and history move onto it automatically.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/signin">
                Sign in with {pendingEmail} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearPendingMove();
                setStep('form');
                setPendingEmail('');
                toast({ title: 'Move cancelled', description: 'The pending email change was cleared on this device.' });
              }}
            >
              Cancel move
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Nothing changes until you sign in with the new address. This device keeps working with{' '}
            {user?.email} in the meantime.
          </p>
        </div>
      )}

    </div>
  );
}