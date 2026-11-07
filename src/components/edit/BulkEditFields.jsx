import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PcConfigFields from '@/components/edit/PcConfigFields';

export default function BulkEditFields({ value, onChange, busy }) {
  const touchConfig = (key, next) => {
    onChange({
      ...value,
      configuration: { ...value.configuration, [key]: next },
      touched: [...new Set([...(value.touched || []), key])],
    });
  };

  return (
    <fieldset className="space-y-5" disabled={busy}>
      <div className="rounded-xl border border-border bg-secondary/20 p-4">
        <Label htmlFor="bulk-status" className="mb-2 block font-semibold">Computer status</Label>
        <Select value={value.status} onValueChange={(status) => onChange({ ...value, status })}>
          <SelectTrigger id="bulk-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unchanged">Keep current statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="repaired">Repaired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
        <div className="flex items-center gap-3">
          <Checkbox id="bulk-notes-enabled" checked={value.changeNotes} disabled={busy} onCheckedChange={(changeNotes) => onChange({ ...value, changeNotes })} />
          <Label htmlFor="bulk-notes-enabled" className="font-semibold">Replace notes on selected computers</Label>
        </div>
        {value.changeNotes ? (
          <div className="space-y-2">
            <Label htmlFor="bulk-notes" className="text-xs text-muted-foreground">New note · leave blank to clear existing notes</Label>
            <Textarea id="bulk-notes" value={value.notes} maxLength={500} onChange={(event) => onChange({ ...value, notes: event.target.value })} className="min-h-24 bg-background" />
          </div>
        ) : <p className="text-xs text-muted-foreground">Existing notes will stay unchanged.</p>}
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Hardware configuration</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Only fields you change are applied. Choose <span className="font-medium text-foreground">Not set</span> or empty a field to clear its value on every selected computer.
          </p>
        </div>
        <div className="[&_legend]:sr-only"><PcConfigFields value={value.configuration} disabled={busy} onChange={touchConfig} /></div>
        {(value.touched || []).length > 0 && <p className="border-t border-border pt-3 text-xs font-medium text-primary">{value.touched.length} hardware field{value.touched.length === 1 ? '' : 's'} selected for update</p>}
      </div>
    </fieldset>
  );
}