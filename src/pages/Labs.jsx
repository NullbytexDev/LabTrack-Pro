import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import Reveal from '@/components/common/Reveal';
import EmptyState from '@/components/common/EmptyState';
import LabIllustration from '@/components/common/LabIllustration';
import PageLoader from '@/components/common/PageLoader';
import LabCard from '@/components/labs/LabCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const CONDITION_FILTERS = [
  { value: 'all', label: 'All labs' },
  { value: 'attention', label: 'Needs attention' },
  { value: 'ready', label: 'Fully ready' },
];

export default function Labs() {
  const navigate = useNavigate();
  const { isInstructor, user } = useProfile();
  const [labs, setLabs] = useState(null);
  const [statusRows, setStatusRows] = useState([]);
  const [query, setQuery] = useState('');
  const [condition, setCondition] = useState('all');
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const labPage = await api.entities.Lab.filter({ status: 'active' }, { sort: 'name', limit: 100 });
      const grouped = await api.entities.PC.aggregate({ query: { lifecycle: 'active' }, groupBy: ['lab_id', 'status'] });
      if (grouped.truncated) throw new Error('Lab totals exceed the supported summary size.');
      if (!alive) return;
      setLabs(labPage.items);
      setStatusRows(grouped.rows);
    })().catch(() => {
      if (alive) setLabs([]);
    });
    return () => {
      alive = false;
    };
  }, []);

  const countsByLab = useMemo(() => {
    const map = {};
    statusRows.forEach((row) => {
      const entry = map[row.lab_id] || { total: 0, available: 0, minor_issue: 0, need_repair: 0, repaired: 0, revision_pending: 0, attention: 0 };
      entry.total += row.count;
      if (entry[row.status] !== undefined) entry[row.status] += row.count;
      entry.attention = entry.minor_issue + entry.need_repair + entry.revision_pending;
      map[row.lab_id] = entry;
    });
    return map;
  }, [statusRows]);

  const visibleLabs = useMemo(() => {
    if (!labs) return [];
    const term = query.trim().toLowerCase();
    return labs.filter((lab) => {
      const counts = countsByLab[lab.id] || { total: 0, available: 0, attention: 0 };
      if (condition === 'attention' && counts.attention === 0) return false;
      if (condition === 'ready' && !(counts.total > 0 && counts.available === counts.total)) return false;
      if (!term) return true;
      return [lab.name, lab.code, lab.location].filter(Boolean).some((value) => value.toLowerCase().includes(term));
    });
  }, [labs, countsByLab, query, condition]);

  const openLab = (lab) => {
    if (opening) return;
    setOpening(lab.id);
    navigate(`/layout/${lab.id}`);
  };

  return (
    <div className="relative">
      <PageTexture variant="dots" />
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Lab directory</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Every active lab, at a glance</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Each card reflects the computers currently on record. Open a lab to see its layout, individual PC status and
            what has been reported recently.
          </p>
        </header>

        {labs && labs.length > 0 && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by lab, code or location"
                aria-label="Search labs"
                className="pl-9"
              />
            </div>
            <div role="group" aria-label="Filter labs by condition" className="flex flex-wrap gap-1.5">
              {CONDITION_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setCondition(filter.value)}
                  aria-pressed={condition === filter.value}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    condition === filter.value
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {labs === null && <PageLoader label="Loading labs" />}

        {labs && labs.length === 0 && (
          <div className="mt-8">
            <EmptyState
              illustration={<LabIllustration />}
              title="No labs have been added yet"
              description="Labs appear here as soon as an instructor adds them. LabTrack Pro does not invent lab names, PC counts or reports."
              action={isInstructor ? { to: '/edit', label: 'Add the first lab' } : user ? null : { to: '/signin', label: 'Sign in as an instructor' }}
            />
          </div>
        )}

        {labs && labs.length > 0 && visibleLabs.length === 0 && (
          <div className="surface mt-8 px-6 py-12 text-center">
            <p className="text-sm font-medium">No lab matches that filter</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search term or clear the condition filter.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCondition('all');
              }}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLabs.map((lab, index) => (
            <Reveal key={lab.id} delay={index * 0.04}>
              <LabCard lab={lab} counts={countsByLab[lab.id]} opening={opening === lab.id} onOpen={openLab} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}