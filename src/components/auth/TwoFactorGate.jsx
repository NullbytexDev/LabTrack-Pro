import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import useProfile from '@/hooks/useProfile';
import PageLoader from '@/components/common/PageLoader';
import EmailVerificationForm from '@/components/auth/EmailVerificationForm';
import TotpCodeForm from '@/components/auth/TotpCodeForm';
import RecoveryEmailCodeDialog from '@/components/auth/RecoveryEmailCodeDialog';
import { grantPass, hasPass } from '@/lib/twoFactorPass';

/**
 * Asks for a second factor once per signed-in session when the member turned
 * email verification or an authenticator app on. Whichever method is preferred
 * is shown first, and the other one stays one click away.
 */
export default function TwoFactorGate({ children }) {
  const { user } = useAuth();
  const { profile, loading, error: profileError } = useProfile();
  const [authenticator, setAuthenticator] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [passed, setPassed] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [channel, setChannel] = useState('primary');

  useEffect(() => {
    if (!user?.id) {
      setAuthenticator(false);
      return;
    }
    api.functions
      .invoke('totpStatus', {})
      .then(({ data }) => setAuthenticator(data?.enabled === true))
      .catch(() => setAuthenticator(false));
  }, [user?.id]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const emailOn = profile?.email_two_factor === true;
  const appOn = authenticator === true;
  const preferred = profile?.two_factor_preferred === 'authenticator' && appOn
    ? 'authenticator'
    : emailOn ? 'email' : appOn ? 'authenticator' : null;
  const method = chosen === 'email' && emailOn
    ? 'email'
    : chosen === 'authenticator' && appOn ? 'authenticator' : preferred;
  const open = Boolean(user) && !passed && !hasPass(user?.id) && (emailOn || appOn);

  const sendEmailCode = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('accountSecurity', { action: 'start_signin_code' });
      if (data?.required === false) {
        if (appOn) setChosen('authenticator');
        else setPassed(true);
      } else {
        setChannel('primary');
        setSentTo('');
        setCooldown(60);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'The code could not be sent. Try again.');
      if (err?.response?.status === 429) setCooldown(Number(err.response.data?.retry_after) || 60);
    } finally {
      setBusy(false);
    }
  };

  // The emailed code goes out once, the first time that method is shown.
  const autoSent = useRef(false);
  useEffect(() => {
    if (!open || method !== 'email' || autoSent.current) return;
    autoSent.current = true;
    sendEmailCode();
  }, [open, method]);

  const verify = async (value) => {
    setBusy(true);
    setError('');
    try {
      if (method === 'email') {
        await api.functions.invoke('accountSecurity', { action: 'verify_signin_code', code: value });
      } else {
        await api.functions.invoke('totpLoginVerify', { code: value });
      }
      grantPass(user.id);
      setPassed(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const switchTo = (next) => {
    setError('');
    setChosen(next);
  };

  if (!user) return children;
  if (passed || hasPass(user.id)) return children;
  if (loading || authenticator === null) return <PageLoader label="Checking two-factor authentication" />;
  if (profileError || !open) return children;

  const recoveryDialog = (
    <RecoveryEmailCodeDialog
      open={recoveryOpen}
      onOpenChange={setRecoveryOpen}
      onSent={(to) => {
        setChannel('recovery');
        setSentTo(to || 'your recovery email');
        setCooldown(60);
        setError('');
      }}
    />
  );

  if (method === 'email') {
    return (
      <>
        <EmailVerificationForm
          email={sentTo || user.email}
          busy={busy}
          error={error}
          cooldown={cooldown}
          onVerify={verify}
          onResend={channel === 'recovery' ? () => setRecoveryOpen(true) : sendEmailCode}
          onSwitch={appOn ? () => switchTo('authenticator') : undefined}
          switchLabel="Use an authenticator app instead"
          onUseRecovery={() => setRecoveryOpen(true)}
        />
        {recoveryDialog}
      </>
    );
  }

  return (
    <div className="px-4 py-10">
      <TotpCodeForm
        title="Confirm it's you"
        description={`Signing in needs the current six-digit code from the authenticator app set up for ${user.email}.`}
        value={code}
        onChange={setCode}
        onSubmit={() => verify(code)}
        submitLabel="Verify & continue"
        busy={busy}
        error={error}
        onSwitch={emailOn ? () => switchTo('email') : undefined}
        switchLabel="Email me a code instead"
      />
      {recoveryDialog}
    </div>
  );
}