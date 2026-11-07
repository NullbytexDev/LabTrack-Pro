// Edit Labs and PCs — instructor inventory tools
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BulkEditToolbar from '@/components/edit/BulkEditToolbar';
import BulkEditDialog from '@/components/edit/BulkEditDialog';
import BulkAddDialog from '@/components/edit/BulkAddDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/api/client';
import useProfile from '@/hooks/useProfile';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import PermissionDenied from '@/components/common/PermissionDenied';
import EmptyState from '@/components/common/EmptyState';
import LabIllustration from '@/components/common/LabIllustration';
import LabFormDialog from '@/components/edit/LabFormDialog';
import PcFormDialog from '@/components/edit/PcFormDialog';
import { STATUS_META, INSTRUCTOR_STATUSES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Archive, ArchiveRestore, Trash2, MonitorSmartphone } from 'lucide-react';

export default function EditLabs() {
  const { role, loading: profileLoading } = useProfile();
  // Instructors and lab assistants both maintain the inventory.
  const isStaff = role === 'instructor' || role === 'lab_assistant';
  const [labs, setLabs] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [pcs, setPcs] = useState(null);
  const [labDialog, setLabDialog] = useState({ open: false, lab: null });
  const [pcDialog, setPcDialog] = useState({ open: false, pc: null });
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedPcs, setSelectedPcs] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [pcNext, setPcNext] = useState(null);
  const [moreBusy, setMoreBusy] = useState(false);
  const activeLab = useRef(selectedId);
  activeLab.current = selectedId;

  const loadLabs = useCallback(async () => {
    const page = await api.entities.Lab.filter({}, { sort: 'name', limit: 100 });
    setLabs(page.items);
    setSelectedId((current) => {
      if (current && page.items.some((lab) => lab.id === current)) return current;
      return page.items[0]?.id || null;
    });
  }, []);

  const loadPcs = useCallback(async (labId, cursor = null) => {
    if (!labId) { setPcs([]); setPcNext(null); return; }
    const page = await api.entities.PC.filter({ lab_id: labId }, { sort: 'identifier', limit: 50, ...(cursor ? { cursor } : {}) });
    if (activeLab.current !== labId) return;
    setPcs((current) => cursor ? [...(current || []), ...page.items] : page.items);
    setPcNext(page.has_more ? page.next_cursor : null);
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    loadLabs().catch(() => setLabs([]));
  }, [isStaff, loadLabs]);

  useEffect(() => {
    if (!isStaff) return;
    setPcs(null);
    setSelectedPcs([]);
    setBulkMode(false);
    setBulkOpen(false);
    loadPcs(selectedId).catch(() => { setPcs([]); setError('Computers could not be loaded. Select the lab again to retry.'); });
  }, [isStaff, selectedId, loadPcs]);

  const selectedLab = (labs || []).find((lab) => lab.id === selectedId) || null;

  // Next free number in this lab: eight computers means the ninth is suggested.
  const suggestedIdentifier = useMemo(() => {
    if (!selectedLab) return '';
    const prefix = (selectedLab.code || 'PC').toUpperCase();
    const used = new Set((pcs || []).map((pc) => String(pc.identifier || '').toUpperCase()));
    let highest = 0;
    used.forEach((identifier) => {
      const match = identifier.match(/(\d+)$/);
      if (match) highest = Math.max(highest, Number(match[1]));
    });
    let next = highest + 1;
    let candidate = `${prefix}-PC${String(next).padStart(2, '0')}`;
    while (used.has(candidate)) {
      next += 1;
      candidate = `${prefix}-PC${String(next).padStart(2, '0')}`;
    }
    return candidate;
  }, [selectedLab, pcs]);

  const runAction = async (payload, successMessage) => {
    setBusy(true);
    setError('');
    try {
      const response = await api.functions.invoke(payload.fn, payload.body);
      toast({ title: 'Saved', description: response.data?.message || successMessage });
      await loadLabs();
      await loadPcs(selectedId);
    } catch (err) {
      const message = err?.response?.data?.error || 'That action was not allowed.';
      setError(message);
      toast({ title: 'Action blocked', description: message, variant: 'destructive' });
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const changeStatus = (pc, status) =>
    runAction({ fn: 'pcAdmin', body: { action: 'set_status', id: pc.id, status } }, `${pc.identifier} updated.`);

  // Bulk actions act on the current lab's selection and leave bulk mode afterwards.
  const runBulk = async (body, successMessage) => {
    await runAction({ fn: 'pcAdmin', body: { ...body, lab_id: selectedId } }, successMessage);
    setSelectedPcs([]);
    setBulkMode(false);
  };

  if (profileLoading) return <PageLoader label="Checking permissions" />;
  if (!isStaff) {
    return (
      <PermissionDenied
        title="Editing labs is for lab staff"
        description="Instructors and lab assistants maintain the inventory. Students can report issues from the lab layout instead."
      />
    );
  }

  return (
    <div className="relative">
      <PageTexture variant="stripes" />
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Lab staff tools</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">Edit labs and computers</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Add the institute's real labs and PCs. Archive instead of deleting when a machine leaves service — its
              reports and history stay intact.
            </p>
          </div>
          <Button onClick={() => setLabDialog({ open: true, lab: null })}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add lab
          </Button>
        </header>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[300px_1fr]">
          <section aria-label="Labs" className="surface h-fit p-4">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Labs</h2>
            {labs === null ? (
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((key) => (
                  <div key={key} className="h-14 animate-pulse rounded-xl bg-secondary/70" />
                ))}
              </div>
            ) : labs.length === 0 ? (
              <p className="mt-3 px-1 text-sm text-muted-foreground">No labs yet. Add the first one to get started.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {labs.map((lab) => (
                  <li key={lab.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(lab.id)}
                      aria-current={lab.id === selectedId ? 'true' : undefined}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                        lab.id === selectedId
                          ? 'border-primary/50 bg-primary/[0.07]'
                          : 'border-transparent hover:border-border hover:bg-secondary/60'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{lab.name}</span>
                        {lab.status === 'archived' && (
                          <Badge variant="outline" className="border-border bg-secondary text-[10px] text-muted-foreground">
                            Archived
                          </Badge>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {lab.code ? `${lab.code} · ` : ''}
                        {lab.location || 'No location'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Computers" className="surface p-5">
            {!selectedLab ? (
              <EmptyState
                illustration={<LabIllustration />}
                title="Select or add a lab"
                description="Choose a lab on the left to manage its computers, or add a new lab to get started."
                action={{ label: 'Add a lab', onClick: () => setLabDialog({ open: true, lab: null }) }}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-semibold">{selectedLab.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedLab.code ? `${selectedLab.code} · ` : ''}
                      {selectedLab.location || 'No location set'} ·{' '}
                      {selectedLab.capacity ? `${selectedLab.capacity} seats` : 'capacity not set'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setLabDialog({ open: true, lab: selectedLab })}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Edit lab
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        setConfirm({
                          title: selectedLab.status === 'archived' ? `Restore ${selectedLab.name}?` : `Archive ${selectedLab.name}?`,
                          description:
                            selectedLab.status === 'archived'
                              ? 'The lab and its computers return to the public lab list.'
                              : 'The lab and its computers are hidden from the public pages. Reports and history are preserved.',
                          confirmLabel: selectedLab.status === 'archived' ? 'Restore lab' : 'Archive lab',
                          destructive: false,
                          run: () =>
                            runAction(
                              {
                                fn: 'labAdmin',
                                body: { action: selectedLab.status === 'archived' ? 'restore' : 'archive', id: selectedLab.id },
                              },
                              'Library updated.',
                            ),
                        })
                      }
                    >
                      {selectedLab.status === 'archived' ? (
                        <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Archive className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {selectedLab.status === 'archived' ? 'Restore' : 'Archive'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={busy}
                      onClick={() =>
                        setConfirm({
                          title: `Delete ${selectedLab.name}?`,
                          description:
                            'Deletion only succeeds when the lab has no computers and no history. Archiving is the safer choice and keeps reporting intact.',
                          confirmLabel: 'Delete lab',
                          destructive: true,
                          run: () => runAction({ fn: 'labAdmin', body: { action: 'delete', id: selectedLab.id } }, 'Lab deleted.'),
                        })
                      }
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                  <h3 className="text-sm font-semibold">Computers</h3>
                  <Button size="sm" onClick={() => setPcDialog({ open: true, pc: null })} disabled={selectedLab.status === 'archived'}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Add computer
                  </Button>
                </div>

                {selectedLab.status === 'archived' && (
                  <p className="mt-2 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                    This lab is archived. Restore it to add or edit computers.
                  </p>
                )}

                {pcs?.length > 0 && (
                  <BulkEditToolbar
                    pcs={pcs}
                    selected={selectedPcs}
                    onSelect={setSelectedPcs}
                    onEdit={() => setBulkOpen(true)}
                    onAdd={() => setBulkAddOpen(true)}
                    onArchive={() =>
                      setConfirm({
                        title: `Archive ${selectedPcs.length} computers?`,
                        description: 'They are hidden from the lab layout. Their reports and history stay intact.',
                        confirmLabel: 'Archive selected',
                        destructive: false,
                        run: () =>
                          runBulk({ action: 'bulk_archive', ids: selectedPcs, lifecycle: 'archived' }, 'Computers archived.'),
                      })
                    }
                    onDelete={() =>
                      setConfirm({
                        title: `Delete ${selectedPcs.length} computers?`,
                        description:
                          'Computers are only deleted when they have no reports or history. Archive them to keep the record.',
                        confirmLabel: 'Delete selected',
                        destructive: true,
                        run: () => runBulk({ action: 'bulk_delete', ids: selectedPcs }, 'Computers deleted.'),
                      })
                    }
                    disabled={busy || selectedLab.status === 'archived'}
                    active={bulkMode}
                    onEnter={() => setBulkMode(true)}
                    onExit={() => {
                      setBulkMode(false);
                      setSelectedPcs([]);
                    }}
                  />
                )}
                {pcs === null ? (
                  <div className="mt-4 space-y-2">
                    {[0, 1, 2, 3].map((key) => (
                      <div key={key} className="h-12 animate-pulse rounded-xl bg-secondary/70" />
                    ))}
                  </div>
                ) : pcs.length === 0 ? (
                  <div className="mt-6 text-center">
                    <MonitorSmartphone className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium">No computers in this lab yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add each PC with its institute identifier.</p>
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-border/70">
                    {pcs.map((pc) => (
                      <li key={pc.id} className="flex flex-wrap items-center gap-3 py-3">
                        {bulkMode && (
                          <Checkbox aria-label={`Select ${pc.identifier}`} checked={selectedPcs.includes(pc.id)} disabled={busy || pc.lifecycle === 'archived' || selectedLab.status === 'archived' || (!selectedPcs.includes(pc.id) && selectedPcs.length >= 100)} onCheckedChange={(checked) => setSelectedPcs((current) => checked ? [...current, pc.id] : current.filter((id) => id !== pc.id))} />
                        )}
                        <span className="mono-id min-w-[96px] text-sm font-semibold">{pc.identifier}</span>
                        <span className={`h-2 w-2 rounded-full ${STATUS_META[pc.status]?.dot || 'bg-muted-foreground'}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                          {pc.label || pc.notes || 'No note'}
                        </span>
                        {pc.lifecycle === 'archived' && (
                          <Badge variant="outline" className="border-border bg-secondary text-[10px] text-muted-foreground">
                            Archived
                          </Badge>
                        )}
                        <div className="w-40">
                          <Select
                            value={pc.status}
                            onValueChange={(value) => changeStatus(pc, value)}
                            disabled={busy || pc.lifecycle === 'archived'}
                          >
                            <SelectTrigger aria-label={`Status for ${pc.identifier}`} className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INSTRUCTOR_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_META[status].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setPcDialog({ open: true, pc })} aria-label={`Edit ${pc.identifier}`}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busy}
                            aria-label={pc.lifecycle === 'archived' ? `Restore ${pc.identifier}` : `Archive ${pc.identifier}`}
                            onClick={() =>
                              setConfirm({
                                title: pc.lifecycle === 'archived' ? `Restore ${pc.identifier}?` : `Archive ${pc.identifier}?`,
                                description:
                                  pc.lifecycle === 'archived'
                                    ? 'The computer returns to the lab layout.'
                                    : 'The computer is hidden from the lab layout. Its reports and history stay intact.',
                                confirmLabel: pc.lifecycle === 'archived' ? 'Restore' : 'Archive',
                                destructive: false,
                                run: () =>
                                  runAction(
                                    {
                                      fn: 'pcAdmin',
                                      body: { action: pc.lifecycle === 'archived' ? 'restore' : 'archive', id: pc.id },
                                    },
                                    'Computer updated.',
                                  ),
                              })
                            }
                          >
                            {pc.lifecycle === 'archived' ? (
                              <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Archive className="h-4 w-4" aria-hidden="true" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={busy}
                            aria-label={`Delete ${pc.identifier}`}
                            onClick={() =>
                              setConfirm({
                                title: `Delete ${pc.identifier}?`,
                                description:
                                  'Deletion only succeeds when the computer has no reports or history. Archive it to keep the record.',
                                confirmLabel: 'Delete computer',
                                destructive: true,
                                run: () => runAction({ fn: 'pcAdmin', body: { action: 'delete', id: pc.id } }, 'Computer deleted.'),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {pcNext && <Button variant="outline" className="mt-4" disabled={moreBusy} onClick={async () => { setMoreBusy(true); try { await loadPcs(selectedId, pcNext); } catch (err) { setError(err?.message || 'More computers could not be loaded.'); } finally { setMoreBusy(false); } }}>{moreBusy ? 'Loading…' : 'Load more computers'}</Button>}
              </>
            )}
          </section>
        </div>
      </div>

      {bulkOpen && <BulkEditDialog ids={selectedPcs} labId={selectedId} labName={selectedLab?.name || 'this lab'} onClose={() => setBulkOpen(false)} onSaved={async () => { await loadPcs(selectedId); setSelectedPcs([]); setBulkMode(false); }} />}

      {bulkAddOpen && (
        <BulkAddDialog
          labId={selectedId}
          labName={selectedLab?.name || 'this lab'}
          suggestedIdentifier={suggestedIdentifier}
          onClose={() => setBulkAddOpen(false)}
          onSaved={async () => {
            await loadPcs(selectedId);
            setSelectedPcs([]);
            setBulkMode(false);
          }}
        />
      )}

      <LabFormDialog
        open={labDialog.open}
        lab={labDialog.lab}
        onOpenChange={(open) => setLabDialog({ open, lab: open ? labDialog.lab : null })}
        onSaved={(message) => {
          toast({ title: 'Saved', description: message });
          loadLabs().catch(() => {});
          loadPcs(selectedId).catch(() => {});
        }}
      />

      <PcFormDialog
        open={pcDialog.open}
        pc={pcDialog.pc}
        labId={selectedId}
        labName={selectedLab?.name || 'this lab'}
        suggestedIdentifier={suggestedIdentifier}
        onOpenChange={(open) => setPcDialog({ open, pc: open ? pcDialog.pc : null })}
        onSaved={(message) => {
          toast({ title: 'Saved', description: message });
          loadLabs().catch(() => {});
          loadPcs(selectedId).catch(() => {});
        }}
      />

      <AlertDialog open={Boolean(confirm)} onOpenChange={(open) => (!open ? setConfirm(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                confirm?.run();
              }}
              className={confirm?.destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {busy ? 'Working…' : confirm?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}