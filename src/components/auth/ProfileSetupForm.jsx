import React, { useState } from 'react';
import { Loader2, User, Hash, KeyRound } from 'lucide-react';
import { api } from '@/api/apiClient';
import PageTexture from '@/components/common/PageTexture';
import RoleTabs from '@/components/auth/RoleTabs';
import AvatarPicker from '@/components/auth/AvatarPicker';
import UsageChoice from '@/components/auth/UsageChoice';
import { REF_FIELD } from '@/components/auth/RegisterFields';
import { avatarOptions } from '@/components/auth/AvatarArt';
import { ROLE_META } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/]{2,23}$/;

function readError(error, fallback) {
  return error?.response?.data?.error || error?.data?.error || error?.message || fallback;
}

export default function ProfileSetupForm({ user }) {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    roll_number: '',
    assistant_id: '',
    instructor_id: '',
    access_code: '',
    avatar_id: avatarOptions('student')[0].id,
  });
  const [usage, setUsage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refKey = REF_FIELD[role];
  const meta = ROLE_META[role];

  const changeRole = (nextRole) => {
    setForm((current) => ({ ...current, avatar_id: avatarOptions(nextRole)[0].id }));
    setRole(nextRole);
    setError('');
  };

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.full_name.trim().length < 2) return setError('Enter your full name.');
    if (!ID_PATTERN.test(form[refKey].trim())) return setError(`Enter a valid ${meta.referenceLabel.toLowerCase()}.`);
    if (form.access_code.trim().length < 4) return setError(`Enter the ${meta.label.toLowerCase()} access key.`);

    setLoading(true);
    try {
      await api.functions.invoke('completeProfile', {
        full_name: form.full_name.trim(),
        email: user.email,
        role,
        avatar_id: form.avatar_id,
        [refKey]: form[refKey].trim(),
        access_code: form.access_code.trim(),
        tracking_opt_out: !usage,
      });
      window.location.href = '/';
    } catch (err) {
      setError(readError(err, 'We could not finish setting up your profile.'));
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center px-4 py-12">
      <PageTexture variant="aurora" />
      <form onSubmit={submit} className="surface relative w-full max-w-2xl space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="font-heading text-xl font-semibold">Finish setting up your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You are signed in as <span className="font-medium text-foreground">{user?.email}</span>. Tell us who you are
            and enter your access key to activate LabTrack Pro.
          </p>
        </div>

        <RoleTabs value={role} onChange={changeRole} />

        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="full_name" className="pl-10" autoComplete="name" value={form.full_name} onChange={set('full_name')} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={refKey}>{meta.referenceLabel}</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id={refKey} className="pl-10" value={form[refKey]} onChange={set(refKey)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="access_code">{meta.label} access key</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="access_code" type="password" className="pl-10" autoComplete="off" value={form.access_code} onChange={set('access_code')} required />
          </div>
        </div>

        <AvatarPicker role={role} value={form.avatar_id} onChange={(avatar_id) => setForm((current) => ({ ...current, avatar_id }))} />
        <UsageChoice checked={usage} onChange={() => setUsage((current) => !current)} disabled={loading} />

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Activating…
            </>
          ) : (
            'Activate my account'
          )}
        </Button>
      </form>
    </div>
  );
}