import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldQuestion } from 'lucide-react';

/**
 * In-dialog confirmation step. Names the lab or computer being changed so a
 * mis-click cannot silently add, rename or remove something.
 */
export default function ConfirmPrompt({ title, description, confirmLabel, onConfirm, onBack, busy }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-4">
        <ShieldQuestion className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button type="button" onClick={onConfirm} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}