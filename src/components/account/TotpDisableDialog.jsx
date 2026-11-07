import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function TotpDisableDialog({ open, onOpenChange, code, onCodeChange, onConfirm, busy, error }) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Turn off two-factor authentication</DialogTitle>
          <DialogDescription>
            Enter the current code from your authenticator app to confirm it is still in your hands.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => { event.preventDefault(); if (code.length === 6) onConfirm(); }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="totp-disable-code">Six-digit code</Label>
            <Input
              id="totp-disable-code"
              value={code}
              onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              className="mono-id text-center text-lg tracking-[0.4em]"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={busy || code.length !== 6}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}