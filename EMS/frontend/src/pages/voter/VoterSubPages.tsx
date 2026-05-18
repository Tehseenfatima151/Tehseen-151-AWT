// All voter sub-pages in one file — fully functional
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { PageHeader, StatusBadge, EmptyState } from '../../components/common/UIComponents';
import {
  ArrowRight, Eye, EyeOff, Calendar, Building2,
  Users, Clock, CheckCircle2, Zap, Trophy,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// ── helper: format date nicely ──────────────────────────────
const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Election Card used in multiple pages ────────────────────
function ElectionCard({
  election,
  registrationStatus,   // 'registered' | 'voted' | 'waitlisted' | null
  onJoin,
  joining,
  showVoteBtn = false,
}: {
  election: any;
  registrationStatus: string | null;
  onJoin?: () => void;
  joining?: boolean;
  showVoteBtn?: boolean;
}) {
  const isActive   = election.status === 'active';
  const isApproved = election.status === 'approved';
  const pct = election.maxVoters > 0
    ? Math.round((election.currentVoters / election.maxVoters) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-2xl border-2 p-5 hover:shadow-md transition-all ${
        isActive ? 'border-emerald-200' : 'border-border'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {isActive && <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-emerald-500 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE</span>}
            {isApproved && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">Upcoming</span>}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">{election.category}</span>
          </div>
          <h3 className="font-bold text-foreground truncate mb-1">{election.title}</h3>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
            {election.organization && (
              <span className="flex items-center gap-1"><Building2 size={11} className="text-primary" />{election.organization}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-primary" />
              {fmt(election.startDate)} → {fmt(election.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} className="text-primary" />
              {election.currentVoters}/{election.maxVoters} voters
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">{pct}% capacity filled</p>
        </div>

        {/* Action button */}
        <div className="flex flex-col gap-2 shrink-0">
          {registrationStatus === 'voted' && (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-xl">
              <CheckCircle2 size={14} /> Voted ✓
            </span>
          )}
          {registrationStatus === 'registered' && showVoteBtn && isActive && (
            <Link
              to={`/voter/vote/${election.id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Zap size={14} /> Cast Vote
            </Link>
          )}
          {registrationStatus === 'registered' && !showVoteBtn && (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-bold text-sm rounded-xl">
              <CheckCircle2 size={14} /> Registered
            </span>
          )}
          {registrationStatus === 'waitlisted' && (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm rounded-xl">
              <Clock size={14} /> Waitlisted
            </span>
          )}
          {registrationStatus === null && (
            <button
              onClick={onJoin}
              disabled={joining}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
            >
              {joining ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Joining...</> : <>Register <ArrowRight size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── MyElectionsVoter ────────────────────────────────────────
export function MyElectionsVoter() {
  const { user } = useAuthStore();
  const { elections, fetchElections } = useElectionStore();
  const { registrations, fetchMyData } = useVotingStore();

  useEffect(() => {
    fetchElections();
    if (user?.id) fetchMyData(user.id);
  }, []);

  const myRegs = registrations.filter(r => r.userId === user?.id);
  const myElections = elections.filter(e => myRegs.some(r => r.electionId === e.id));

  return (
    <div className="space-y-5">
      <PageHeader title="My Elections" subtitle="All elections you are registered for." breadcrumbs={[{ label: 'Voter' }, { label: 'My Elections' }]} />
      {myElections.length === 0 ? (
        <EmptyState
          title="No elections yet"
          description="Browse elections and register to participate."
          icon="🗳️"
          action={<Link to="/voter/elections/upcoming" className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm">Browse Elections</Link>}
        />
      ) : (
        <div className="space-y-3">
          {myElections.map(e => {
            const reg = myRegs.find(r => r.electionId === e.id);
            return (
              <ElectionCard
                key={e.id}
                election={e}
                registrationStatus={reg?.status ?? 'registered'}
                showVoteBtn
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ActiveVoting ────────────────────────────────────────────
export function ActiveVoting() {
  const { user } = useAuthStore();
  const { elections, fetchElections } = useElectionStore();
  const { registrations, joinElection, fetchMyData } = useVotingStore();
  const [joining, setJoining] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchElections();
    if (user?.id) fetchMyData(user.id);
  }, []);

  const myRegs = registrations.filter(r => r.userId === user?.id);
  // Show ALL active elections — registered or not
  const active = elections.filter(e => e.status === 'active');

  const handleJoin = async (electionId: string) => {
    if (!user) return;
    setJoining(electionId);
    const result = await joinElection(electionId, user.id, user.name, user.email);
    setJoining(null);
    if (result.success) {
      setMsg(result.status === 'waitlisted' ? 'You have been added to the waitlist.' : 'Registered! You can now vote.');
    }
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Active Voting" subtitle="Elections currently open — register and cast your vote." breadcrumbs={[{ label: 'Voter' }, { label: 'Active' }]} />
      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}
      {active.length === 0 ? (
        <EmptyState title="No active elections" description="No elections are currently open for voting. Check back soon." icon="⚡" />
      ) : (
        <div className="space-y-3">
          {active.map(e => {
            const reg = myRegs.find(r => r.electionId === e.id);
            return (
              <ElectionCard
                key={e.id}
                election={e}
                registrationStatus={reg?.status ?? null}
                onJoin={() => handleJoin(e.id)}
                joining={joining === e.id}
                showVoteBtn
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── UpcomingElections ────────────────────────────────────────
export function UpcomingElections() {
  const { user } = useAuthStore();
  const { elections, fetchElections } = useElectionStore();
  const { registrations, joinElection, fetchMyData } = useVotingStore();
  const [joining, setJoining] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchElections();
    if (user?.id) fetchMyData(user.id);
  }, []);

  const myRegs = registrations.filter(r => r.userId === user?.id);
  // Show ALL approved elections (not yet started) — voter can register for them
  const upcoming = elections.filter(e => e.status === 'approved' || e.status === 'active');

  const handleJoin = async (electionId: string) => {
    if (!user) return;
    setJoining(electionId);
    const result = await joinElection(electionId, user.id, user.name, user.email);
    setJoining(null);
    if (result.success) {
      setMsg(result.status === 'waitlisted' ? 'You are now on the waitlist.' : 'Registered successfully! You can vote when it goes live.');
    }
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Upcoming Elections"
        subtitle="Browse all available elections — register now to secure your spot."
        breadcrumbs={[{ label: 'Voter' }, { label: 'Upcoming' }]}
      />
      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}
      {upcoming.length === 0 ? (
        <EmptyState
          title="No elections available"
          description="No elections are currently open for registration. Check back soon."
          icon="📅"
        />
      ) : (
        <div className="space-y-3">
          {upcoming.map(e => {
            const reg = myRegs.find(r => r.electionId === e.id);
            return (
              <ElectionCard
                key={e.id}
                election={e}
                registrationStatus={reg?.status ?? null}
                onJoin={() => handleJoin(e.id)}
                joining={joining === e.id}
                showVoteBtn={e.status === 'active'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CompletedElectionsVoter ────────────────────────────────
export function CompletedElectionsVoter() {
  const { user } = useAuthStore();
  const { elections, fetchElections } = useElectionStore();
  const { registrations, fetchMyData } = useVotingStore();

  useEffect(() => {
    fetchElections();
    if (user?.id) fetchMyData(user.id);
  }, []);

  const myRegs = registrations.filter(r => r.userId === user?.id);
  const completed = elections.filter(e => e.status === 'completed' && myRegs.some(r => r.electionId === e.id));

  return (
    <div className="space-y-5">
      <PageHeader title="Completed Elections" subtitle="Elections that have concluded." breadcrumbs={[{ label: 'Voter' }, { label: 'Completed' }]} />
      {completed.length === 0 ? (
        <EmptyState title="No completed elections" description="Elections you participated in will appear here after they conclude." icon="🏆" />
      ) : (
        <div className="space-y-3">
          {completed.map(e => {
            const reg = myRegs.find(r => r.electionId === e.id);
            const winner = [...e.candidates].sort((a, b) => b.voteCount - a.voteCount)[0];
            return (
              <div key={e.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <StatusBadge status="completed" />
                    <h3 className="font-bold mt-2 truncate">{e.title}</h3>
                    <p className="text-sm text-muted-foreground">{e.organization}</p>
                    {reg?.voteHash && (
                      <p className="font-mono text-xs text-muted-foreground mt-2 break-all">Receipt: {reg.voteHash}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {winner && (
                      <>
                        <p className="text-xs text-muted-foreground">🏆 Winner</p>
                        <p className="font-bold text-sm">{winner.name}</p>
                        <p className="text-xs text-primary">{winner.voteCount} votes</p>
                      </>
                    )}
                    {reg?.status === 'voted' && (
                      <span className="inline-flex mt-2 items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 size={12} /> Voted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SecretIdsVoter ──────────────────────────────────────────
export function SecretIdsVoter() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { secretIds, fetchMyData } = useVotingStore();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) fetchMyData(user.id);
  }, []);

  const mine = secretIds.filter(s => s.userId === user?.id);
  const toggle = (id: string) =>
    setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-5">
      <PageHeader title="My Secret IDs" subtitle="Your unique voter secret IDs for each election." breadcrumbs={[{ label: 'Voter' }, { label: 'Secret IDs' }]} />
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
        🔐 Your Secret IDs are encrypted and unique. Never share them with anyone. Each ID can only be used once.
      </div>
      {mine.length === 0 ? (
        <EmptyState
          title="No Secret IDs"
          description="Register for an election to receive your Secret ID. Secret IDs are assigned when you register."
          icon="🔑"
          action={
            <Link to="/voter/elections/upcoming" className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm">
              Browse Elections
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {mine.map(sid => {
            const election = elections.find(e => e.id === sid.electionId);
            return (
              <div key={sid.id} className={`p-5 rounded-2xl border-2 transition-all ${
                sid.isUsed ? 'border-emerald-200 bg-emerald-50/50' :
                sid.isRevoked ? 'border-red-200 bg-red-50/50' :
                'border-primary/20 bg-primary/5'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold mb-0.5">
                      {election?.title || sid.electionTitle || 'Unknown Election'}
                    </p>
                    <p className="font-mono font-black text-xl tracking-widest mb-2">
                      {revealed.has(sid.id) ? sid.code : sid.masked}
                    </p>
                    <StatusBadge status={sid.isRevoked ? 'blocked' : sid.isUsed ? 'voted' : 'registered'} />
                  </div>
                  {!sid.isRevoked && (
                    <button
                      onClick={() => toggle(sid.id)}
                      className="p-2.5 hover:bg-white/70 rounded-xl transition-colors"
                    >
                      {revealed.has(sid.id)
                        ? <EyeOff size={18} className="text-muted-foreground" />
                        : <Eye size={18} className="text-primary" />
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── VotingHistory ────────────────────────────────────────────
export function VotingHistory() {
  const { user } = useAuthStore();
  const { elections, fetchElections } = useElectionStore();
  const { registrations, fetchMyData } = useVotingStore();

  useEffect(() => {
    fetchElections();
    if (user?.id) fetchMyData(user.id);
  }, []);

  const voted = registrations.filter(r => r.userId === user?.id && r.status === 'voted');

  return (
    <div className="space-y-5">
      <PageHeader title="Voting History" subtitle="A record of all elections you have voted in." breadcrumbs={[{ label: 'Voter' }, { label: 'History' }]} />
      {voted.length === 0 ? (
        <EmptyState title="No votes yet" description="Your voting history will appear here after you cast votes." icon="📜" />
      ) : (
        <div className="space-y-3">
          {voted.map(r => {
            const election = elections.find(e => e.id === r.electionId);
            return (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{election?.title || r.electionId}</h3>
                    <p className="text-sm text-muted-foreground">{election?.organization}</p>
                    {r.voteHash && (
                      <p className="font-mono text-xs text-muted-foreground mt-2 break-all">
                        Receipt: {r.voteHash}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Voted
                    </span>
                    {r.votedAt && <p className="text-xs text-muted-foreground mt-2">{new Date(r.votedAt).toLocaleDateString()}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ResultsVoter ─────────────────────────────────────────────
export function ResultsVoter() {
  const { elections, fetchElections } = useElectionStore();
  const { registrations } = useVotingStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchElections(); }, []);

  const myRegs = registrations.filter(r => r.userId === user?.id);
  const completed = elections.filter(e => e.status === 'completed');

  return (
    <div className="space-y-5">
      <PageHeader title="Results" subtitle="View final results for completed elections." breadcrumbs={[{ label: 'Voter' }, { label: 'Results' }]} />
      {completed.length === 0 ? (
        <EmptyState title="No results yet" description="Results will appear here once elections are completed." icon="📊" />
      ) : (
        <div className="space-y-6">
          {completed.map(e => {
            const total = e.candidates.reduce((s, c) => s + c.voteCount, 0);
            const winner = [...e.candidates].sort((a, b) => b.voteCount - a.voteCount)[0];
            const participated = myRegs.some(r => r.electionId === e.id);
            return (
              <div key={e.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-foreground">{e.title}</h3>
                    <p className="text-sm text-muted-foreground">{e.organization} · {total} total votes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {participated && <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">You Voted</span>}
                    <Trophy size={20} className="text-amber-500" />
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {[...e.candidates]
                    .sort((a, b) => b.voteCount - a.voteCount)
                    .map((c, idx) => {
                      const pct = total > 0 ? ((c.voteCount / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={c.id} className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            {idx === 0 && <span className="text-base">🥇</span>}
                            {idx === 1 && <span className="text-base">🥈</span>}
                            {idx === 2 && <span className="text-base">🥉</span>}
                            <span className="font-bold flex-1 truncate">{c.name}</span>
                            <span className="text-sm font-black text-primary">{pct}%</span>
                            <span className="text-xs text-muted-foreground shrink-0">{c.voteCount} votes</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
