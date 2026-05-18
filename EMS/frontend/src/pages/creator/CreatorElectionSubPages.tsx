// Creator sub-pages that share a common pattern
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Send, BarChart3, Download } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { PageHeader, StatusBadge, EmptyState, CountdownTimer } from '../../components/common/UIComponents';
import type { ElectionStatus } from '../../types';

function FilteredElectionList({ statuses, title, subtitle }: { statuses: ElectionStatus[]; title: string; subtitle: string }) {
  const { user } = useAuthStore();
  const { elections, submitForApproval } = useElectionStore();
  const [search, setSearch] = useState('');
  const mine = elections.filter(e =>
    e.creatorId === user?.id && statuses.includes(e.status) &&
    e.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={[{ label: 'Creator' }, { label: title }]}
        actions={<Link to="/creator/elections/create" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90"><PlusCircle size={14} /> New Election</Link>} />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full max-w-sm px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      {mine.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()}`} icon="🗳️"
          action={<Link to="/creator/elections/create" className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90">Create Election</Link>} />
      ) : (
        <div className="space-y-3">
          {mine.map(e => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status={e.status} dot={e.status === 'active'} /></div>
                  <h3 className="font-bold">{e.title}</h3>
                  <p className="text-sm text-muted-foreground">{e.currentVoters}/{e.maxVoters} voters · {e.candidates.length} candidates</p>
                  {e.status === 'active' && <p className="text-xs text-primary font-semibold mt-1">Ends: <CountdownTimer endDate={e.endDate} /></p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {e.status === 'draft' && <button onClick={() => submitForApproval(e.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg"><Send size={12} /> Submit</button>}
                  {(e.status === 'active' || e.status === 'completed') && (
                    <Link to="/creator/results" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"><BarChart3 size={12} /> Results</Link>
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

export function DraftElections() { return <FilteredElectionList statuses={['draft']} title="Draft Elections" subtitle="Unfinished elections not yet submitted for review." />; }
export function ApprovedElectionsCreator() { return <FilteredElectionList statuses={['approved']} title="Approved Elections" subtitle="Approved and ready to activate." />; }
export function ActiveElectionsCreator() { return <FilteredElectionList statuses={['active']} title="Active Elections" subtitle="Currently live and accepting votes." />; }
export function CompletedElectionsCreator() { return <FilteredElectionList statuses={['completed']} title="Completed Elections" subtitle="Finished elections with final results." />; }
