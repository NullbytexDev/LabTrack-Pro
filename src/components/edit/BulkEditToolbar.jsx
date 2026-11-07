import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ListChecks, X, Plus, Archive, Trash2, Pencil } from 'lucide-react';

/**
 * Bulk edit is a mode: the selection circles only exist while it is on, so the
 * normal computer list stays clean. Adding several computers at once is always
 * available.
 */
export default function BulkEditToolbar({ pcs, selected, onSelect, onEdit, onAdd, onArchive, onDelete, disabled, active, onEnter, onExit }) {
  const eligible = pcs.filter((pc) => pc.lifecycle !== 'archived');
  const shown = eligible.slice(0, 100);
  const all = shown.length > 0 && shown.every((pc) => selected.includes(pc.id));

  if (!active) {
    return (
      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-secondary/20 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ListChecks className="h-4 w-4" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold">Bulk actions</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Select computers to update together, or add several at once.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={disabled || !eligible.length} onClick={onEnter}><ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Bulk edit computers</Button>
          <Button size="sm" variant="outline" disabled={disabled} onClick={onAdd}><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add computers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-primary/[0.05] px-4 py-3">
        <div className="flex items-center gap-3">
          <Checkbox id="bulk-select-all" checked={all ? true : selected.length ? 'indeterminate' : false} disabled={disabled || !shown.length} onCheckedChange={(checked) => onSelect(checked ? shown.map((pc) => pc.id) : [])} />
          <div>
            <label htmlFor="bulk-select-all" className="cursor-pointer text-sm font-semibold">Select shown PCs</label>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Up to 100 active computers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span aria-live="polite" aria-atomic="true" className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary">{selected.length} selected</span>
          <Button size="sm" variant="ghost" disabled={disabled} onClick={onExit}><X className="h-3.5 w-3.5" aria-hidden="true" /> Done</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border/70 px-4 py-3">
        <Button size="sm" disabled={disabled || !selected.length} onClick={onEdit}><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit Selected</Button>
        <Button size="sm" variant="outline" disabled={disabled || !selected.length} onClick={onArchive}><Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive</Button>
        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={disabled || !selected.length} onClick={onDelete}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete</Button>
        {selected.length > 0 && <button type="button" disabled={disabled} className="px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50" onClick={() => onSelect([])}>Clear selection</button>}
        <Button size="sm" variant="outline" className="sm:ml-auto" disabled={disabled} onClick={onAdd}><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add computers</Button>
      </div>
    </div>
  );
}