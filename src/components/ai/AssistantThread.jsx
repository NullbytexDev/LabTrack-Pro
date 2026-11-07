import React, { useCallback, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import AssistantThinking from '@/components/ai/AssistantThinking';
import AssistantReply from '@/components/ai/AssistantReply';

const SUGGESTIONS = [
  'Which computers need repair right now?',
  'Summarise the open issues by lab',
  'What should I check first in each lab?',
];

export default function AssistantThread({ messages, busy, error, onPick }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  const keepInView = useCallback(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, []);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {messages.length === 0 && !busy && (
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold">Ask about your labs</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Answers are drawn from your live labs, computers and open reports.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onPick(suggestion)}
                className="rounded-xl border border-border/70 bg-secondary/50 px-3 py-2 text-left text-xs leading-relaxed text-foreground/85 transition hover:border-primary/40 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message, index) => {
        if (message.role === 'user') {
          return (
            <div key={`u-${index}`} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-primary/25 bg-primary/15 px-3 py-2 text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
          );
        }
        const asked = messages[index - 1]?.role === 'user' ? messages[index - 1].content : '';
        return (
          <AssistantReply
            key={`a-${index}`}
            content={message.content}
            question={asked}
            animate={index === messages.length - 1}
            onGrow={keepInView}
          />
        );
      })}

      {busy && <AssistantThinking />}

      {error && <p className="text-xs leading-relaxed text-destructive">{error}</p>}
      <div ref={endRef} />
    </div>
  );
}