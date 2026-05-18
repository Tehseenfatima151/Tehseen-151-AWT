import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { PageHeader, EmptyState } from '../../components/common/UIComponents';

export default function SecretIdsCreator() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { secretIds, revokeSecretId, regenerateSecretId } = useVotingStore();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [selectedElection, setSelectedElection] = useState('all');

  const myElectionIds = elections.filter(e => e.creatorId === user?.id).map(e => e.id);
  const mySecretIds = secretIds.filter(s =>
    myElectionIds.includes(s.electionId) &&
    (selectedElection === 'all' || s.electionId === selectedElection)
  );

  const toggleReveal = (id: string) => setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-5">
      <PageHeader title="Secret ID Management" subtitle="View and manage voter secret IDs across your elections." breadcrumbs={[{ label: 'Creator' }, { label: 'Secret IDs' }]} />

      <div className="flex items-center gap-3">
        <select value={selectedElection} onChange={e => setSelectedElection(e.target.value)} className="px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Elections</option>
          {elections.filter(e => e.creatorId === user?.id).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <div className="text-sm text-muted-foreground font-semibold">{mySecretIds.length} IDs total · {mySecretIds.filter(s => s.isUsed).length} used · {mySecretIds.filter(s => !s.isUsed && !s.isRevoked).length} active</div>
      </div>

      {mySecretIds.length === 0 ? (
        <EmptyState title="No secret IDs yet" description="Secret IDs are generated automatically when voters register." icon="🔑" />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Secret ID', 'Election', 'Status', 'Generated', 'Used At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mySecretIds.map(sid => (
                  <motion.tr key={sid.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {revealed.has(sid.id) ? sid.code : sid.masked}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{sid.electionTitle || elections.find(e => e.id === sid.electionId)?.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${sid.isRevoked ? 'bg-red-100 text-red-700' : sid.isUsed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sid.isRevoked ? 'Revoked' : sid.isUsed ? 'Used' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(sid.generatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sid.usedAt ? new Date(sid.usedAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleReveal(sid.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title={revealed.has(sid.id) ? 'Hide' : 'Reveal'}>
                          {revealed.has(sid.id) ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-primary" />}
                        </button>
                        {!sid.isRevoked && !sid.isUsed && (
                          <>
                            <button onClick={() => regenerateSecretId(sid.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Regenerate">
                              <RefreshCw size={14} className="text-amber-600" />
                            </button>
                            <button onClick={() => revokeSecretId(sid.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors" title="Revoke">
                              <XCircle size={14} className="text-destructive" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
