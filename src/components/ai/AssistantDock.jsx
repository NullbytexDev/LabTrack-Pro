// Docked LabTrack AI assistant — present on every page for signed-in members
import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import AssistantThread from '@/components/ai/AssistantThread';
import AssistantComposer from '@/components/ai/AssistantComposer';

export default function AssistantDock() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // The assistant only exists for signed-in members — visitors never see the entry point.
  if (isLoadingAuth || !isAuthenticated || !user?.id) return null;

  const ask = async (text) => {
    const question = String(text || '').trim();
    if (!question || busy) return;
    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setBusy(true);
    setError('');
    try {
      const { data } = await api.functions.invoke('aiAssist', { action: 'chat', messages: next });
      setMessages((current) => [...current, { role: 'assistant', content: data?.reply || '' }]);
    } catch (err) {
      setError(err?.response?.data?.error || 'The assistant could not answer. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close the LabTrack Pro Assistant' : 'Open the LabTrack Pro Assistant'}
        className="glow-hover fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md sm:right-6"
      >
        {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />}
        <span className={open ? 'sr-only' : ''}>Ask LabTrack Pro</span>
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="LabTrack Pro Assistant"
          className="fixed bottom-20 right-4 z-40 flex h-[min(72vh,30rem)] w-[min(calc(100vw-2rem),24rem)] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-md sm:right-6"
        >
          <header className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-semibold">LabTrack Pro Assistant</p>
              <p className="truncate text-[11px] text-muted-foreground">Answers from your live lab data</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Hide assistant"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <AssistantThread messages={messages} busy={busy} error={error} onPick={ask} />
          <AssistantComposer onSend={ask} busy={busy} />
        </section>
      )}
    </>
  );
}