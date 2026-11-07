import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PasswordInput from '@/components/account/PasswordInput';
import { Loader2, MailCheck } from 'lucide-react';

/**
 * Proves the account owner: the account password, plus the six-digit emailed
 * code whenever email verification is switched on.
 */
export default function IdentityCheckFields({
  value,
  onChange,
  twoFactor,
  onSendCode,
  sendingCode,
  codeSent,
  disabled,
  passwordId = 'identity-password',
  codeId = 'identity-code',
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={passwordId}>Account password</Label>
        <PasswordInput
          id={passwordId}
          autoComplete="current-password"
          value={value.password}
          onChange={(event) => onChange({ ...value, password: event.target.value })}
          required
        />
      </div>

      {twoFactor && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor={codeId}>Six-digit code from your email</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={onSendCode}
              disabled={disabled || sendingCode}
            >
              {sendingCode ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <MailCheck className="mr-1.5 h-3 w-3" aria-hidden="true" />
              )}
              {codeSent ? 'Send a new code' : 'Email me a code'}
            </Button>
          </div>
          <Input
            id={codeId}
            inputMode="numeric"
            maxLength={6}
            value={value.code}
            onChange={(event) => onChange({ ...value, code: event.target.value.replace(/\D/g, '') })}
            placeholder="000000"
            required
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Email verification is on for this account, so this change also needs the code we send to your sign-in address.
          </p>
        </div>
      )}
    </div>
  );
}