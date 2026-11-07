// Sign in / register for students, lab assistants and instructors
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import AuthSidePanel from '@/components/auth/AuthSidePanel';
import CopyrightNotice from '@/components/layout/CopyrightNotice';
import RoleTabs from '@/components/auth/RoleTabs';
import RegisterFields, { REF_FIELD } from '@/components/auth/RegisterFields';
import VerifyCodeStep from '@/components/auth/VerifyCodeStep';
import { ROLE_META, ROLE_ORDER } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { safeReturnTo } from '@/lib/authReturnTo';
import PasswordInput from '@/components/account/PasswordInput';
import PasswordStrength from '@/components/account/PasswordStrength';
import { startSignInSession } from '@/components/auth/sessionState';
import { loginWithMfa, continueMfa } from '@/lib/authMfa';
import { checkEmail, checkPassword, passwordProblem } from '@/lib/passwordPolicy';
import { Loader2, ArrowLeft, Info, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/]{2,23}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_PREFIX = { student: 'st', lab_assistant: 'la', instructor: 'in' };

const EMPTY = {
  full_name: '',
  email: '',
  password: '',
  confirm: '',
  roll_number: '',
  assistant_id: '',
  instructor_id: '',
  access_code: '',
  avatar_id: 'st-1',
  usage_stats: true,
};

function readError(error, fallback) {
  return error?.response?.data?.error || error?.data?.error || error?.message || fallback;
}

