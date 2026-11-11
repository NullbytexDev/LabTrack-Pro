import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import ActiveSessions from '@/components/account/ActiveSessions';
import TwoFactorCard from '@/components/account/TwoFactorCard';
import DeleteAccountPanel from '@/components/account/DeleteAccountPanel';
import IdentityCheckFields from '@/components/account/IdentityCheckFields';
import { Loader2, MailCheck, KeyRound } from 'lucide-react';

/** Security settings. Anything that changes how the account can be accessed asks for the password first. */
export default function SecurityPanel({ profile, onUpdated }) {
  const [recovery, setRecovery] = useState(profile?.recovery_email || '');
  const [recoveryIdentity, setRecoveryIdentity] = useState({ password: '', code: '' });
  const [savingRecovery, setSavingRecovery] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const emailTwoFactor = profile?.email_two_factor === true;

  useEffect(() => {
    setRecovery(profile?.recovery_email || '');
  }, [profile?.recovery_email]);

  const sendCode = async () => {
    setSendingCode(true);
    try {
      await api.functions.invoke('accountSecurity', { action: 'sensitive_code' });
      setRecoveryCodeSent(true);
      toast({ title: 'Code sent', description: 'Check your sign-in email for the six-digit code.' });
    } catch (err) {
      setRecoveryError(err?.response?.data?.error || 'The code could not be sent.');
    } finally {
      setSendingCode(false);
    }
  };

  const saveRecovery = async (event) => {
    event.preventDefault();
    setRecoveryError('');
    setSavingRecovery(true);
    try {
      await api.functions.invoke('accountSecurity', {
        action: 'update_recovery',
        recovery_email: recovery,
        password: recoveryIdentity.password,
        code: recoveryIdentity.code,
      });
      toast({
        title: 'Recovery email saved',
        description: recovery
          ? 'If you lose access to your sign-in email, a code sent here proves it is you.'
          : 'The recovery email was removed.',
      });
      setRecoveryIdentity({ password: '', code: '' });
      setRecoveryCodeSent(false);
      window.dispatchEvent(new Event('labtrack:profile-updated'));
      onUpdated?.();
    } catch (err) {
      setRecoveryError(err?.response?.data?.error || 'That address could not be saved.');
    } finally {
      setSavingRecovery(false);
    }
  };

  return (
    <div className="space-y-4">
      <TwoFactorCard profile={profile} onUpdated={onUpdated} />

      <section className="surface p-5" aria-label="Password">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" /> Password
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Change it under <span className="font-medium text-foreground">Edit Profile → Change password</span>. Your current
          password is checked first; new passwords need 12+ characters with a number and a symbol.
        </p>
      </section>

      <form onSubmit={saveRecovery} className="surface p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <MailCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Recovery email
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          If you ever lose access to your sign-in email, a code sent to this address proves the account is yours and lets
          you move the account onto an address you can reach. It is never used to sign in, and it cannot be used as your
          account email.
        </p>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="recovery-email">Recovery email address</Label>
          <Input
            id="recovery-email"
            type="email"
            placeholder="backup@example.com"
            autoComplete="email"
            value={recovery}
            onChange={(event) => setRecovery(event.target.value)}
          />
        </div>
        <div className="mt-3">
          <IdentityCheckFields
            value={recoveryIdentity}
            onChange={setRecoveryIdentity}
            twoFactor={emailTwoFactor}
            onSendCode={sendCode}
            sendingCode={sendingCode}
            codeSent={recoveryCodeSent}
            disabled={savingRecovery}
            passwordId="recovery-password"
            codeId="recovery-code"
          />
        </div>
        {recoveryError && (
          <p role="alert" className="mt-2 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
            {recoveryError}
          </p>
        )}
        <Button type="submit" className="mt-3" disabled={savingRecovery}>
          {savingRecovery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Save recovery email
        </Button>
      </form>

      <ActiveSessions />
      <DeleteAccountPanel twoFactor={emailTwoFactor} />
    </div>
  );
}