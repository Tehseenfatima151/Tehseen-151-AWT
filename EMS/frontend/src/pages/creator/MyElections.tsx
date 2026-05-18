import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Filter, Search, Edit2, Trash2, Send, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { PageHeader, StatusBadge, EmptyState, CountdownTimer } from '../../components/common/UIComponents';
import type { ElectionStatus } from '../../types';

const ALL_STATUSES: ElectionStatus[] = ['draft', 'pending', 'approved', 'rejected', 'active', 'completed'];

export default function MyElections() {
  const { user } = useAuthStore();
  const { elections, deleteElection, submitForApproval } = useElectionStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ElectionStatus | 'all'>('all');

  const mine = elections.filter(e =>
    e.creatorId === user?.id &&
    (statusFilter === 'all' || e.status === statusFilter) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.organization.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader title="My Elections" subtitle="All elections you have created." breadcrumbs={[{ label: 'Creator' }, { label: 'My Elections' }]}
        actions={<Link to="/creator/elections/create" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90"><PlusCircle size={15} /> New</Link>} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search elections..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', ...ALL_STATUSES] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>{s}</button>
          ))}
        </div>
      </div>

      {mine.length === 0 ? (
        <EmptyState title="No elections found" description="Create your first election to get started." icon="🗳️"
          action={<Link to="/creator/elections/create" className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90">Create Election</Link>} />
      ) : (
        <div className="space-y-3">
          {mine.map(e => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status={e.status} dot={e.status === 'active'} /></div>
                  <h3 className="font-bold text-foreground">{e.title}</h3>
                  <p className="text-sm text-muted-foreground">{e.organization} · {e.currentVoters}/{e.maxVoters} voters</p>
                  {e.status === 'active' && <p className="text-xs text-primary font-semibold mt-1">Ends: <CountdownTimer endDate={e.endDate} /></p>}
                  {e.status === 'rejected' && e.rejectionReason && <p className="text-xs text-destructive mt-1">Rejected: {e.rejectionReason}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {e.status === 'draft' && (
                    <button onClick={() => submitForApproval(e.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90"><Send size={13} /> Submit</button>
                  )}
                  <Link to={`/creator/elections/create?edit=${e.id}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-bold rounded-lg hover:bg-muted"><Edit2 size={13} /> Edit</Link>
                  {(e.status === 'draft' || e.status === 'rejected') && (
                    <button onClick={() => deleteElection(e.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive text-xs font-bold rounded-lg hover:bg-destructive/10"><Trash2 size={13} /> Delete</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
