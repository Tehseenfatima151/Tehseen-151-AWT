import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useElectionStore } from '../../store/electionStore';
import { useAuthStore } from '../../store/authStore';
import { StatusBadge, CountdownTimer } from '../../components/common/UIComponents';
import { Users, Calendar, Shield, ArrowRight, RefreshCw } from 'lucide-react';

export default function ElectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { elections, fetchElections, isLoading } = useElectionStore();
  const { user } = useAuthStore();

  // Fetch elections on mount if store is empty or election not found
  useEffect(() => {
    if (elections.length === 0) fetchElections();
  }, []);

  const election = elections.find(e => e.id === id);

  if (isLoading && !election) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <RefreshCw size={32} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-muted-foreground font-semibold">Loading election details...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🗳️</div>
        <h2 className="text-2xl font-bold mb-2">Election Not Found</h2>
        <p className="text-muted-foreground mb-4 text-sm">This election may not exist or is not publicly visible yet.</p>
        <Link to="/" className="mt-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl">Go Home</Link>
      </div>
    );
  }

  const totalVotes = election.candidates.reduce((s, c) => s + c.voteCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={election.status} dot={election.status === 'active'} />
          <span className="text-sm text-muted-foreground capitalize">{election.category}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">{election.title}</h1>
        <p className="text-muted-foreground">{election.organization}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Registered Voters', `${election.currentVoters.toLocaleString()} / ${election.maxVoters.toLocaleString()}`, Users],
          ['Start Date', new Date(election.startDate).toLocaleDateString(), Calendar],
          ['End Date', new Date(election.endDate).toLocaleDateString(), Calendar],
          ['Security', election.requireSecretId ? 'Secret ID Required' : 'Open', Shield],
        ].map(([l, v, Icon]) => (
          <div key={l as string} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">{l as string}</p>
            <p className="font-bold text-sm">{v as string}</p>
          </div>
        ))}
      </div>

      {election.status === 'active' && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Election closes in <CountdownTimer endDate={election.endDate} />
        </div>
      )}

      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">{election.description}</p>
      </div>

      <div>
        <h2 className="text-xl font-black mb-4">Candidates ({election.candidates.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {election.candidates.map(c => {
            const pct = totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0';
            return (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
                <img src={c.photo} alt={c.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-xs text-primary font-semibold mb-2">{c.designation}</p>
                  {election.status === 'completed' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span>{c.voteCount} votes</span><span>{pct}%</span></div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        {user ? (
          <Link to={election.status === 'active' ? `/voter/vote/${election.id}` : '/voter/dashboard'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black text-lg rounded-2xl hover:opacity-90 shadow-xl shadow-primary/20">
            {election.status === 'active' ? 'Cast My Vote' : 'Go to Dashboard'} <ArrowRight size={20} />
          </Link>
        ) : (
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black text-lg rounded-2xl hover:opacity-90 shadow-xl shadow-primary/20">
            Register to Vote <ArrowRight size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}
