import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/api/client';
import HistoryRow from '@/components/history/HardwareEventRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HISTORY_FILTERS } from '@/lib/constants';
import { History as HistoryIcon, Search, Loader2 } from 'lucide-react';

export default function HardwareHistory() {
  const [labs, setLabs] = useState([]);
  const [events, setEvents] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextBefore, setNextBefore] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [labId, setLabId] = useState('all');
  const [action, setAction] = useState('all');

  useEffect(() => {
    let alive = true;
    api.entities.Lab.filter({}, { sort: 'name', limit: 100 })
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

  const query = useMemo(
    () => ({
      scope: 'hardware',
      search: search.trim(),
      lab_id: labId === 'all' ? '' : labId,
      action: action === 'all' ? '' : action,
    }),
    [search, labId, action],
  );

  useEffect(() => {
    let alive = true;
    setEvents(null);
    setError('');
    const timer = window.setTimeout(async () => {
      try {
        const response = await api.functions.invoke('listHistory', { ...query, limit: 30 });
        if (!alive) return;
        setEvents(response.data?.events || []);
        setHasMore(Boolean(response.data?.hasMore));
        setNextBefore(response.data?.nextBefore || null);
      } catch (err) {
        if (!alive) return;
        setEvents([]);
        setError(err?.response?.data?.error || 'History could not be loaded right now.');
      }
    }, query.search ? 320 : 0);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const loadMore = async () => {
    if (!nextBefore) return;
    setLoadingMore(true);
    try {
      const response = await api.functions.invoke('listHistory', { ...query, limit: 30, before: nextBefore });
      setEvents((current) => [...(current || []), ...(response.data?.events || [])]);
      setHasMore(Boolean(response.data?.hasMore));
      setNextBefore(response.data?.nextBefore || null);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className="surface mt-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PC, lab or description"
            aria-label="Search hardware history"
            className="pl-9"
          />
        </div>
        <Select value={labId} onValueChange={setLabId}>
          <SelectTrigger aria-label="Filter by lab">
            <SelectValue placeholder="All labs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All labs</SelectItem>
            {labs.map((lab) => (
              <SelectItem key={lab.id} value={lab.id}>
                {lab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger aria-label="Filter by activity type">
            <SelectValue placeholder="All hardware activity" />
          </SelectTrigger>
          <SelectContent>
            {HISTORY_FILTERS.map((filter) => (
              <SelectItem key={filter.value || 'all'} value={filter.value || 'all'}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="surface mt-4 p-6">
        {events === null && (
          <div className="space-y-4" role="status" aria-live="polite">
            <span className="sr-only">Loading hardware history</span>
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="h-14 animate-pulse rounded-xl bg-secondary/70" />
            ))}
          </div>
        )}

        {events && events.length === 0 && (
          <div className="py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <HistoryIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium">
              {search || labId !== 'all' || action !== 'all'
                ? 'No hardware records match those filters'
                : 'No hardware history recorded yet'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {search || labId !== 'all' || action !== 'all'
                ? 'Try a different search term, or clear the filters to see everything.'
                : 'Reports, repairs and status changes will appear here as soon as the first one is filed.'}
            </p>
          </div>
        )}

        {events && events.length > 0 && (
          <ol className="space-y-5">
            {events.map((event) => (
              <HistoryRow key={event.id} event={event} />
            ))}
          </ol>
        )}

        {events && events.length > 0 && hasMore && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Load older hardware activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}