// Lab Pulse — live readiness across every FCI lab
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { entities } from '@/api/entities';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import ReadinessRing from '@/components/pulse/ReadinessRing';
import LabReadinessList from '@/components/pulse/LabReadinessList';
import StatusDonut from '@/components/pulse/StatusDonut';
import ReportTrend from '@/components/pulse/ReportTrend';
import Watchlist from '@/components/pulse/Watchlist';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Activity, MonitorCheck, Wrench, ClipboardCheck, RefreshCw } from 'lucide-react';

const STATUS_VAR = {
  available: '--status-available',
  minor_issue: '--status-minor',
  need_repair: '--status-repair',
  repaired: '--status-repaired',
  revision_pending: '--status-revision',
};

// The chart shows the dispute category alongside the four repair statuses.
const CHART_STATUSES = [...STATUS_ORDER, 'revision_pending'];

export default function LabPulse() {
  const { isInstructor, loading: profileLoading } = useProfile();
  const [labs, setLabs] = useState([]);
  const [pcs, setPcs] = useState([]);
  const [statusRows, setStatusRows] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [labPage, pcPage, grouped] = await Promise.all([
      entities.Lab.filter({ status: 'active' }, { sort: 'name', limit: 100 }),
      entities.PC.filter({ lifecycle: 'active' }, { limit: 500, fields: ['id', 'identifier', 'lab_id'] }),
      entities.PC.aggregate({ query: { lifecycle: 'active' }, groupBy: ['lab_id', 'status'] }),
    ]);
    if (grouped.truncated) throw new Error('Lab totals exceed the supported summary size.');
    setLabs(labPage.items);
    setPcs(pcPage.items);
    setStatusRows(grouped.rows);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await load();
      } catch {
        if (alive) setError('Lab data could not be loaded. Refresh to try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  useEffect(() => {
    if (!isInstructor) return undefined;
    let alive = true;
    entities.IssueReport.filter({}, { sort: '-created_date', limit: 200 })
      .then((page) => {
        if (alive) setReports(page.items);
      })
      .catch(() => {
        if (alive) setReports([]);
      });
    return () => {
      alive = false;
    };
  }, [isInstructor]);

  const stats = useMemo(() => {
    const counts = { available: 0, minor_issue: 0, need_repair: 0, repaired: 0, revision_pending: 0 };
    statusRows.forEach((row) => {
      if (counts[row.status] !== undefined) counts[row.status] += row.count;
    });
    const total = statusRows.reduce((sum, row) => sum + row.count, 0);
    return {
      ...counts,
      total,
      ready: counts.available,
      attention: counts.minor_issue + counts.need_repair + counts.revision_pending,
      readiness: total ? Math.round((counts.available / total) * 100) : 0,
    };
  }, [statusRows]);

  const perLab = useMemo(
    () =>
      labs
        .map((lab) => {
          const own = statusRows.filter((row) => row.lab_id === lab.id);
          const total = own.reduce((sum, row) => sum + row.count, 0);
          const ready = own.find((row) => row.status === 'available')?.count || 0;
          const attention = own.filter((row) => ['minor_issue', 'need_repair', 'revision_pending'].includes(row.status)).reduce((sum, row) => sum + row.count, 0);
          return {
            ...lab,
            total,
            ready,
            attention,
            rate: total ? Math.round((ready / total) * 100) : 0,
          };
        })
        .sort((a, b) => a.rate - b.rate),
    [labs, statusRows]
  );

  const statusData = useMemo(
    () =>
      CHART_STATUSES.map((key) => ({
        key,
        name: STATUS_META[key].label,
        value: stats[key] || 0,
        color: `hsl(var(${STATUS_VAR[key]}))`,
      })).filter((slice) => slice.value > 0),
    [stats]
  );

  const openReports = reports.filter((report) => report.status === 'open' || report.status === 'in_review').length;

  const refresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      await load();
    } catch {
      setError('Lab data could not be loaded. Refresh to try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (profileLoading || loading) return <PageLoader label="Reading the labs" />;

  const kpis = [
    { icon: MonitorCheck, label: 'Ready to use', value: stats.ready, sub: `of ${stats.total} computers` },
    { icon: Wrench, label: 'Need attention', value: stats.attention, sub: 'faults, repairs and pending revisions' },
    { icon: Activity, label: 'Labs tracked', value: perLab.length, sub: 'active this term' },
    ...(isInstructor
      ? [{ icon: ClipboardCheck, label: 'Open reports', value: openReports, sub: 'awaiting a decision' }]
      : []),
  ];

  return (
    <div className="relative">
      <PageTexture variant="aurora" />
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <span className="glass-chip">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live lab pulse
          </span>
          <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
            Every lab, <span className="gradient-text">one heartbeat.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Readiness across the labs on record, the condition of every computer, and the faults that keep coming back.
            Use Refresh to load the latest totals.
          </p>
        </header>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.08] px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-7 grid gap-4 lg:grid-cols-[300px_1fr]">
          <section className="surface flex flex-col items-center justify-center p-5">
            <ReadinessRing value={stats.readiness} ready={stats.ready} total={stats.total} />
            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </button>
              <span>{perLab.length} labs · {stats.total} computers</span>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            {kpis.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="surface flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-2xl font-semibold tabular-nums">{value}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LabReadinessList labs={perLab} />
          </div>
          <StatusDonut data={statusData} total={stats.total} />
        </div>

        {isInstructor ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ReportTrend reports={reports} />
            <Watchlist reports={reports} pcs={pcs} />
          </div>
        ) : (
          <section className="surface mt-4 flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold">Sitting at a faulty computer?</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Open its lab and report the fault in two fields — the repair queue updates the moment you send it.
              </p>
            </div>
            <Button asChild className="w-fit shrink-0">
              <Link to="/labs">Open the labs</Link>
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}