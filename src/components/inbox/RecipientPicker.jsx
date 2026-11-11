import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Input } from '@/components/ui/input';
import { ROLE_META } from '@/lib/constants';

export default function RecipientPicker({ value, onChange }) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  useEffect(() => { const timer = setTimeout(() => setTerm(search.trim()), 350); return () => clearTimeout(timer); }, [search]);
  const query = useQuery({ queryKey: ['message-members', term], queryFn: async () => (await api.functions.invoke('inbox', { action: 'members', search: term })).data.members, staleTime: 60000, retry: false });
  if (value) return <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm"><span>{value.full_name}</span><button type="button" className="text-xs text-primary" onClick={() => onChange(null)}>Change recipient</button></div>;
  return (
    <div className="space-y-2">
      <Input aria-label="Find recipient by name or institute ID" placeholder="Find a member by name or institute ID" value={search} maxLength={60} onChange={(event) => setSearch(event.target.value)} />
      {query.isPending ? <p role="status" className="text-xs text-muted-foreground">Loading members…</p> : query.isError ? <p role="alert" className="text-xs text-destructive">Members could not be loaded. <button type="button" onClick={() => query.refetch()} className="underline">Try again</button></p> : (
        <div className="max-h-40 overflow-y-auto rounded-xl border border-border">
          {!query.data?.length && <p className="p-3 text-xs text-muted-foreground">No matching members. Try a name or institute ID.</p>}
          {query.data?.map((member) => <button type="button" key={member.user_id} onClick={() => onChange(member)} className="block w-full border-b border-border/50 p-3 text-left hover:bg-secondary"><span className="block text-sm font-medium">{member.full_name}</span><span className="text-xs text-muted-foreground">{ROLE_META[member.role]?.label} {member.reference ? `· ${member.reference}` : ''}</span></button>)}
        </div>
      )}
    </div>
  );
}