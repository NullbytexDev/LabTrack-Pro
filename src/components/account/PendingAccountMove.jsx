import { useEffect } from 'react';
import { api } from '@/api/client';
import { toast } from '@/components/ui/use-toast';

export const MOVE_KEY = 'labtrack-account-move';

/** Reads the pending account move saved when an email change or recovery was verified. */
export function readPendingMove() {
  try {
    const raw = localStorage.getItem(MOVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingMove(move) {
  localStorage.setItem(MOVE_KEY, JSON.stringify(move));
}

export function clearPendingMove() {
  localStorage.removeItem(MOVE_KEY);
}

/**
 * Finishes a verified account move: once the member is signed in with the
 * verified address, the profile, role and history are moved onto it.
 */
export default function PendingAccountMove({ user }) {
  useEffect(() => {
    const move = readPendingMove();
    if (!move || !user?.email) return;
    if (String(move.email).toLowerCase() !== String(user.email).toLowerCase()) return;

    let alive = true;
    api.functions
      .invoke('accountRecovery', { action: 'claim', token: move.token })
      .then((response) => {
        if (!alive) return;
        clearPendingMove();
        if (response.data?.moved) {
          toast({
            title: 'Account moved',
            description: `Your LabTrack profile is now attached to ${response.data.email}.`,
          });
          window.dispatchEvent(new Event('labtrack:profile-updated'));
        }
      })
      .catch((error) => {
        if (!alive) return;
        const message = error?.response?.data?.error;
        if (error?.response?.status === 404 || error?.response?.status === 400) {
          clearPendingMove();
        }
        if (message) {
          toast({ title: 'Account move', description: message, variant: 'destructive' });
        }
      });

    return () => {
      alive = false;
    };
  }, [user?.email]);

  return null;
}