export default function SignIn() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const returnTo = safeReturnTo();

  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('register');
  const [step, setStep] = useState('details');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [code, setCode] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });

  // Live checks while typing — the message disappears as soon as the entry is valid.
  const loginEmailInvalid = checkEmail(login.email).state === 'invalid';
  const loginPasswordWeak = Boolean(login.password) && !checkPassword(login.password).ok;

  const changeRole = (nextRole) => {
    setRole(nextRole);
    setError('');
    setNotice('');
    setForm((current) => ({ ...current, avatar_id: `${AVATAR_PREFIX[nextRole]}-1` }));
  };

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    if (form.full_name.trim().length < 2) return 'Enter your full name.';
    if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.';
    const ref = form[REF_FIELD[role]]?.trim() || '';
    if (!ID_PATTERN.test(ref)) return `Enter a valid ${ROLE_META[role].referenceLabel.toLowerCase()}.`;
    const strengthProblem = passwordProblem(form.password);
    if (strengthProblem) return strengthProblem;
    if (form.password !== form.confirm) return 'The two passwords do not match.';
    if (form.access_code.trim().length < 4) return `Enter the ${ROLE_META[role].label.toLowerCase()} access key.`;
    return '';
  };

  const createProfile = async () => {
    const refKey = REF_FIELD[role];
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      role,
      avatar_id: form.avatar_id,
      [refKey]: form[refKey].trim(),
    };
    payload.access_code = form.access_code.trim();
    payload.tracking_opt_out = !form.usage_stats;

    await api.functions.invoke('completeProfile', payload);
    startSignInSession();
    window.location.href = returnTo || '/';
  };

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (verified) {
      setLoading(true);
      try {
        await createProfile();
      } catch (err) {
        setError(readError(err, 'We could not finish setting up your profile.'));
        setStep('details');
      } finally {
        setLoading(false);
      }
      return;
    }

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setLoading(true);
    try {
      await api.auth.register({ email: form.email.trim().toLowerCase(), password: form.password });
      setStep('code');
      setNotice(`Verification code sent to ${form.email.trim()}.`);
    } catch (err) {
      setError(readError(err, 'We could not start the registration. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api.auth.verifyOtp({ email: form.email.trim().toLowerCase(), otpCode: code });
      if (result?.mfa_required) {
        try { await continueMfa(result, returnTo); }
        catch { window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`; }
        return;
      }
      if (!result?.access_token) throw new Error('Verification did not finish. Please try again.');
      api.auth.setToken(result.access_token);
      setVerified(true);
      await createProfile();
    } catch (err) {
      setError(readError(err, 'That code is not valid or has expired. Request a new one.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await api.auth.resendOtp(form.email.trim().toLowerCase());
      setNotice('A new six-digit code is on its way.');
    } catch (err) {
      setError(readError(err, 'We could not resend the code yet. Wait a moment and try again.'));
    } finally {
      setResending(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!EMAIL_PATTERN.test(login.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!login.password) {
      setError('Enter your password.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithMfa(login.email.trim().toLowerCase(), login.password);
      if (result?.mfa_required) { await continueMfa(result, returnTo); return; }
      startSignInSession();
      window.location.href = returnTo || '/';
    } catch (err) {
      setError(readError(err, 'That email and password did not match an account.'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep('details');
    setError('');
    setNotice('');
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.02fr_1fr]">
      <div className="hidden lg:block">
        <AuthSidePanel role={role} />
      </div>

      <div className="relative flex flex-col px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to LabTrack Pro
            </Link>
            {isAuthenticated && (
              <span className="inline-flex items-center gap-1 text-xs text-status-available">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Signed in
              </span>
            )}
          </div>

          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">FCI · Computer Labs</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold">
              {mode === 'register' ? 'Create your LabTrack account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === 'register'
                ? 'Pick your role first — your permissions come from it.'
                : 'Sign in with the email and password you registered with.'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === 'login' ? 'default' : 'outline'}
              aria-pressed={mode === 'login'}
              onClick={() => switchMode('login')}
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Log in
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'register' ? 'default' : 'outline'}
              aria-pressed={mode === 'register'}
              onClick={() => switchMode('register')}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Create account
            </Button>
          </div>

          <div className="mt-5">
            <RoleTabs value={role} onChange={changeRole} />
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {notice && !error && (
            <div role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-status-available/30 bg-status-available/[0.07] px-4 py-3 text-sm text-status-available">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}

          <div className="mt-5 flex-1">
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@fci.edu"
                    value={login.email}
                    onChange={(event) => setLogin((current) => ({ ...current, email: event.target.value }))}
                    className={loginEmailInvalid ? 'border-destructive' : ''}
                    required
                  />
                  {loginEmailInvalid && (
                    <p role="alert" className="text-xs text-destructive">
                      Invalid email.
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <PasswordInput
                    id="login-password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={login.password}
                    onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                    className={loginPasswordWeak ? 'border-destructive' : ''}
                    required
                  />
                  {loginPasswordWeak && (
                    <p role="alert" className="text-xs text-destructive">
                      Password is weak.
                    </p>
                  )}
                  {login.password && <PasswordStrength value={login.password} />}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…
                    </>
                  ) : (
                    `Log in as ${ROLE_META[role].label}`
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your role is read from your saved profile — signing in through a different tab never upgrades it.
                </p>
                <Link to="/forgot-password" className="inline-block text-xs font-medium text-primary hover:underline">
                  Forgot your password?
                </Link>
              </form>
            ) : step === 'code' ? (
              <VerifyCodeStep
                email={form.email}
                code={code}
                onCodeChange={setCode}
                onVerify={handleVerify}
                onResend={handleResend}
                onBack={() => setStep('details')}
                loading={loading}
                resending={resending}
              />
            ) : (
              <form onSubmit={handleSendCode}>
                <RegisterFields role={role} form={form} onChange={updateField} disabled={loading} />
                {form.password && <PasswordStrength value={form.password} />}
                <Button type="submit" className="mt-6 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Working…
                    </>
                  ) : verified ? (
                    'Finish setting up my profile'
                  ) : (
                    'Get code & create account'
                  )}
                </Button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                  We email a six-digit code to confirm the address. Nothing is shown in the browser as a substitute for
                  real delivery.
                </p>
              </form>
            )}
          </div>

          <div className="mt-8 border-t border-border/70 pt-5">
            <p className="text-sm text-muted-foreground">
              {mode === 'register' ? 'Already have an account?' : 'New to LabTrack Pro?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                className="font-semibold text-primary hover:underline"
              >
                {mode === 'register' ? 'Log in' : 'Create an account'}
              </button>
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Signing in as: {ROLE_ORDER.map((item) => ROLE_META[item].label).join(' · ')} — switch role above.
            </p>
            <CopyrightNotice className="mt-5 text-[10px] text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}