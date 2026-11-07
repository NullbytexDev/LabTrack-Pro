import React, { useEffect, useState } from 'react';
import useProfile from '@/hooks/useProfile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ROLE_META } from '@/lib/constants';
import { CheckCircle2 } from 'lucide-react';

export const SIGNIN_FLAG = 'labtrack:signed-in';

/** Confirmation pop-up shown once, right after a successful sign-in. */
export default function SignInConfirmation() {
  const [open, setOpen] = useState(false);
  const { user, profile, role, loading } = useProfile();
  const roleLabel = ROLE_META[role]?.label || 'Member';
  useEffect(() => {
    if (loading || !user || !sessionStorage.getItem(SIGNIN_FLAG)) return;
    sessionStorage.removeItem(SIGNIN_FLAG);
    setOpen(true);
  }, [loading, user?.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-available/12">
            <CheckCircle2 className="h-6 w-6 text-status-available" aria-hidden="true" />
          </span>
          <DialogTitle className="mt-3 text-center">Signed in to LabTrack Pro</DialogTitle>
          <DialogDescription className="text-center">
            Welcome, <span className="font-semibold text-primary">{profile?.full_name || user?.full_name || user?.email}</span>.
            <span className="mt-1 block">{user?.email} · {roleLabel}</span>
          </DialogDescription>
        </DialogHeader>
        <Button className="mt-2 w-full" onClick={() => setOpen(false)}>
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}