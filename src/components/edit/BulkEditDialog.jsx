import React, { useState } from 'react';
import { api } from '@/api/client';
import BulkEditFrame from '@/components/edit/BulkEditFrame';
import BulkEditReview from '@/components/edit/BulkEditReview';
import { EMPTY_CONFIG } from '@/components/edit/PcConfigFields';
import BulkEditFields from '@/components/edit/BulkEditFields';
import { toast } from '@/components/ui/use-toast';

export default function BulkEditDialog({ ids, labId, labName, onClose, onSaved }) {
  const [value, setValue] = useState({
    status: 'unchanged',
    changeNotes: false,
    notes: '',
    configuration: { ...EMPTY_CONFIG },
    touched: [],
  });
  const [step, setStep] = useState('confirm');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Only the hardware fields the user touched are applied; a blank one clears it.
  const configuration = Object.fromEntries(
    (value.touched || []).map((key) => [key, value.configuration[key] ?? '']),
  );

  const patch = {
    ...(value.status !== 'unchanged' ? { status: value.status } : {}),
    ...(value.changeNotes ? { notes: value.notes } : {}),
    ...(Object.keys(configuration).length ? { configuration } : {}),
  };

  const hasChanges = Object.keys(patch).length > 0;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('pcAdmin', { action: 'bulk_update', lab_id: labId, ids, patch });
      await onSaved();
      toast({ title: 'Bulk edit saved', description: data.message });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'The changes could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BulkEditFrame
      step={step} count={ids.length} labName={labName} busy={busy} error={error} hasChanges={hasChanges}
      onClose={onClose}
      onBack={() => step === 'confirm' ? onClose() : setStep(step === 'review' ? 'edit' : 'confirm')}
      onContinue={() => step === 'review' ? save() : setStep(step === 'confirm' ? 'edit' : 'review')}
    >
      {step === 'confirm' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Selected for editing</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{ids.length} computer{ids.length === 1 ? '' : 's'}</p>
            <p className="mt-1 break-words text-sm text-muted-foreground">{labName}</p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">You can update status, notes and hardware for this selection. You will review the exact changes before applying them.</p>
          <p className="text-xs leading-relaxed text-muted-foreground">Unselected computers, identifiers and repair history will not be changed.</p>
        </div>
      ) : step === 'review' ? (
        <BulkEditReview value={value} configuration={configuration} />
      ) : (
        <BulkEditFields value={value} onChange={setValue} busy={busy} />
      )}
    </BulkEditFrame>
  );
}