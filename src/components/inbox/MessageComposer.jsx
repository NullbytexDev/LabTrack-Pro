import React, { useState } from 'react';
import { api } from '@/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import RecipientPicker from '@/components/inbox/RecipientPicker';
import { toast } from '@/components/ui/use-toast';

export default function MessageComposer({ initial, onClose, onSent }) {
  const isReply = Boolean(initial?.replyTo);
  const [recipient, setRecipient] = useState(initial?.recipient || null);
  const [subject, setSubject] = useState(initial?.subject || '');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [blockedUntil, setBlockedUntil] = useState(0);

  const send = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (blockedUntil > Date.now()) { setError('Please wait before sending another message.'); return; }
    if (!recipient) { setError('Choose a recipient first.'); return; }
    setBusy(true); setError('');
    try {
      const { data } = await api.functions.invoke('inbox', {
        action: 'send',
        recipient_user_id: recipient.user_id,
        subject,
        body,
        ...(initial?.replyTo ? { reply_to: initial.replyTo } : {}),
      });
      const name = data?.recipient_name || recipient.full_name;
      toast({
        title: isReply ? 'Reply sent' : 'Message sent',
        description: isReply ? `Your reply has been sent to ${name}.` : `Your message has been sent to ${name}.`,
      });
      if (onSent) onSent(name);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Your message could not be sent.');
      if (err?.response?.status === 429) setBlockedUntil(Date.now() + (Number(err.response.data?.retry_after) || 60) * 1000);
    } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isReply ? `Reply to ${recipient?.full_name || 'this member'}` : 'New message'}</DialogTitle>
          <DialogDescription>
            {isReply
              ? 'Your reply goes straight back to the member who wrote to you.'
              : 'Send to a LabTrack member. Limited to 10 messages per minute.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={send} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              {isReply && recipient ? (
                <p className="rounded-md border border-border/70 bg-secondary/40 px-3 py-2 text-sm">{recipient.full_name}</p>
              ) : (
                <RecipientPicker value={recipient} onChange={setRecipient} />
              )}
            </div>
            <div className="space-y-2"><Label htmlFor="message-subject">Subject</Label><Input id="message-subject" value={subject} maxLength={120} required onChange={(event) => setSubject(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="message-body">{isReply ? 'Your reply' : 'Message'}</Label><Textarea id="message-body" value={body} rows={6} maxLength={2000} required onChange={(event) => setBody(event.target.value)} /><p className="text-right text-xs text-muted-foreground">{body.length}/2,000</p></div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
            <Button disabled={busy || !recipient || !subject.trim() || !body.trim()}>
              {busy ? 'Sending…' : isReply ? 'Send reply' : 'Send message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}