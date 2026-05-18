import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { PageHeader, EmptyState, CountdownTimer } from '../../components/common/UIComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Trophy, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3525cd', '#8b1ada', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function LiveResults() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const [selectedId, setSelectedId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const myActive = elections.filter(e => e.creatorId === user?.id && ['active', 'completed'].includes(e.status));
  const selected = myActive.find(e => e.id === selectedId) || myActive[0];
  const candidates = selected?.candidates || [];
  const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);
  const winner = [...candidates].sort((a, b) => b.voteCount - a.voteCount)[0];

  const chartData = candidates.map(c => ({
    name: c.name.split(' ').slice(-1)[0],
    fullName: c.name,
    votes: c.voteCount,
    pct: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0',
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Live Results" subtitle="Real-time vote counts and candidate rankings." breadcrumbs={[{ label: 'Creator' }, { label: 'Live Results' }]}
        actions={
          <div className="flex items-center gap-2">
            <select value={selected?.id || ''} onChange={e => setSelectedId(e.target.value)} className="px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none">
              {myActive.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <button onClick={handleRefresh} className={`p-2 border border-border rounded-xl hover:bg-muted transition-colors ${refreshing ? 'animate-spin' : ''}`}>
              <RefreshCw size={16} />
            </button>
          </div>
        }
      />

      {myActive.length === 0 ? (
        <EmptyState title="No active elections" description="Results appear here for active or completed elections." icon="📊" />
      ) : selected && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Total Votes', totalVotes.toLocaleString(), 'text-primary'],
              ['Turnout', `${selected.turnoutPercentage.toFixed(1)}%`, 'text-emerald-600'],
              ['Status', selected.status === 'active' ? 'Live' : 'Final', selected.status === 'active' ? 'text-emerald-600' : 'text-purple-600'],
            ].map(([l, v, c]) => (
              <div key={l as string} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className={`text-2xl font-black ${c}`}>{v as string}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">{l as string}</p>
              </div>
            ))}
          </div>

          {selected.status === 'active' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Election is live · Ends in <CountdownTimer endDate={selected.endDate} />
            </div>
          )}

          {/* Winner Banner */}
          {selected.status === 'completed' && winner && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Trophy size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-0.5">🏆 Winner Declared</p>
                <p className="font-black text-xl text-foreground">{winner.name}</p>
                <p className="text-sm text-muted-foreground">{winner.voteCount.toLocaleString()} votes · {chartData.find(c => c.fullName === winner.name)?.pct}%</p>
              </div>
            </motion.div>
          )}

          {/* Bar Chart */}
          {totalVotes > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Vote Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }}
                    formatter={(v: any, _n: any, p: any) => [`${v} votes (${p.payload.pct}%)`, 'Votes']}
                    labelFormatter={(_: any, p: any) => p[0]?.payload?.fullName || ''} />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {chartData.map((_entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Candidate Rankings */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border"><h3 className="font-bold">Candidate Rankings</h3></div>
            <div className="divide-y divide-border">
              {[...candidates].sort((a, b) => b.voteCount - a.voteCount).map((c, i) => {
                const pct = totalVotes > 0 ? (c.voteCount / totalVotes) * 100 : 0;
                return (
                  <div key={c.id} className="p-4 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${i === 0 && selected.status === 'completed' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                      {i === 0 && selected.status === 'completed' ? '🥇' : `#${i + 1}`}
                    </div>
                    <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-foreground">{c.voteCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">votes</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
