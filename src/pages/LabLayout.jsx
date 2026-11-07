// Lab Layout — public per-lab PC layout
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '@/api/client';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import EmptyState from '@/components/common/EmptyState';
import LabIllustration from '@/components/common/LabIllustration';
import LabSwitcher from '@/components/labs/LabSwitcher';
import PcTile from '@/components/labs/PcTile';
import PcDetailPanel from '@/components/labs/PcDetailPanel';
import ReportDialog from '@/components/labs/ReportDialog';
import SignInRequired from '@/components/common/SignInRequired';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { LayoutGrid } from 'lucide-react';

export default function LabLayout() {
  const { labId } = useParams();
  const reduce = useReducedMotion();
  const { user, role, isInstructor, loading: profileLoading } = useProfile();
  // A signed-out visitor sees the lab list, never the contents of one lab.
  const restricted = Boolean(labId) && !profileLoading && !user;

  const [labs, setLabs] = useState(null);
  const [allPcs, setAllPcs] = useState([]);
  const [lab, setLab] = useState(null);
  const [pcs, setPcs] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reportPc, setReportPc] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [reload, setReload] = useState(0);
  const detailRef = useRef(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.entities.Lab.filter({ status: 'active' }, { sort: 'name', limit: 100 }),
      api.entities.PC.filter({ lifecycle: 'active' }, { limit: 500 }),
    ])
      .then(([labPage, pcPage]) => {
        if (!alive) return;
        setLabs(labPage.items);
        setAllPcs(pcPage.items);
      })
      .catch(() => {
        if (alive) setLabs([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setPcs(null);
    setSelected(null);
    setNotFound(false);
    setLab(null);
    if (!labId || profileLoading) return () => { alive = false; };
    if (!user) return () => { alive = false; };

    (async () => {
      const record = await api.entities.Lab.get(labId).catch((error) => (error.status === 404 ? null : Promise.reject(error)));
      if (!alive) return;
      if (!record) {
        setNotFound(true);
        setPcs([]);
        return;
      }
      setLab(record);
      const pcPage = await api.entities.PC.filter({ lab_id: labId, lifecycle: 'active' }, { sort: 'identifier', limit: 200 });
      if (alive) setPcs(pcPage.items);
    })().catch(() => {
      if (alive) {
        setNotFound(true);
        setPcs([]);
      }
    });

    return () => {
      alive = false;
    };
  }, [labId, reload, user, profileLoading]);

  const counts = useMemo(() => {
    const base = { total: 0, available: 0, minor_issue: 0, need_repair: 0, repaired: 0, revision_pending: 0 };
    (pcs || []).forEach((pc) => {
      base.total += 1;
      if (base[pc.status] !== undefined) base[pc.status] += 1;
    });
    return base;
  }, [pcs]);

  const labCounts = useMemo(() => {
    const map = {};
    allPcs.forEach((pc) => {
      const entry = map[pc.lab_id] || { total: 0, available: 0, attention: 0 };
      entry.total += 1;
      if (pc.status === 'available') entry.available += 1;
      else entry.attention += 1;
      map[pc.lab_id] = entry;
    });
    return map;
  }, [allPcs]);

  const handleSelect = (pc) => {
    setSelected(pc);
    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      }, 80);
    }
  };

  return (
    <div className="relative">
      <PageTexture variant="blueprint" />
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Lab layout</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
            {lab?.name || 'Pick a lab, see every computer in it'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {lab?.location ? `${lab.location} · ` : ''}
            {lab?.description || 'Each lab has its own page of computers. Choose one below.'}
          </p>
        </header>

        <div className="mt-6">
          {labs === null && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((key) => <div key={key} className="h-[76px] animate-pulse rounded-2xl bg-secondary/70" />)}</div>}
          {labs && labs.length === 0 && (
            <EmptyState
              illustration={<LabIllustration />}
              title="No labs to lay out yet"
              description="Once an instructor adds labs and computers, each lab gets a button here with every PC inside it."
              action={isInstructor ? { to: '/edit', label: 'Add a lab and PCs' } : null}
            />
          )}
          {labs && labs.length > 0 && <LabSwitcher labs={labs} activeId={labId} counts={labCounts} />}
        </div>

        {!labId && labs && labs.length > 0 && (
          <div className="surface mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LayoutGrid className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Choose a lab to open its layout</h2>
                <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  The lab buttons above replace the old duplicate list — one click shows that lab's computers, their
                  condition and what has been reported.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((status) => (
                <span key={status} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${STATUS_META[status].chip}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} aria-hidden="true" />
                  {STATUS_META[status].label}
                </span>
              ))}
            </div>
          </div>
        )}

        {labId && restricted && (
          <div className="mt-6">
            <SignInRequired
              title="Sign-in required to open this lab"
              description="The layout, computer statuses and repair history of an individual lab are only shown to signed-in LabTrack members. Sign in with your FCI account to open it."
            />
          </div>
        )}

        {labId && !restricted && (
          <>
            {notFound ? (
              <div className="mt-8">
                <EmptyState
                  illustration={<LabIllustration />}
                  title="That lab could not be found"
                  description="It may have been archived or removed. Choose another lab from the buttons above."
                  action={{ to: '/layout', label: 'Back to all labs' }}
                />
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-2">
                  {pcs && [...STATUS_ORDER, 'revision_pending'].map((status) => (
                    <span key={status} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${STATUS_META[status].chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} aria-hidden="true" />
                      <span className="font-semibold tabular-nums">{counts[status]}</span>
                      {STATUS_META[status].label}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
                  <div>
                    {pcs === null && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                        {[...Array(8)].map((_, index) => (
                          <div key={index} className="h-[86px] animate-pulse rounded-2xl bg-secondary/70" />
                        ))}
                      </div>
                    )}

                    {pcs && pcs.length === 0 && (
                      <EmptyState
                        illustration={<LabIllustration />}
                        title="No computers in this lab yet"
                        description="This lab exists but no PCs have been added to it. An instructor can add them from Edit Labs and PCs."
                        action={isInstructor ? { to: '/edit', label: 'Add computers' } : null}
                      />
                    )}

                    {pcs && pcs.length > 0 && (
                      <motion.div
                        className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6"
                        aria-label={`Computers in ${lab?.name || 'lab'}`}
                      >
                        {pcs.map((pc) => (
                          <PcTile key={pc.id} pc={pc} selected={selected?.id === pc.id} onSelect={handleSelect} />
                        ))}
                      </motion.div>
                    )}

                    <p className="mt-4 text-xs text-muted-foreground">
                      Identifiers follow the institute convention (for example L1-PC01) and are unique inside each lab.
                    </p>
                  </div>

                  <div ref={detailRef}>
                    <PcDetailPanel
                      pc={selected}
                      labName={lab?.name || ''}
                      role={role}
                      signedIn={Boolean(user)}
                      onReport={(pc) => setReportPc(pc)}
                      onClose={() => setSelected(null)}
                      refreshKey={reload}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {reportPc && (
        <ReportDialog
          pc={reportPc}
          open={Boolean(reportPc)}
          onOpenChange={(open) => {
            if (!open) setReportPc(null);
          }}
          onSubmitted={() => {
            setReload((value) => value + 1);
            setReportPc(null);
          }}
        />
      )}
    </div>
  );
}