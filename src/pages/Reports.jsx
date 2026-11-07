// Reports — students and lab assistants log faults, instructors confirm repairs
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import ReportComposer from '@/components/reports/ReportComposer';
import StatusReporter from '@/components/reports/StatusReporter';
import ReportFeed from '@/components/reports/ReportFeed';
import AiTriageCard from '@/components/reports/AiTriageCard';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { ClipboardList, UserCog } from 'lucide-react';

export default function Reports() {
  const { role, profile, isInstructor, loading } = useProfile();
  const [labs, setLabs] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    api.entities.Lab
      .filter({ status: 'active' }, { sort: 'name', limit: 100 })
      .then((page) => {
        if (alive) setLabs(page.items);
      })
      .catch(() => {
        if (alive) setLabs([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const bump = () => setReload((value) => value + 1);

  return (
    <div className="relative">
      <PageTexture variant="scan" />
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Report a computer</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Reports</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Students and lab assistants report a fault in seconds. Instructors confirm when a machine is repaired or back
            in use. Every colour means the same thing everywhere in the app.
          </p>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_ORDER.map((status) => (
            <span key={status} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${STATUS_META[status].chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} aria-hidden="true" />
              {STATUS_META[status].label}
            </span>
          ))}
        </div>

        {loading && <PageLoader label="Checking your access" />}

        {!loading && !profile && (
          <div className="surface mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserCog className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Finish setting up your profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your sign-in works, but no LabTrack profile is attached yet. Choose your role once and this page opens.
                </p>
              </div>
            </div>
            <Link to="/signin" className="text-sm font-semibold text-primary hover:underline">
              Complete profile
            </Link>
          </div>
        )}

        {!loading && profile && labs && (
          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
            <div className="space-y-5">
              {isInstructor ? (
                <StatusReporter labs={labs} onSaved={bump} />
              ) : (
                <ReportComposer labs={labs} onSubmitted={bump} />
              )}
              {isInstructor && (
                <div className="surface flex items-start gap-3 p-4">
                  <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Students and lab assistants file the faults. Your two buttons here mark a computer{' '}
                    <span className="text-status-repaired">Repaired</span> or{' '}
                    <span className="text-status-available">Available</span> — every change is written to History.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-5">
              {(role === 'instructor' || role === 'lab_assistant') && <AiTriageCard />}
              <ReportFeed reloadKey={reload} labs={labs} role={role} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}