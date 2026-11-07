import React, { useState } from 'react';
import { api } from '@/api/client';
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
import { LogOut } from 'lucide-react';
import { getSessionId, resetSessionRecord } from '@/lib/signInSession';
import { clearPasses } from '@/lib/twoFactorPass';

export default function LogoutDialog({ open, onOpenChange }) {
  const [working, setWorking] = useState(false);

  const handleLogout = async () => {
    setWorking(true);
    // End this device's session so it leaves the account's sign-in log too.
    try {
      const response = await api.functions.invoke('signInEvents', { action: 'sessions', session_id: getSessionId() });
      const current = (response.data?.sessions || []).find((session) => session.current);
      if (current) await api.functions.invoke('signInEvents', { action: 'sign_out', id: current.id });
    } catch {
      // Logging out must still work if the session list cannot be read.
    }
    clearPasses();
    resetSessionRecord();
    await api.auth.logout(`${window.location.origin}/`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-primary" aria-hidden="true" />
            Log out of LabTrack Pro?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You will need your email and password to sign back in. Any unsaved work on this screen is discarded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={working} className="bg-destructive hover:bg-destructive/90">
            {working ? 'Logging out…' : 'Log out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}