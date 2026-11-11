import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import PageTexture from '@/components/common/PageTexture';
import MessageList from '@/components/inbox/MessageList';
import MessageDetail from '@/components/inbox/MessageDetail';
import MessageComposer from '@/components/inbox/MessageComposer';
import { Button } from '@/components/ui/button';

export default function Inbox() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [folder, setFolder] = useState('inbox');
  const [selected, setSelected] = useState(null);
  const [compose, setCompose] = useState(null);
  const [error, setError] = useState('');
  const query = useInfiniteQuery({ queryKey: ['inbox', user.id, folder], initialPageParam: null, queryFn: async ({ pageParam }) => (await api.functions.invoke('inbox', { action: 'list', folder, cursor: pageParam })).data, getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined, staleTime: 30000, retry: false, refetchInterval: 20000, refetchOnWindowFocus: true });
  const refresh = () => {
    window.dispatchEvent(new Event('labtrack:inbox-updated'));
    return client.invalidateQueries({ queryKey: ['inbox', user.id] });
  };
  const open = async (message) => {
    setSelected(message); setError('');
    if (message.recipient_user_id !== user.id || message.read_at) return;
    try { await api.functions.invoke('inbox', { action: 'read', id: message.id }); await refresh(); }
    catch (err) { setError(err?.response?.data?.error || 'The message could not be marked as read.'); }
  };
  return (
    <div className="relative">
      <PageTexture variant="scan" />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">Member messaging</p><h1 className="mt-2 text-3xl font-semibold">Inbox</h1></div><Button onClick={() => setCompose({})}>New message</Button></header>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A conversation is private to its two members — nobody else can open it. Replying sends your answer straight back
          to the person who wrote to you, and new messages are counted on the Inbox button.
        </p>
        <div className="mt-5 flex gap-2">{['inbox', 'sent'].map((key) => <Button key={key} variant={folder === key ? 'default' : 'outline'} onClick={() => { setFolder(key); setSelected(null); }}>{key === 'inbox' ? 'Inbox' : 'Sent'}</Button>)}<Button variant="ghost" disabled={query.isFetching} onClick={refresh}>Refresh</Button></div>
        {(error || query.isError) && <p role="alert" className="mt-4 text-sm text-destructive">{error || query.error?.response?.data?.error || 'Messages could not be loaded. Use Refresh to try again.'}</p>}
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section className="surface overflow-hidden" aria-label={`${folder} messages`}>
            {query.isPending ? <p role="status" className="p-6 text-sm text-muted-foreground">Loading messages…</p> : !query.isError && <MessageList messages={query.data?.pages.flatMap((page) => page.items) || []} folder={folder} selectedId={selected?.id} onSelect={open} />}
            {query.hasNextPage && <Button variant="ghost" className="m-3" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button>}
          </section>
          <MessageDetail message={selected} userId={user.id} onClose={() => setSelected(null)} onReply={setCompose} />
        </div>
      </div>
      {compose && <MessageComposer initial={compose} onClose={() => setCompose(null)} onSent={refresh} />}
    </div>
  );
}