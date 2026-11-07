// About — what LabTrack Pro is, what it does, and that it is open source
import React from 'react';
import { Link } from 'react-router-dom';
import PageTexture from '@/components/common/PageTexture';
import Reveal from '@/components/common/Reveal';
import { LogoMark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import {
  MonitorCheck,
  ClipboardList,
  History as HistoryIcon,
  ArrowRight,
  Activity,
  Bell,
  MessagesSquare,
  ShieldCheck,
  LayoutGrid,
  Wrench,
  Github,
  GitFork,
  Lock,
} from 'lucide-react';
import CreditArt from '@/components/about/CreditArt';
import CopyrightNotice from '@/components/layout/CopyrightNotice';

const REPO_URL = 'https://github.com/NullbytexDev/LabTrack-Pro';

// Delegate external opening to the browser, never navigate the embedded app.
// A noopener window can return null even when it opened successfully.
function openRepo(event) {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.open(REPO_URL, '_blank', 'noopener,noreferrer');
}

const PRINCIPLES = [
  {
    icon: MonitorCheck,
    title: 'One shared truth',
    body: 'A status is either accurate or it is not. LabTrack Pro keeps a single record of every computer so nobody has to ask around.',
  },
  {
    icon: ClipboardList,
    title: 'Reporting that takes seconds',
    body: 'A student sitting at a broken PC is the fastest sensor a lab has. Two fields turn that observation into an actionable report.',
  },
  {
    icon: HistoryIcon,
    title: 'History over memory',
    body: 'When a machine keeps failing, the pattern is in the record, not in someone\'s memory of last semester.',
  },
];

const FEATURES = [
  { icon: LayoutGrid, title: 'Live lab layout', body: 'Every lab on its own page: each computer, its condition, and the hardware it runs on.' },
  { icon: Wrench, title: 'Fault reporting', body: 'Students and lab assistants report a fault in seconds; staff review, repair or ask for a revision.' },
  { icon: Activity, title: 'Lab Pulse', body: 'Readiness, status mix and report trends for the whole institute, computed on the server.' },
  { icon: Bell, title: 'Notifications', body: 'Report updates reach the person who filed them, with instructor-controlled retention.' },
  { icon: MessagesSquare, title: 'Member inbox', body: 'Direct messages between members, with replies and read state kept private to the two people involved.' },
  { icon: HistoryIcon, title: 'Full history', body: 'Every status change, repair and inventory edit is written down with who did it and when.' },
  { icon: ShieldCheck, title: 'Account security', body: 'Email verification at sign-in, password checks before sensitive changes, and a device list you can sign out from.' },
  { icon: Lock, title: 'Role-based access', body: 'Students report, lab assistants maintain, instructors decide — enforced on the server, not by hiding buttons.' },
];

export default function About() {
  return (
    <div className="relative">
      <PageTexture variant="blobs" />
      <div className="mx-auto w-full max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            About LabTrack Pro
          </span>
          <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Built for the quiet work of keeping a lab <span className="gradient-text">ready for the next class.</span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Computer labs fail in small ways: a dead monitor, a machine that will not boot, a keyboard that only half
            works. Individually they are minor. Together, and undocumented, they quietly erode teaching time. LabTrack Pro
            makes those small failures visible, assignable, and — most importantly — remembered. It is the lab workspace
            for the FCI computer labs, and it is open source.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/layout">
                Open a lab layout <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <div className="surface h-full p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="whats-inside">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">What is inside</p>
              <h2 id="whats-inside" className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">
                Everything a lab needs, in one place
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
              All of it backed by server-side permissions: the browser never decides who may change what.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="surface glow-hover h-full p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ink-panel relative mt-12 overflow-hidden rounded-[28px] px-6 py-10 sm:px-10">
          <div aria-hidden="true" className="tex-blueprint pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">A big shout-out to</p>
              <h2 className="mt-3 font-heading text-4xl font-semibold leading-none text-white sm:text-5xl">
                <span className="gradient-text">Nullbytex</span>
              </h2>
              <CopyrightNotice className="mt-3 text-xs text-muted-foreground" />
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
                Huge thanks to Nullbytex for the interface, the engineering and every illustration in LabTrack Pro. The
                care shows in the small things: a layout that reads at a glance, a report form a student can finish
                between classes, and a history that never loses a detail.
              </p>
              <div className="mt-5 flex items-center gap-3 text-xs text-white/55">
                <LogoMark className="h-8 w-8" />
                <span>Interface, illustration and engineering by Nullbytex</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <CreditArt />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="open-source"
          className="ink-panel relative mt-10 overflow-hidden rounded-[28px] px-6 py-10 sm:px-10"
        >
          <div aria-hidden="true" className="tex-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" /> Open source
            </span>
            <h2 id="open-source" className="mt-4 max-w-2xl font-heading text-2xl font-semibold text-white sm:text-3xl">
              LabTrack Pro is open source — published for audit and review.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Every screen you are using is public code. The whole application — the lab inventory, the reporting flow,
              the notifications, the inbox, the account security — lives in a GitHub repository you can read. Nothing is
              hidden behind a black box: anyone can verify what the app really does with lab data.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              The repository is provided solely for auditing and reviewing the code — not for making improvements,
              testing, or other purposes. If you find any issues, you can report them on GitHub.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href={REPO_URL} onClick={openRepo} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" aria-hidden="true" /> Go to the GitHub repository
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="surface p-6">
            <h2 className="text-base font-semibold">What it deliberately does not do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>It does not invent labs, computers, people or reports. The app starts empty until an instructor adds real data.</li>
              <li>It does not let students change official records — permissions are enforced by the server.</li>
              <li>It does not keep notifications forever. Retention is an instructor decision, applied by a server job.</li>
              <li>It does not send lab data anywhere else: no third-party trackers, no advertising identifiers.</li>
            </ul>
          </div>
          <div className="surface flex flex-col justify-between p-6">
            <div>
              <h2 className="text-base font-semibold">FCI · Computer Labs</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                LabTrack Pro is the lab management workspace for the FCI computer labs. Lab names, PC identifiers and
                reporting roles follow the institute's own conventions.
              </p>
            </div>
            <Button asChild className="mt-5 w-fit">
              <Link to="/labs">
                Browse the labs <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}