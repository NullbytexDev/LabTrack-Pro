import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import UsageSwitch from '@/components/account/UsageSwitch';
import { setTrackingPreference } from '@/lib/tracking';
import { ShieldHalf, Loader2 } from 'lucide-react';

const SECTIONS = [
  {
    title: 'What we store',
    body: 'Your name, sign-in email, role, roll number or staff ID, the illustration you picked, and the reports and status changes you submit. Nothing else — no location, no contacts, no advertising identifiers.',
  },
  {
    title: 'Who can see it',
    body: 'The lab directory is public; individual layouts and history require sign-in in the interface. Reports carry your name and role for lab staff. Messages can be read by their sender, recipient and app administrators. Private profile details, including email addresses, can be read by their owner and app administrators.',
  },
  {
    title: 'How long it stays',
    body: 'Reports and history stay for lab record keeping. Notifications use the instructor-selected retention window; direct messages are separate and do not automatically expire. Archiving a computer preserves its reports and repair history.',
  },
  {
    title: 'When an account goes quiet',
    body: 'A sign-in session ends on its own after 14 days without use. After 15 months without activity we email a warning; after 18 months the account is deleted and a final email explains why. A student account stays valid for 48 months and is deleted 3 days after that.',
  },
  {
    title: 'What we never do',
    body: 'We do not sell data, run third-party trackers on lab pages, or share reports outside the institute. Passwords are handled by the account service and never stored in this app\u2019s database.',
  },
  {
    title: 'Your choices',
    body: 'You can change your name and illustration at any time, change your password, add a recovery email, and switch Send Usage Statistics on or off. Ask an instructor to correct a wrong report on your record.',
  },
];

/** Privacy settings: what the app keeps, and the switch for usage statistics. */
export default function PrivacyPanel({ profile, onUpdated }) {
  const [sending, setSending] = useState(profile?.tracking_opt_out !== true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSending(profile?.tracking_opt_out !== true);
  }, [profile?.tracking_opt_out]);

  const save = async (enabled) => {
    setSaving(true);
    setError('');
    try {
      await api.functions.invoke('accountUpdate', { tracking_opt_out: !enabled });
      setSending(enabled);
      setTrackingPreference(!enabled);
      setMessage(
        enabled
          ? 'Usage statistics are on. Thank you — it shows which parts of the app are used.'
          : 'Usage statistics are off. Nothing more is sent from this device.',
      );
      window.dispatchEvent(new Event('labtrack:profile-updated'));
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'That preference could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="surface p-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <ShieldHalf className="h-3.5 w-3.5" aria-hidden="true" /> Privacy
        </span>
        <h2 className="mt-3 font-heading text-xl font-semibold">How LabTrack Pro handles your data</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Lab tracking only works if people trust it. This page explains, in plain language, what the app keeps and who
          can read it.
        </p>
      </div>

      <section className="surface p-5" aria-label="Send Usage Statistics">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">Send Usage Statistics</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Anonymous events about how the app is used — such as which pages are opened. It never includes your
              reports, messages, name or email. Switching it off changes nothing about how the app works for you.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
            <UsageSwitch checked={sending} disabled={saving} onChange={save} />
          </div>
        </div>
        <p className="mt-3 text-xs font-medium leading-relaxed text-muted-foreground">
          {sending ? 'Send Usage Statistics is on' : 'Send Usage Statistics is off'}
        </p>
        {message && (
          <p role="status" className="mt-2 rounded-lg border border-primary/25 bg-primary/[0.07] px-3 py-2 text-xs text-primary">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </section>

      {SECTIONS.map((section) => (
        <div key={section.title} className="surface glow-hover p-5">
          <h3 className="text-sm font-semibold">{section.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
        </div>
      ))}
    </div>
  );
}