import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useProfile from '@/hooks/useProfile';
import { studentWindow } from '@/lib/studentValidity';
import { formatDay } from '@/lib/format';
import { GraduationCap } from 'lucide-react';

const KEY = 'labtrack-student-validity-shown';

/** Tells a student, once per sign-in, how long their access key keeps the account valid. */
export default function StudentValidityNotice() {
  const { profile, role } = useProfile();
  const [open, setOpen] = useState(false);

  const validity = studentWindow(profile);

  useEffect(() => {
    if (role !== 'student' || !profile) return;
    try {
      if (sessionStorage.getItem(KEY) === '1') return;
    } catch {
      return;
    }
    setOpen(true);
  }, [role, profile?.id]);

  const close = () => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      // A blocked storage simply means the reminder shows again next time.
    }
    setOpen(false);
  };

  if (!validity) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
            Your student account is valid for 48 months
          </DialogTitle>
          <DialogDescription>
            You signed in with a student access key, so this account is valid for 48 months (4 years).
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            Valid until <span className="font-semibold text-foreground">{formatDay(validity.validUntil)}</span> — 48 months from
            the day you signed up with the student access key.
          </p>
          <p className="mt-1.5">
            When that date passes, the account is deleted 3 days later. Ask the lab administrator for a new access key
            if you need LabTrack Pro again after that.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={close}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}