import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_META, INSTRUCTOR_STATUSES } from '@/lib/constants';
import PcConfigFields, { EMPTY_CONFIG, configurationSummary } from '@/components/edit/PcConfigFields';
import ConfirmPrompt from '@/components/edit/ConfirmPrompt';
import { Loader2 } from 'lucide-react';

const EMPTY = { identifier: '', label: '', status: 'available', notes: '', ...EMPTY_CONFIG };

export default function PcFormDialog({ open, onOpenChange, pc, labName, labId, suggestedIdentifier, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setConfirming(false);
    setForm(
      pc
        ? {
            identifier: pc.identifier || '',
            label: pc.label || '',
            status: pc.status || 'available',
            notes: pc.notes || '',
            os: pc.os || '',
            os_version: pc.os_version || '',
            ram_gb: pc.ram_gb ? String(pc.ram_gb) : '',
            storage_gb: pc.storage_gb ? String(pc.storage_gb) : '',
            storage_type: pc.storage_type || '',
            cpu_brand: pc.cpu_brand || '',
            cpu_model: pc.cpu_model || '',
          }
        : { ...EMPTY, identifier: suggestedIdentifier || '' },
    );
  }, [open, pc, suggestedIdentifier]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  // Staff can only move a computer to Repaired or Available; issue statuses come from reports.
  const statusOptions = INSTRUCTOR_STATUSES.includes(form.status)
    ? INSTRUCTOR_STATUSES
    : [form.status, ...INSTRUCTOR_STATUSES];

  const submit = (event) => {
    event.preventDefault();
    setError('');
    if (!/^[A-Za-z0-9][A-Za-z0-9-]{1,19}$/.test(form.identifier.trim())) {
      setError('Use 2–20 characters: letters, numbers and dashes (for example L1-PC01).');
      return;
    }
    setConfirming(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const response = await api.functions.invoke('pcAdmin', {
        action: pc ? 'update' : 'create',
        id: pc?.id,
        lab_id: labId,
        pc: form,
      });
      onSaved?.(response.data?.message || 'Saved.');
      onOpenChange(false);
    } catch (err) {
      setConfirming(false);
      setError(err?.response?.data?.error || 'That change could not be saved.');
    } finally {
      setLoading(false);
    }
  };

  const summary = configurationSummary({
    ...form,
    ram_gb: Number(form.ram_gb) || 0,
    storage_gb: Number(form.storage_gb) || 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{pc ? `Edit ${pc.identifier}` : `Add a computer to ${labName}`}</DialogTitle>
          <DialogDescription>
            {pc
              ? 'Update the details and configuration of this computer.'
              : 'The next free number in this lab is filled in for you — change it if the institute uses another identifier.'}
          </DialogDescription>
        </DialogHeader>

        {confirming ? (
          <ConfirmPrompt
            title={pc ? `Save changes to ${form.identifier}?` : `Add ${form.identifier} to ${labName}?`}
            description={
              pc
                ? `Configuration: ${summary || 'not set'}. Status: ${STATUS_META[form.status]?.label || form.status}.`
                : `A new computer with identifier ${form.identifier} will be created in ${labName}. Configuration: ${summary || 'not set'}.`
            }
            confirmLabel={pc ? 'Save computer' : `Add ${form.identifier}`}
            onConfirm={save}
            onBack={() => setConfirming(false)}
            busy={loading}
          />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pc-identifier">Identifier</Label>
                <Input id="pc-identifier" value={form.identifier} onChange={set('identifier')} placeholder="L1-PC01" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pc-status">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                  <SelectTrigger id="pc-status" aria-label="Computer status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <PcConfigFields
              value={form}
              onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
              disabled={loading}
            />

            <div className="space-y-1.5">
              <Label htmlFor="pc-label">Label (optional)</Label>
              <Input id="pc-label" value={form.label} onChange={set('label')} placeholder="Window seat, row 2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pc-notes">Internal note (optional)</Label>
              <Textarea id="pc-notes" value={form.notes} onChange={set('notes')} rows={2} maxLength={500} />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {pc ? 'Review and save' : 'Review and add'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}