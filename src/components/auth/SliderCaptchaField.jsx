import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react';
import BotCheckSlider from '@/components/auth/BotCheckSlider';

/**
 * "Verifying you're not a bot": grayscale static with one faint circle drawn
 * into it, and a slider whose ring has to be dragged onto that circle.
 *
 * The server holds the answer and picks a new circle position for every
 * challenge. This component only sends the ring's position and receives a
 * single-use pass, which the caller hands to a backend function.
 */

/** Kept in sync with the server's slot grid (captchaChallenge). */
const SLOTS = 24;
/** Image geometry: 320×128 with a 26px inset, circle radius 22 (see shared/captcha.ts). */
const IMAGE_ASPECT = '320 / 128';
const PAD_PCT = (26 / 320) * 100;
const SPAN_PCT = ((320 - 52) / 320) * 100;
const RING_PCT = (44 / 320) * 100;

const COPY = {
  idle: {
    title: "Verifying you're not a bot",
    line: 'Drag the slider so the circle sits over the faint circle in the static.',
  },
  checking: { title: 'Checking your answer…', line: 'One moment.' },
  verified: { title: "You're verified", line: 'You can continue with the form.' },
  failed: { title: "That didn't line up", line: 'A fresh image is ready — try again.' },
};

export default function SliderCaptchaField({ disabled, email, onVerified, onReset }) {
  const [challenge, setChallenge] = useState(null);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const resetRef = useRef(onReset);
  resetRef.current = onReset;
  const verifiedRef = useRef(onVerified);
  verifiedRef.current = onVerified;
  // Read through a ref so typing an email never reloads the puzzle.
  const emailRef = useRef(email);
  emailRef.current = email;

  /** Fetches a fresh puzzle; returns false when it could not be loaded. */
  const fetchChallenge = useCallback(async () => {
    setChallenge(null);
    try {
      const response = await api.functions.invoke('captchaChallenge', {
        action: 'challenge',
        email: emailRef.current || '',
      });
      const data = response.data || {};
      if (data.challenge_id) {
        setChallenge(data);
        return true;
      }
      setError('The bot check could not load. Try again.');
      return false;
    } catch {
      setError('The bot check could not load. Try again.');
      return false;
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus('idle');
    setPosition(0);
    setError('');
    resetRef.current?.();
    await fetchChallenge();
    setLoading(false);
  }, [fetchChallenge]);

  useEffect(() => {
    load();
  }, [load]);

  /** A wrong answer keeps the failed shield on screen until the next attempt. */
  const fail = async (message) => {
    setPosition(0);
    resetRef.current?.();
    setLoading(true);
    await fetchChallenge();
    setLoading(false);
    setStatus('failed');
    setError(message);
  };

  const verify = async (slot) => {
    if (!challenge) return;
    setStatus('checking');
    setError('');
    try {
      const response = await api.functions.invoke('captchaChallenge', {
        action: 'verify',
        challenge_id: challenge.challenge_id,
        position: slot,
        email: emailRef.current || '',
      });
      const data = response.data || {};
      if (data.ok && data.pass) {
        setStatus('verified');
        verifiedRef.current?.(data.pass);
        return;
      }
      await fail(data.error || 'The circle was not over the target.');
    } catch (err) {
      await fail(err?.response?.data?.error || 'That did not line up.');
    }
  };

  const handlePosition = (value) => {
    if (status === 'failed') {
      setStatus('idle');
      setError('');
    }
    setPosition(value);
  };

  const verified = status === 'verified';
  const busy = loading || status === 'checking';
  const copy = COPY[status];

  const ShieldIcon = verified ? ShieldCheck : status === 'failed' ? ShieldX : ShieldCheck;
  const shieldTone = verified
    ? 'border-status-available/40 bg-status-available/10 text-status-available'
    : status === 'failed'
      ? 'border-destructive/40 bg-destructive/10 text-destructive'
      : 'border-border/70 bg-secondary/60 text-muted-foreground';

  const ringLeft = PAD_PCT + (position / (SLOTS - 1)) * SPAN_PCT;

  return (
    <div className="rounded-2xl border border-border/70 bg-ink/80 p-4 text-center sm:p-5">
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={load}
          disabled={busy || disabled}
          aria-label="Load a new image"
          className="absolute -right-1 -top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} aria-hidden="true" />
        </Button>

        <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl border ${shieldTone}`}>
          {status === 'checking' ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        <h3 className="mt-3 text-sm font-semibold leading-tight text-foreground">{copy.title}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{copy.line}</p>
      </div>

      <div
        className="relative mt-4 overflow-hidden rounded-xl border border-border/70 bg-background"
        style={{ aspectRatio: IMAGE_ASPECT }}
      >
        {challenge?.image ? (
          <img
            src={challenge.image}
            alt="Grayscale static with one faint circular area"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-secondary" />
        )}

        {challenge?.image && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-150 ${
              verified ? 'border-status-available' : 'border-brand'
            }`}
            style={{ left: `${ringLeft}%`, width: `${RING_PCT}%`, aspectRatio: '1 / 1' }}
          />
        )}
      </div>

      <div className="mt-3">
        <BotCheckSlider
          position={position}
          onChange={handlePosition}
          onCommit={verify}
          disabled={disabled || busy || !challenge}
          verified={verified}
        />
      </div>

      <p role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-[11px] leading-relaxed">
        {status === 'checking' ? (
          <span className="text-muted-foreground">Checking…</span>
        ) : error ? (
          <span className={status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}>{error}</span>
        ) : verified ? (
          <span className="text-status-available">Verified — you can continue.</span>
        ) : (
          <span className="text-muted-foreground">Keyboard: focus the arrow, use the arrow keys, then press Enter.</span>
        )}
      </p>
    </div>
  );
}