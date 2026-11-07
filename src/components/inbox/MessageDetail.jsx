import React from 'react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';

export default function MessageDetail({ message, userId, onReply, onClose }) {
  if (!message) return <section className="surface flex min-h-64 items-center justify-center p-6 text-sm text-muted-foreground">Choose a message to read it.</section>;
  return (
    <article className="surface min-w-0 p-6">
      <div className="flex items-start justify-between gap-3"><h2 className="break-words text-xl font-semibold">{message.subject}</h2><Button variant="ghost" size="sm" onClick={onClose}>Close</Button></div>
      <p className="mt-3 break-words text-xs text-muted-foreground">From {message.sender_name} · To {message.recipient_name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(message.sent_at)}</p>
      <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
      {message.sender_user_id !== userId && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={() =>
            onReply({
              replyTo: message.id,
              recipient: { user_id: message.sender_user_id, full_name: message.sender_name },
              subject: `Re: ${message.subject.replace(/^Re:\s*/i, '')}`.slice(0, 120),
            })
          }
        >
          Reply
        </Button>
      )}
    </article>
  );
}