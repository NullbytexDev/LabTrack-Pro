import React from 'react';
import { timeAgo } from '@/lib/format';
import { Mail } from 'lucide-react';

export default function MessageList({ messages, selectedId, folder, onSelect }) {
  if (!messages.length) return <div className="p-8 text-center"><Mail className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm">{folder === 'sent' ? 'No sent messages yet' : 'Your inbox is empty'}</p></div>;
  return (
    <ul className="divide-y divide-border/60">
      {messages.map((message) => (
        <li key={message.id}>
          <button onClick={() => onSelect(message)} aria-pressed={message.id === selectedId} className={`block w-full p-4 text-left transition-colors hover:bg-secondary ${message.id === selectedId ? 'bg-primary/10' : ''}`}>
            <span className="flex items-center justify-between gap-3 text-xs"><span className="truncate text-muted-foreground">{folder === 'sent' ? `To ${message.recipient_name}` : message.sender_name}</span><span className="shrink-0 text-muted-foreground">{timeAgo(message.sent_at)}</span></span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold">{folder === 'inbox' && !message.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}<span className="truncate">{message.subject}</span></span>
            <span className="mt-1 block truncate text-xs text-muted-foreground">{message.body}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}