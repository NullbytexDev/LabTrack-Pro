import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/account/PasswordInput';
import CaptchaField from '@/components/auth/CaptchaField';
import { Loader2, LifeBuoy } from 'lucide-react';

/**
 * Sends the sign-in code to the account's recovery email, for a member who can
 * no longer open the primary mailbox. The password and a CAPTCHA are both
 * required before a code leaves the server.
 */
export default function RecoveryEmailCodeDialog({ open, onOpenChange, onSent }) {
  const [password, setPassword] = useState('');
  const [answer, setAnswer] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadChallenge = useCallback(async () => {
    setLoadingChallenge(true);
    setCaptchaError('');
    setAnswer('');
    try {
      const { data } = await api.functions.invoke('accountSecurity', { action: 'captcha' });
      setChallenge(data || null);
    } catch (err) {
      setChallenge(null);
      setCaptchaError(err?.response?.data?.error || 'The security check could not be loaded.');
    } finally {
      setLoadingChallenge(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setAnswer('');
    setError('');
    loadChallenge();
  }, [open, loadChallenge]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('accountSecurity', {
        action: 'start_signin_code',
        channel: 'recovery',
        password,
        captcha_id: challenge?.captcha_id,
        captcha_answer: answer,
      });
      onSent?.(data?.sent_to || '');
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'The code could not be sent. Try again.');
      loadChallenge();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-primary" aria-hidden="true" /> Use my recovery email
          </DialogTitle>
          <DialogDescription>
            We send the sign-in code to the recovery email on your account instead of your main address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="recovery-password">Account password</Label>
            <PasswordInput
              id="recovery-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <CaptchaField
            image={challenge?.image}
            value={answer}
            onChange={setAnswer}
            onRefresh={loadChallenge}
            loading={loadingChallenge}
            error={captchaError}
            disabled={busy}
          />

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !password || answer.length < 5 || !challenge}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {busy ? 'Sending…' : 'Send code there'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}