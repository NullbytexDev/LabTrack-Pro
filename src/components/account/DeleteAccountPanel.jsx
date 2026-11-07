import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import IdentityCheckFields from '@/components/account/IdentityCheckFields';
import { Loader2, Trash2, TriangleAlert } from 'lucide-react';

/**
 * Account deletion: the password (and the emailed code when email verification
 * is on) is checked first, then a warning asks one last time. Nothing is
 * removed until that warning is confirmed.
 */
export default function DeleteAccountPanel({ twoFactor }) {
  const [open, setOpen] = useState(false);
  const [warn, setWarn] = useState(false);
  const [identity, setIdentity] = useState({ password: '', code: '' });
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setWarn(false);
    setIdentity({ password: '', code: '' });
    setCodeSent(false);
    setError('');
    setBusy(false);
  };

  const sendCode = async () => {
    setSendingCode(true);
    setError('');
    try {
      await api.functions.invoke('accountSecurity', { action: 'sensitive_code' });
      setCodeSent(true);
      toast({ title: 'Code sent', description: 'Check your sign-in email for the six-digit code.' });
    } catch (err) {
      setError(err?.response?.data?.error || 'The code could not be sent.');
    } finally {
      setSendingCode(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.functions.invoke('accountSecurity', {
        action: 'verify_sensitive',
        password: identity.password,
        code: identity.code,
      });
      setWarn(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Your password could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    setBusy(true);
    setError('');
    try {
      await api.functions.invoke('accountSecurity', {
        action: 'confirm_delete',
        password: identity.password,
        code: identity.code,
        confirmation: 'DELETE',
      });
      toast({ title: 'Account deleted', description: 'Your profile and account data have been removed.' });
      window.setTimeout(() => api.auth.logout('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'The account could not be deleted.');
      setBusy(false);
    }
  };

  return (
    <div className="surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Delete account</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Deletion is permanent. Your profile, authenticator settings, sessions, messages and notifications are removed
            and the account can no longer sign in.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          Delete
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this account</DialogTitle>
            <DialogDescription>Confirm your identity to continue.</DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.07] p-3 text-xs leading-relaxed text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Your profile, authenticator settings, recovery email, sessions, messages and notifications are deleted
              permanently. Your name stays on repair records already filed, because the institute keeps them as lab
              history.
            </span>
          </div>

          <form onSubmit={verify} className="mt-4 space-y-3">
            <IdentityCheckFields
              value={identity}
              onChange={setIdentity}
              twoFactor={twoFactor}
              onSendCode={sendCode}
              sendingCode={sendingCode}
              codeSent={codeSent}
              disabled={busy}
              passwordId="delete-password"
              codeId="delete-code"
            />
            {error && !warn && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-destructive hover:bg-destructive/90"
                disabled={busy || !identity.password || (twoFactor && !identity.code)}
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={warn} onOpenChange={(next) => { if (!next && !busy) setWarn(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Your LabTrack Pro account cannot be recovered once it is deleted — the profile, its
              sessions, messages and notifications are gone for good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep my account</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                deleteAccount();
              }}
            >
              {busy ? 'Deleting…' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}