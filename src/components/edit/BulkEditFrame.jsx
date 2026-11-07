import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ListChecks, Loader2 } from 'lucide-react';

export default function BulkEditFrame({ step, count, labName, busy, error, hasChanges, onClose, onBack, onContinue, children }) {
  const noun = count === 1 ? 'computer' : 'computers';
  const steps = { confirm: 1, edit: 2, review: 3 };
  const title = step === 'confirm' ? `Edit ${count} selected ${noun}?` : step === 'edit' ? 'Choose bulk updates' : 'Confirm bulk changes';
  const description = step === 'confirm'
    ? `Continue to choose updates for the selected ${noun} in ${labName}. Nothing will be saved yet.`
    : step === 'edit' ? 'Set only the fields you want to replace. Everything else stays unchanged.'
    : `The updates below will be applied to all ${count} selected ${noun} in ${labName}.`;
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="flex max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-5 pr-12 text-left sm:px-6 sm:pr-12">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary"><ListChecks className="h-4 w-4" aria-hidden="true" /> Bulk edit · Step {steps[step]} of 3</div>
          <DialogTitle className="text-xl leading-snug">{title}</DialogTitle>
          <DialogDescription className="pt-1 text-xs leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
        <div className="shrink-0 space-y-3 border-t border-border bg-secondary/20 px-5 py-4 sm:px-6">
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-words text-xs text-muted-foreground"><span className="font-semibold tabular-nums text-foreground">{count} selected</span> · {labName}</p>
            <div className="flex shrink-0 flex-col-reverse justify-end gap-2 min-[400px]:flex-row">
              <Button variant="outline" disabled={busy} onClick={onBack}>{step === 'confirm' ? 'Cancel' : 'Back'}</Button>
              <Button disabled={busy || (step !== 'confirm' && !hasChanges)} onClick={onContinue}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {busy ? 'Saving…' : step === 'confirm' ? 'Continue to edit' : step === 'edit' ? 'Review changes' : `Apply to ${count} ${noun}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}