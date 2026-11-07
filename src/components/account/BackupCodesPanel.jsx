import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, LifeBuoy } from 'lucide-react';

/** The five single-use backup codes, shown once right after the app is turned on. */
export default function BackupCodesPanel({ codes, onDone }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-status-minor/40 bg-status-minor/[0.07] p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <LifeBuoy className="h-4 w-4 text-status-minor" aria-hidden="true" /> Your five backup codes
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        Store these somewhere safe, away from your authenticator app. If you lose access to your authenticator app, use
        one of them instead of a code from the app. Each code works once, and they are shown only this one time.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {codes.map((code) => (
          <li
            key={code}
            className="mono-id rounded-lg border border-border bg-background px-3 py-2 text-center text-sm tracking-[0.14em]"
          >
            {code}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="mr-2 h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="mr-2 h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy codes'}
        </Button>
        <Button type="button" size="sm" onClick={onDone}>I have saved them</Button>
      </div>
    </div>
  );
}