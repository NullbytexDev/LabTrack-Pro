import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import AvatarPicker from '@/components/auth/AvatarPicker';
import PasswordInput from '@/components/account/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import PasswordStrength from '@/components/account/PasswordStrength';
import EmailChangeSection from '@/components/account/EmailChangeSection';
import { passwordProblem } from '@/lib/passwordPolicy';
import { Loader2, ShieldQuestion } from 'lucide-react';

export default function ProfilePanel({ user, profile, role, onUpdated }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarId, setAvatarId] = useState(profile?.avatar_id || 'st-1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const saveDetails = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.functions.invoke('accountUpdate', { full_name: fullName, avatar_id: avatarId });
      window.dispatchEvent(new Event('labtrack:profile-updated'));
      toast({ title: 'Profile successfully updated.' });
      onUpdated?.();
    } catch (err) {
      const message = err?.response?.data?.error || 'Those details could not be saved.';
      setError(message);
      toast({ title: 'Profile update failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    const problem = passwordProblem(newPassword);
    if (problem) {
      setPasswordError(problem);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setChanging(true);
    try {
      await api.auth.changePassword({ userId: user.id, currentPassword, newPassword });
      toast({ title: 'Password changed', description: 'Use your new password next time you sign in.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err?.response?.data?.error || err?.message || 'Your current password could not be verified.');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={saveDetails} className="surface p-5">
        <h2 className="text-sm font-semibold">Edit profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">Change the name and illustration shown around the labs.</p>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={80} required />
          </div>

          {role && <AvatarPicker role={role} value={avatarId} onChange={setAvatarId} />}

          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : (
              'Save profile'
            )}
          </Button>
        </div>
      </form>

      <EmailChangeSection user={user} profile={profile} twoFactor={profile?.email_two_factor === true} onChanged={onUpdated} />

      <form onSubmit={changePassword} className="surface p-5">
        <h2 className="text-sm font-semibold">Change password</h2>
        <p className="mt-1 text-xs text-muted-foreground">Your current password is checked before anything changes.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current</Label>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
        </div>

        {newPassword && <PasswordStrength value={newPassword} />}
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-2 text-[11px] font-medium text-destructive">Passwords don't match.</p>
        )}

        {passwordError && (
          <p role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
            {passwordError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={changing}>
            {changing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Updating…
              </>
            ) : (
              'Update password'
            )}
          </Button>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <ShieldQuestion className="h-3.5 w-3.5" aria-hidden="true" /> Forgot password? Security check required
          </Link>
        </div>
      </form>
    </div>
  );
}