import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TotpEnrollment from '@/components/account/TotpEnrollment';
import TotpDisableDialog from '@/components/account/TotpDisableDialog';
import BackupCodesPanel from '@/components/account/BackupCodesPanel';
import EmailTwoFactorDialog from '@/components/account/EmailTwoFactorDialog';
import { grantPass } from '@/lib/twoFactorPass';
import { Loader2, Mail, ShieldCheck, Smartphone } from 'lucide-react';

const PREFERRED_OPTIONS = [
  ['email', 'Email code'],
  ['authenticator', 'Authenticator app'],
];

/**
 * One place for both second factors: an emailed code, an authenticator app, or
 * both — and which of the two is asked for first at sign-in.
 */
export default function TwoFactorCard({ profile, onUpdated }) {
  const [status, setStatus] = useState(null);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [prefBusy, setPrefBusy] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    api.functions
      .invoke('totpStatus', {})
      .then(({ data }) => setStatus({ enrolled: Boolean(data?.enrolled), enabled: data?.enabled === true }))
      .catch(() => setStatus({ enrolled: false, enabled: false }));
  }, []);

  const emailOn = profile?.email_two_factor === true;
  const appOn = status?.enabled === true;
  const both = emailOn && appOn;
  const preferred = profile?.two_factor_preferred === 'authenticator' ? 'authenticator' : 'email';
  const summary = both ? 'Email + app' : emailOn ? 'Email code' : appOn ? 'Authenticator app' : 'Off';

  const startEnroll = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('totpEnroll', {});
      setSetup(data);
      setCode('');
    } catch (err) {
      setError(err?.response?.data?.error || 'The setup could not be started.');
    } finally {
      setBusy(false);
    }
  };

  const activate = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('totpVerify', { code });
      setSetup(null);
      setCode('');
      setStatus({ enrolled: true, enabled: true });
      setBackupCodes(Array.isArray(data?.backup_codes) ? data.backup_codes : []);
      // Turning it on already proved identity, so this session stays open.
      grantPass(profile?.user_id);
      toast({ title: 'Authenticator app on', description: 'Signing in now asks for a code from your authenticator app.' });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setDisableError('');
    try {
      await api.functions.invoke('totpDisable', { code: disableCode });
      setDisableOpen(false);
      setDisableCode('');
      setStatus({ enrolled: false, enabled: false });
      setBackupCodes([]);
      toast({ title: 'Authenticator app off', description: 'Your account no longer asks for an authenticator code.' });
      onUpdated?.();
    } catch (err) {
      setDisableError(err?.response?.data?.message || err?.response?.data?.error || 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const choosePreferred = async (next) => {
    if (next === preferred || prefBusy) return;
    setPrefBusy(true);
    setError('');
    try {
      await api.functions.invoke('accountSecurity', { action: 'set_two_factor_preferred', preferred: next });
      window.dispatchEvent(new Event('labtrack:profile-updated'));
      onUpdated?.();
      toast({ title: 'Preferred method saved', description: next === 'email' ? 'Sign-in now asks for an emailed code first.' : 'Sign-in now asks for an authenticator code first.' });
    } catch (err) {
      setError(err?.response?.data?.error || 'That preference could not be saved.');
    } finally {
      setPrefBusy(false);
    }
  };

  return (
    <section className="surface p-5" aria-label="Two-factor authentication">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Two-factor authentication
        </h2>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            emailOn || appOn
              ? 'border-status-available/40 bg-status-available/10 text-status-available'
              : 'border-border bg-secondary text-muted-foreground'
          }`}
        >
          {status === null && !emailOn ? 'Checking…' : summary}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Turn on an emailed code, an authenticator app, or both. Whichever you turn on is requested once after your
        password, each time you sign in.
      </p>

      <ul className="mt-3 divide-y divide-border/60">
        <li className="flex items-center gap-3 py-3">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Email verification</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              A six-digit code is emailed to {profile?.email || 'your registered address'} at sign-in.
            </p>
          </div>
          <Switch
            checked={emailOn}
            onCheckedChange={() => setEmailOpen(true)}
            disabled={busy}
            aria-label="Email verification at sign-in"
          />
        </li>
        <li className="flex items-center gap-3 py-3">
          <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Authenticator app</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              A six-digit code from your authenticator app. The secret stays on the server.
            </p>
          </div>
          <Switch
            checked={appOn}
            onCheckedChange={(next) => {
              setError('');
              if (next) startEnroll();
              else {
                setDisableCode('');
                setDisableError('');
                setDisableOpen(true);
              }
            }}
            disabled={busy || status === null || Boolean(setup)}
            aria-label="Authenticator app at sign-in"
          />
        </li>
      </ul>

      {setup && (
        <div className="mt-2 rounded-xl border border-border/70 bg-secondary/20 p-4">
          <TotpEnrollment
            setup={setup}
            code={code}
            onCodeChange={setCode}
            onVerify={activate}
            onCancel={() => { setSetup(null); setCode(''); setError(''); }}
            busy={busy}
            error={error}
          />
        </div>
      )}

      {both && (
        <div className="mt-3 rounded-xl border border-border/60 bg-secondary/30 p-3">
          <p className="text-sm font-medium">Preferred method</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Both are on, so this one is asked for first at sign-in. The other stays one click away.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PREFERRED_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => choosePreferred(value)}
                disabled={prefBusy}
                aria-pressed={preferred === value}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  preferred === value
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border bg-card/60 text-muted-foreground hover:border-primary/35'
                }`}
              >
                {label}
                {preferred === value && <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
              </button>
            ))}
          </div>
          {prefBusy && (
            <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Saving…
            </p>
          )}
        </div>
      )}

      {backupCodes.length > 0 && (
        <BackupCodesPanel codes={backupCodes} onDone={() => setBackupCodes([])} />
      )}

      {appOn && !setup && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => { setDisableCode(''); setDisableError(''); setDisableOpen(true); }}
          >
            Turn off authenticator app
          </Button>
        </div>
      )}

      {error && !setup && (
        <p role="alert" className="mt-2 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <EmailTwoFactorDialog
        open={emailOpen}
        enabled={emailOn}
        userId={profile?.user_id}
        onOpenChange={setEmailOpen}
        onSaved={onUpdated}
      />
      <TotpDisableDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        code={disableCode}
        onCodeChange={setDisableCode}
        onConfirm={disable}
        busy={busy}
        error={disableError}
      />
    </section>
  );
}