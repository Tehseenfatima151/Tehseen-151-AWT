import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { PageHeader, EmptyState, StatusBadge } from '../../components/common/UIComponents';
import { Clock, UserCheck } from 'lucide-react';
import { useState } from 'react';

export default function WaitlistPage() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { registrations } = useVotingStore();
  const [selectedElection, setSelectedElection] = useState('all');

  const myElections = elections.filter(e => e.creatorId === user?.id);
  const waitlisted = registrations.filter(r =>
    r.status === 'waitlisted' &&
    myElections.some(e => e.id === r.electionId) &&
    (selectedElection === 'all' || r.electionId === selectedElection)
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Waitlist Management" subtitle="Voters waiting for a spot in capacity-locked elections." breadcrumbs={[{ label: 'Creator' }, { label: 'Waitlist' }]} />

      <div className="flex items-center gap-3">
        <select value={selectedElection} onChange={e => setSelectedElection(e.target.value)} className="px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Elections</option>
          {myElections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <span className="text-sm font-semibold text-muted-foreground">{waitlisted.length} waitlisted voters</span>
      </div>

      {waitlisted.length === 0 ? (
        <EmptyState title="No waitlisted voters" description="Your elections haven't reached capacity limits yet." icon="⏳" />
      ) : (
        <div className="space-y-3">
          {waitlisted.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">#{(r.waitlistPosition || i + 1)}</div>
                <div>
                  <p className="font-semibold text-sm">{r.userName}</p>
                  <p className="text-xs text-muted-foreground">{r.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{elections.find(e => e.id === r.electionId)?.title}</p>
                  <p className="text-xs text-muted-foreground">Joined {new Date(r.registeredAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status="waitlisted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {waitlisted.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          <Clock size={15} className="inline mr-1.5" />
          <strong>Auto-promotion:</strong> When a registered voter withdraws, the next person on the waitlist is automatically moved to registered and receives their Secret ID.
        </div>
      )}
    </div>
  );
}
