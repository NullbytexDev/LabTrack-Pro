import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { entities } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import Reveal from '@/components/common/Reveal';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';
import LabIllustration from '@/components/common/LabIllustration';
import LabSnapshotArt from '@/components/overview/LabSnapshotArt';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorCheck, Wrench, Building2, ArrowRight, ClipboardList, History as HistoryIcon, ShieldCheck, AlertTriangle, RotateCcw, BadgeCheck } from 'lucide-react';

const STEPS = [
  {
    icon: MonitorCheck,
    title: 'Every PC has a live status',
    body: 'Available, minor issue, need repair or repaired — updated the moment an instructor changes it.',
  },
  {
    icon: ClipboardList,
    title: 'Reports reach the instructor',
    body: 'Students and lab assistants report a fault in seconds. Instructors review and resolve it in one place.',
  },
  {
    icon: HistoryIcon,
    title: 'History that never drifts',
    body: 'Every status change records who did it and when, so maintenance decisions stay grounded in facts.',
  },
];

export default function Overview() {
  const { isAuthenticated } = useAuth();
  const { isInstructor } = useProfile();
  const [metrics, setMetrics] = useState(null);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [labs, total, available, attention, minor, revisions, repaired] = await Promise.all([
          entities.Lab.count({ status: 'active' }),
          entities.PC.count({ lifecycle: 'active' }),
          entities.PC.count({ lifecycle: 'active', status: 'available' }),
          entities.PC.count({ lifecycle: 'active', status: { $in: ['minor_issue', 'need_repair', 'revision_pending'] } }),
          entities.PC.count({ lifecycle: 'active', status: 'minor_issue' }),
          entities.PC.count({ lifecycle: 'active', status: 'revision_pending' }),
          entities.PC.count({ lifecycle: 'active', status: 'repaired' }),
        ]);
        if (alive) setMetrics({ labs, total, available, attention, minor, revisions, repaired });
      } catch {
        if (alive) {
          setMetrics(null);
          setFailed(true);
        }
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const emptyAction = isInstructor
    ? { to: '/edit', label: 'Set up your first lab' }
    : isAuthenticated
      ? null
      : { to: '/signin', label: 'Sign in as an instructor' };

  return (
    <div className="relative">
      <PageTexture variant="mesh" />

      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                FCI · Computer Labs
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
                Keep every lab computer <span className="gradient-text">working, or know why not.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                LabTrack Pro gives FCI a shared, reliable picture of its computer labs: which PCs are ready, which ones
                students have reported, and what instructors did about it. No spreadsheets, no guessing.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate('/labs')}>
                  Explore the labs
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate(isAuthenticated ? '/labs' : '/signin')}>
                  Report an issue
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-status-available" aria-hidden="true" />
                Reporting needs a verified student, lab assistant or instructor account.
              </p>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                The frontend source code is published for auditing purposes only. LabTrack Pro is not open source: the
                code may not be modified, copied or redistributed.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:pl-4">
            <div className="rounded-[28px] border border-border/70 bg-card/70 p-3 shadow-[0_40px_80px_-60px_rgba(11,16,32,0.9)] backdrop-blur-sm">
              <LabSnapshotArt />
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-label="Lab summary" className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Building2} label="Labs" value={metrics ? metrics.labs : '—'} hint="Active labs on record" />
          <StatCard icon={Monitor} label="Total PCs" value={metrics ? metrics.total : '—'} hint="Across every active lab" />
          <StatCard icon={MonitorCheck} label="Available" value={metrics ? metrics.available : '—'} hint="Ready for students" tone="text-status-available" />
          <StatCard
            icon={Wrench}
            label="Needs attention"
            value={metrics ? metrics.attention : '—'}
            hint="Minor issues and repairs"
            tone="text-status-repair"
          />
          <StatCard
            icon={AlertTriangle}
            label="Minor issue"
            value={metrics ? metrics.minor : '—'}
            hint="Usable, with a small fault"
            tone="text-status-minor"
          />
          <StatCard
            icon={RotateCcw}
            label="Revision"
            value={metrics ? metrics.revisions : '—'}
            hint="Fault returned after a repair"
            tone="text-status-revision"
          />
          <StatCard
            icon={BadgeCheck}
            label="Repaired"
            value={metrics ? metrics.repaired : '—'}
            hint="Fixed, ready to hand back"
            tone="text-status-repaired"
          />
        </div>
        {failed && <p className="mt-3 text-xs text-destructive">Live lab totals could not be loaded. Refresh the page to try again.</p>}
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {!failed && metrics && metrics.labs === 0 ? (
          <EmptyState
            illustration={<LabIllustration />}
            title="No labs have been added yet"
            description="LabTrack Pro starts empty on purpose — it never invents labs, computers or reports. An instructor signs in and adds the institute's real labs and PCs, and this page fills with live status."
            action={emptyAction}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.06}>
                <div className="surface h-full p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="ink-panel relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-10">
          <div aria-hidden="true" className="tex-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold text-white">See a lab before you walk into it.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Open any lab to see its computers as a live layout, then check the repair history of the exact PC you are
                about to use.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/labs">Browse labs</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10">
                <Link to="/layout">Open lab layout</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}