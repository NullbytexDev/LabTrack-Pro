import React, { useMemo, useState } from 'react';
import { api } from '@/api/apiClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PcConfigFields, { EMPTY_CONFIG, OS_OPTIONS } from '@/components/edit/PcConfigFields';
import { toast } from '@/components/ui/use-toast';

/** Numbered on from the starting identifier, e.g. L4-PC09 → L4-PC09, L4-PC10, … */
function previewIdentifiers(start, count) {
  const base = String(start || '').trim().toUpperCase();
  const match = base.match(/^(.*?)(\d+)$/);
  if (!match) return [];
  const prefix = match[1];
  const first = Number(match[2]);
  const width = match[2].length;
  return Array.from({ length: Math.max(0, Math.min(Number(count) || 0, 24)) }, (_, index) =>
    `${prefix}${String(first + index).padStart(width, '0')}`,
  );
}

export default function BulkAddDialog({ labId, labName, suggestedIdentifier, onClose, onSaved }) {
  const [count, setCount] = useState('4');
  const [identifier, setIdentifier] = useState(suggestedIdentifier || '');
  const [status, setStatus] = useState('available');
  const [configuration, setConfiguration] = useState({ ...EMPTY_CONFIG });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const preview = useMemo(() => previewIdentifiers(identifier, count), [identifier, count]);

  const setConfig = (key, next) => setConfiguration((current) => ({ ...current, [key]: next }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('pcAdmin', {
        action: 'bulk_create',
        lab_id: labId,
        count: Number(count),
        identifier,
        status,
        configuration,
      });
      await onSaved();
      toast({ title: 'Computers added', description: data.message });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Those computers could not be added.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add computers to {labName}</DialogTitle>
          <DialogDescription>
            Identifiers are numbered on from the one you start with, skipping any that already exist.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="bulk-count">How many</Label>
            <Input
              id="bulk-count"
              type="number"
              min="1"
              max="24"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bulk-start">Starting identifier</Label>
            <Input
              id="bulk-start"
              value={identifier}
              maxLength={20}
              onChange={(event) => setIdentifier(event.target.value.toUpperCase())}
              placeholder="L1-PC01"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bulk-add-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="bulk-add-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="repaired">Repaired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {preview.length > 0 && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Will add: <span className="mono-id text-foreground">{preview.join(', ')}</span>
          </p>
        )}

        <div className="space-y-2 border-t border-border/70 pt-4">
          <p className="text-sm font-medium">Hardware configuration</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Applied to every computer added. Leave a field as <span className="font-medium text-foreground">Not set</span> to skip it.
          </p>
        </div>
        <PcConfigFields value={configuration} onChange={setConfig} disabled={busy} />

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button disabled={busy || preview.length === 0} onClick={save}>
            {busy ? 'Adding…' : `Add ${preview.length || ''} computer${preview.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}