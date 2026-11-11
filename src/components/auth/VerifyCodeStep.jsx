import React from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { MailCheck, Loader2, ArrowLeft } from 'lucide-react';

export default function VerifyCodeStep({ email, code, onCodeChange, onVerify, onResend, onBack, loading, resending, captcha }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium">Verify your email</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Enter the six-digit code we emailed to <span className="font-medium text-foreground">{email}</span>. It is
            valid for 10 minutes. If it has not arrived within a minute, check your spam or promotions folder before
            resending.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={code} onChange={onCodeChange} autoComplete="one-time-code" aria-label="Six-digit verification code">
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button type="button" className="w-full" onClick={onVerify} disabled={loading || code.length < 6}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…
          </>
        ) : (
          'Verify and finish'
        )}
      </Button>

      {captcha && (
        <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4">
          <p className="mb-3 text-xs text-muted-foreground">Requesting another code needs a quick bot check.</p>
          {captcha}
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Change details
        </button>
        <button type="button" onClick={onResend} disabled={resending} className="font-medium text-primary hover:underline disabled:opacity-60">
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}