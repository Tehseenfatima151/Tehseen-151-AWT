// Shared helper to create election list pages for admin role
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Users, Calendar, BarChart3 } from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';
import { PageHeader, StatusBadge, EmptyState, CountdownTimer } from '../../components/common/UIComponents';
import type { ElectionStatus } from '../../types';

function ElectionTable({ statuses, title, subtitle }: { statuses: ElectionStatus[]; title: string; subtitle: string }) {
  const { elections } = useElectionStore();
  const [search, setSearch] = useState('');
  const filtered = elections.filter(e =>
    statuses.includes(e.status) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.organization.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={[{ label: 'Admin' }, { label: title }]} />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search elections..." className="w-full max-w-sm px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      {filtered.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()}`} description="Nothing to show here yet." icon="🗳️" />
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={e.status} dot={e.status === 'active'} />
                    <span className="text-xs text-muted-foreground capitalize font-medium">{e.category}</span>
                  </div>
                  <h3 className="font-bold text-foreground truncate">{e.title}</h3>
                  <p className="text-sm text-muted-foreground">{e.organization} · by {e.creatorName}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-bold text-foreground"><Users size={13} /> {e.currentVoters.toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground">of {e.maxVoters.toLocaleString()}</p>
                  </div>
                  {e.status === 'active' && (
                    <div className="text-center">
                      <div className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar size={10} /> Ends</div>
                      <CountdownTimer endDate={e.endDate} />
                    </div>
                  )}
                  {e.status === 'completed' && (
                    <div className="text-center">
                      <div className="text-sm font-black text-primary">{e.turnoutPercentage.toFixed(1)}%</div>
                      <p className="text-[10px] text-muted-foreground">Turnout</p>
                    </div>
                  )}
                </div>
              </div>
              {e.status === 'active' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1 font-semibold text-muted-foreground">
                    <span>Voter Capacity</span><span>{e.currentVoters}/{e.maxVoters}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${(e.currentVoters / e.maxVoters) * 100}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ApprovedElections() { return <ElectionTable statuses={['approved']} title="Approved Elections" subtitle="Elections approved and ready to start." />; }
export function RejectedElections() { return <ElectionTable statuses={['rejected']} title="Rejected Elections" subtitle="Elections that were rejected by admin." />; }
export function ActiveElectionsAdmin() { return <ElectionTable statuses={['active']} title="Active Elections" subtitle="Currently running elections across the platform." />; }
export function CompletedElectionsAdmin() { return <ElectionTable statuses={['completed']} title="Completed Elections" subtitle="Elections that have concluded." />; }
