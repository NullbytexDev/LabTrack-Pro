import React from 'react';
import { Link } from 'react-router-dom';
import { ROLE_META } from '@/lib/constants';
import { Info, ArrowRight, ShieldCheck, MessagesSquare, Bell, HeartPulse, KeyRound } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: KeyRound,
    title: 'Your sign-in',
    body: 'Email verification at sign-in, a password check before anything sensitive changes, and a device list you can sign out from. Your recovery email can prove it is you if you lose access to your sign-in mailbox.',
  },
  {
    icon: Bell,
    title: 'Your notifications',
    body: 'Report updates are addressed to you personally. Instructors decide how long notifications are kept; unread items are counted in the page button.',
  },
  {
    icon: MessagesSquare,
    title: 'Your inbox',
    body: 'Direct messages between LabTrack members. A conversation is visible only to the two people in it and to app administrators, and every reply goes back to the right person.',
  },
  {
    icon: HeartPulse,
    title: 'Your data',
    body: 'Your name, sign-in address, role, institute ID, chosen illustration and recovery email. You can change the name and illustration yourself; everything else needs your password.',
  },
];

export default function AboutAccountPanel({ role }) {
  const meta = role ? ROLE_META[role] : null;

  return (
    <div className="space-y-4">
      <div className="surface p-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <Info className="h-3.5 w-3.5" aria-hidden="true" /> About LabTrack Pro Account
        </span>
        <h2 className="mt-3 font-heading text-xl font-semibold">One account, one role, one set of permissions</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A LabTrack Pro account is your identity across every FCI computer lab. Your role decides what you can do, and
          that decision is enforced on the server — changing a button in the browser changes nothing. The app is open
          source, so the rules you rely on can be read by anyone.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/account?tab=security"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Security settings
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            About LabTrack Pro <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {meta && (
        <div className="surface glow-hover p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your role</p>
          <h3 className="mt-2 text-lg font-semibold">{meta.label}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{meta.blurb}</p>
        </div>
      )}

      <div className="surface p-5">
        <h3 className="text-sm font-semibold">What each role can do</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Students</span> browse every lab, see live status, report a
            faulty computer, follow the updates on their reports and message other members.
          </li>
          <li>
            <span className="font-medium text-foreground">Lab assistants</span> do the same, plus keep the inventory of
            their lab up to date — adding computers, editing configurations and archiving machines.
          </li>
          <li>
            <span className="font-medium text-foreground">Instructors</span> confirm repairs, manage every lab, read the
            full report inbox, decide how long notifications are kept, and read the institute history.
          </li>
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CAPABILITIES.map((item) => (
          <div key={item.title} className="surface glow-hover p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="surface p-5">
        <h3 className="text-sm font-semibold">Good to know</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>Your role is set once, when the profile is created. Signing in through another tab never upgrades it.</li>
          <li>Every status change is written to History with who did it and when.</li>
          <li>Lab layouts, history and messaging need a signed-in account; the lab directory itself is public.</li>
          <li>Moving your account to a new email moves your profile, role and history with it — nothing is left behind.</li>
        </ul>
      </div>
    </div>
  );
}