import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmPrompt from '@/components/edit/ConfirmPrompt';
import { Loader2 } from 'lucide-react';

const ACCENTS = [
  { value: 'indigo', className: 'bg-[#35D3C5]' },
  { value: 'teal', className: 'bg-[#A7D5A6]' },
  { value: 'violet', className: 'bg-[#4C7FB0]' },
  { value: 'amber', className: 'bg-[#EBC15F]' },
  { value: 'rose', className: 'bg-[#D9778C]' },
];

const EMPTY = { name: '', code: '', location: '', capacity: '', description: '', accent: 'indigo' };

export default function LabFormDialog({ open, onOpenChange, lab, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setConfirming(false);
    setForm(
      lab
        ? {
            name: lab.name || '',
            code: lab.code || '',
            location: lab.location || '',
            capacity: lab.capacity ? String(lab.capacity) : '',
            description: lab.description || '',
            accent: lab.accent || 'indigo',
          }
        : EMPTY,
    );
  }, [open, lab]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) {
      setError('Give the lab a name (at least 2 characters).');
      return;
    }
    setConfirming(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const response = await api.functions.invoke('labAdmin', {
        action: lab ? 'update' : 'create',
        id: lab?.id,
        lab: { ...form, capacity: Number(form.capacity) || 0 },
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

  const name = form.name.trim();
  const renamed = Boolean(lab) && name !== lab.name;
  const confirmTitle = !lab ? `Add lab ${name}?` : renamed ? `Rename ${lab.name} to ${name}?` : `Save changes to ${lab.name}?`;
  const confirmDescription = [
    form.code ? `Short code ${form.code.toUpperCase()}.` : 'No short code set.',
    form.location ? `Location: ${form.location}.` : 'No location set.',
    Number(form.capacity) ? `${Number(form.capacity)} seats.` : 'Capacity not set.',
  ].join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lab ? `Edit ${lab.name}` : 'Add a lab'}</DialogTitle>
          <DialogDescription>
            Lab names and PC identifiers are validated on the server. Nothing is invented for you — enter the
            institute's real lab.
          </DialogDescription>
        </DialogHeader>

        {confirming ? (
          <ConfirmPrompt
            title={confirmTitle}
            description={confirmDescription}
            confirmLabel={lab ? 'Save lab' : `Add ${name}`}
            onConfirm={save}
            onBack={() => setConfirming(false)}
            busy={loading}
          />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lab-name">Lab name</Label>
                <Input id="lab-name" value={form.name} onChange={set('name')} placeholder="Lab 1" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-code">Short code</Label>
                <Input id="lab-code" value={form.code} onChange={set('code')} placeholder="L1" maxLength={12} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lab-location">Location</Label>
                <Input id="lab-location" value={form.location} onChange={set('location')} placeholder="First floor, block B" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-capacity">Seats</Label>
                <Input id="lab-capacity" type="number" min="0" max="500" value={form.capacity} onChange={set('capacity')} placeholder="30" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lab-description">Note</Label>
              <Textarea id="lab-description" value={form.description} onChange={set('description')} rows={2} maxLength={500} />
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Card accent</legend>
              <div className="mt-2 flex gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, accent: accent.value }))}
                    aria-pressed={form.accent === accent.value}
                    aria-label={`${accent.value} accent`}
                    className={`h-8 w-8 rounded-full ${accent.className} transition ${
                      form.accent === accent.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </fieldset>

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
                {lab ? 'Review and save' : 'Review and add'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}