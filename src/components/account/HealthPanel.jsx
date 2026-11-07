import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { REF_FIELD } from '@/components/auth/RegisterFields';
import { checkEmail } from '@/lib/passwordPolicy';
import { formatDateTime } from '@/lib/format';
import { Check, X, HeartPulse, Loader2, ArrowRight, KeyRound, ShieldCheck, Fingerprint } from 'lucide-react';

/** Real indicators only: every check below reads a value that actually exists on the account. */
export default function HealthPanel({ user, profile, role }) {
  const [signIn, setSignIn] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    api.functions
      .invoke('signInEvents', { action: 'list', limit: 1 })
      .then((response) => {
        if (alive) setSignIn(response.data?.events?.[0] || null);
      })
      .catch(() => {
        if (alive) setSignIn(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const emailOk = checkEmail(user?.email || '').state === 'valid';
  const referenceKey = role ? REF_FIELD[role] : null;
  const profileComplete = Boolean(profile?.full_name) && Boolean(referenceKey && profile?.[referenceKey]);
  const [appTwoFactor, setAppTwoFactor] = useState(false);

  useEffect(() => {
    api.functions
      .invoke('totpStatus', {})
      .then(({ data }) => setAppTwoFactor(data?.enabled === true))
      .catch(() => setAppTwoFactor(false));
  }, []);

  const emailTwoFactor = profile?.email_two_factor === true;
  const twoFactor = emailTwoFactor || appTwoFactor;
  const twoFactorDetail = emailTwoFactor && appTwoFactor
    ? 'Email code and authenticator app are on'
    : appTwoFactor
      ? 'Authenticator app is on'
      : emailTwoFactor
        ? 'Email code is on'
        : 'Not enabled — available under Security';

  const checks = [
    {
      key: 'two_factor',
      label: 'Two-factor authentication enabled',
      detail: twoFactorDetail,
      ok: twoFactor,
    },
    {
      key: 'email',
      label: 'Sign-in email is valid',
      detail: user?.email || 'No email on this account',
      ok: emailOk,
    },
    {
      key: 'profile',
      label: 'Profile complete (name and ID)',
      detail: profileComplete ? `${profile?.full_name} · ${profile?.[referenceKey]}` : 'Some details are still missing',
      ok: profileComplete,
    },
    {
      key: 'recovery',
      label: 'Backup contact email on file',
      detail: profile?.recovery_email || 'Not added yet',
      ok: Boolean(profile?.recovery_email),
    },
    {
      key: 'signin',
      label: 'Sign-in activity recorded',
      detail: signIn ? `Last session ${formatDateTime(signIn.occurred_at)}` : 'No session recorded yet',
      ok: Boolean(signIn),
    },
  ];

  const scored = checks.filter((check) => check.ok !== null);
  const passed = scored.filter((check) => check.ok).length;
  const score = Math.round((passed / Math.max(1, scored.length)) * 100);
  const tone = score >= 80 ? 'text-status-available' : score >= 50 ? 'text-status-minor' : 'text-status-repair';
  const bar = score >= 80 ? 'bg-status-available' : score >= 50 ? 'bg-status-minor' : 'bg-status-repair';

  const sendResetLink = async () => {
    setSending(true);
    try {
      await api.auth.resetPasswordRequest(user?.email);
      toast({
        title: 'Reset link requested',
        description: `If ${user?.email} is registered, a password reset email is on its way.`,
      });
    } catch {
      toast({ title: 'Request failed', description: 'The reset email could not be requested right now.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartPulse className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Account health</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              An honest read on the security and completeness of this account.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className={`font-heading text-3xl font-semibold tabular-nums ${tone}`}>{score}%</p>
            <p className="text-[11px] text-muted-foreground">
              {passed} of {scored.length} verifiable checks passed
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="surface p-5">
        <h2 className="text-sm font-semibold">Security checks</h2>
        <ul className="mt-3 divide-y divide-border/60">
          {checks.map((check) => (
            <li key={check.key} className="flex items-start gap-3 py-2.5">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  check.ok ? 'bg-status-available/15 text-status-available' : 'bg-status-minor/15 text-status-minor'
                }`}
              >
                {check.ok === null ? <span aria-label="Not scored">—</span> : check.ok ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{check.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface p-5">
        <h2 className="text-sm font-semibold">Security tools</h2>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Send yourself a password reset link</p>
              <p className="text-[11px] text-muted-foreground">Emails a single-use reset link to {user?.email}.</p>
            </div>
            <Button variant="outline" size="sm" onClick={sendResetLink} disabled={sending}>
              {sending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
              Send link
            </Button>
          </div>

          <Link
            to="/account?tab=security"
            className="glow-hover flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Fingerprint className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Two-factor authentication and sign-in devices</p>
              <p className="text-[11px] text-muted-foreground">Check 2FA options and sign out devices signed in to this account.</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>

          <Link
            to="/account?tab=profile"
            className="glow-hover flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Change your password</p>
              <p className="text-[11px] text-muted-foreground">Your current password is verified before anything changes.</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}