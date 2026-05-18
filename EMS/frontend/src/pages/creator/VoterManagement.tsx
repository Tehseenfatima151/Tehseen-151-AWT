import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { PageHeader, StatusBadge, EmptyState } from '../../components/common/UIComponents';
import { Users, Lock, Unlock, Search } from 'lucide-react';
import { useState } from 'react';

export default function VoterManagement() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { registrations } = useVotingStore();
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [search, setSearch] = useState('');

  const myElections = elections.filter(e => e.creatorId === user?.id);
  const selected = myElections.find(e => e.id === selectedElectionId) || myElections[0];

  const electionRegs = registrations.filter(r =>
    r.electionId === (selected?.id) &&
    (r.userName.toLowerCase().includes(search.toLowerCase()) || r.userEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Voter Management" subtitle="View and manage registered voters for your elections." breadcrumbs={[{ label: 'Creator' }, { label: 'Voters' }]} />

      {myElections.length === 0 ? (
        <EmptyState title="No elections yet" description="Create an election to manage voters." icon="👥" />
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={selected?.id || ''} onChange={e => setSelectedElectionId(e.target.value)} className="px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-sm flex-1">
              {myElections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search voters..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          {selected && (
            <div className="grid grid-cols-3 gap-4 text-center">
              {[['Registered', selected.currentVoters, 'text-primary'], ['Capacity', selected.maxVoters, 'text-foreground'], ['Waitlist', selected.waitlistCount, 'text-amber-600']].map(([l, v, c]) => (
                <div key={l as string} className="bg-card border border-border rounded-xl p-4">
                  <p className={`text-2xl font-black ${c}`}>{(v as number).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">{l as string}</p>
                </div>
              ))}
            </div>
          )}

          {selected?.isVoterListLocked && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
              <Lock size={15} /> Voter list is locked. No new registrations accepted.
            </div>
          )}

          {electionRegs.length === 0 ? (
            <EmptyState title="No voters registered" description="Voters who join this election will appear here." icon="👥" />
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold">Registered Voters ({electionRegs.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>{['Voter', 'Email', 'Secret ID', 'Status', 'Registered', 'Voted'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {electionRegs.map(r => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold">{r.userName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.userEmail}</td>
                        <td className="px-4 py-3 font-mono text-xs">{r.secretIdMasked || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.registeredAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.votedAt ? new Date(r.votedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
