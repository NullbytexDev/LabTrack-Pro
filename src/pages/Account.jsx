// Account settings — profile, security, privacy and account information
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import AvatarArt from '@/components/auth/AvatarArt';
import ProfilePanel from '@/components/account/ProfilePanel';
import SecurityPanel from '@/components/account/SecurityPanel';
import PrivacyPanel from '@/components/account/PrivacyPanel';
import AboutAccountPanel from '@/components/account/AboutAccountPanel';
import HealthPanel from '@/components/account/HealthPanel';
import { ROLE_META } from '@/lib/constants';
import { UserCog, Lock, ShieldHalf, Info, HeartPulse } from 'lucide-react';

const TABS = [
  { key: 'profile', label: 'Edit Profile', icon: UserCog },
  { key: 'health', label: 'Account Health', icon: HeartPulse },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'privacy', label: 'Privacy', icon: ShieldHalf },
  { key: 'about', label: 'About Account', icon: Info },
];

export default function Account() {
  const { user, profile, role, loading, refresh } = useProfile();
  const [params, setParams] = useSearchParams();
  const active = TABS.some((tab) => tab.key === params.get('tab')) ? params.get('tab') : 'profile';

  if (loading) return <PageLoader label="Loading your account" />;

  return (
    <div className="relative">
      <PageTexture variant="rings" />
      <div className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Account settings</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Your LabTrack account</h1>

        <div className="surface mt-6 flex flex-wrap items-center gap-4 p-5">
          <AvatarArt role={role || 'student'} id={profile?.avatar_id || 'st-1'} className="h-14 w-14 rounded-full" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Signed in as</p>
            <p className="truncate font-heading text-lg font-semibold">
              {profile?.full_name || user?.full_name || 'No profile yet'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          {role && (
            <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {ROLE_META[role]?.label || role}
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Account sections">
          {TABS.map((tab) => {
            const selected = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setParams({ tab: tab.key })}
                className={`glow-hover inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
                  selected
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pb-4">
          {active === 'profile' && <ProfilePanel user={user} profile={profile} role={role} onUpdated={refresh} />}
          {active === 'health' && <HealthPanel user={user} profile={profile} role={role} />}
          {active === 'security' && <SecurityPanel profile={profile} onUpdated={refresh} />}
          {active === 'privacy' && <PrivacyPanel profile={profile} onUpdated={refresh} />}
          {active === 'about' && <AboutAccountPanel role={role} />}
        </div>
      </div>
    </div>
  );
}