import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

/** The image-and-answer half of the recovery-email security check. */
export default function CaptchaField({ image, value, onChange, onRefresh, loading, error, disabled }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="captcha-answer">Security check</Label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-lg border border-border bg-white p-1.5">
          {image ? (
            <img src={image} alt="Characters for the security check" width={150} height={48} className="h-12 w-[150px]" />
          ) : (
            <div className="h-12 w-[150px] animate-pulse rounded bg-secondary" />
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRefresh} disabled={loading || disabled}>
          <RefreshCw className={loading ? 'mr-1.5 h-3.5 w-3.5 animate-spin' : 'mr-1.5 h-3.5 w-3.5'} aria-hidden="true" />
          New image
        </Button>
      </div>
      <Input
        id="captcha-answer"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5))}
        placeholder="Type the characters"
        autoComplete="off"
        autoCapitalize="characters"
        maxLength={5}
        disabled={disabled}
        className="mono-id tracking-[0.3em]"
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Type the characters shown in the image to prove you are a person.
      </p>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}