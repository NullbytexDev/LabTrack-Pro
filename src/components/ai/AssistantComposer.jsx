import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

export default function AssistantComposer({ onSend, busy }) {
  const [value, setValue] = useState('');
  const ready = value.trim().length > 0 && !busy;

  const send = () => {
    const text = value.trim();
    if (!text || busy) return;
    setValue('');
    onSend(text);
  };

  return (
    <div className="border-t border-border/70 bg-card/60 p-3">
      <div
        className={`flex items-end gap-2 rounded-2xl border bg-background/70 p-2 transition-colors ${
          ready ? 'border-primary/50 glow-primary' : 'border-border/80'
        }`}
      >
        <textarea
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Ask about a computer, lab or report…"
          aria-label="Ask the LabTrack Pro Assistant"
          className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={send}
          disabled={!ready}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowUp className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">Enter sends · Shift + Enter adds a line</p>
    </div>
  );
}