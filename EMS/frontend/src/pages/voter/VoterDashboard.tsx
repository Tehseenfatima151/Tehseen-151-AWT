import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Calendar, Trophy, Key, History, Bell, Vote, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { useNotificationStore } from '../../store/notificationStore';
import { PageHeader, StatCard, StatusBadge, CountdownTimer } from '../../components/common/UIComponents';
import { useEffect, useState } from 'react';

export default function VoterDashboard() {
  const { user } = useAuthStore();
  const { elections, fetchElections } = useElectionStore();
  const { registrations, fetchMyData, joinElection } = useVotingStore();
  const { getUserNotifications, addNotification } = useNotificationStore();

  const [joining, setJoining] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmWaitlistElection, setConfirmWaitlistElection] = useState<any | null>(null);

  // Fetch fresh data on mount and poll for time-based auto-progression
  useEffect(() => {
    fetchElections();
    if (user?.id) fetchMyData(user.id);

    // Poll every 15 seconds to check if any election has crossed its start/end time
    const interval = setInterval(() => {
      fetchElections();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const myRegs = registrations.filter(r => r.userId === user?.id);
  const myElectionIds = myRegs.map(r => r.electionId);
  const myElections = elections.filter(e => myElectionIds.includes(e.id));
  
  // Show ALL available active and upcoming elections
  const activeElections = elections.filter(e => e.status === 'active');
  const upcomingElections = elections.filter(e => e.status === 'approved');
  const votedElections = myRegs.filter(r => r.status === 'voted');
  
  const notifications = user ? getUserNotifications(user.id) : [];
  const unread = notifications.filter(n => !n.isRead).length;

  // Auto-generate notifications for upcoming and active elections
  useEffect(() => {
    if (!user) return;
    
    // Notifications for Upcoming
    upcomingElections.forEach(e => {
      const title = `Upcoming Election: ${e.title}`;
      const hasNotified = notifications.some(n => n.title === title);
      
      if (!hasNotified) {
        const startDate = new Date(e.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        addNotification({
          userId: user.id,
          type: 'info',
          title,
          message: `Get ready! "${e.title}" is starting on ${startDate}. Make sure you are registered to vote.`,
        });
      }
    });

    // Notifications for Active
    activeElections.forEach(e => {
      const title = `Active Election: ${e.title}`;
      const hasNotified = notifications.some(n => n.title === title);
      
      if (!hasNotified) {
        addNotification({
          userId: user.id,
          type: 'success',
          title,
          message: `The election "${e.title}" is now LIVE! Cast your vote before time runs out.`,
        });
      }
    });
  }, [upcomingElections.length, activeElections.length, user?.id]);

  const handleJoin = async (electionId: string) => {
    if (!user) return;
    setJoining(electionId);
    const result = await joinElection(electionId, user.id, user.name, user.email);
    setJoining(null);
    if (result.success) {
      setMsg(result.status === 'waitlisted' ? 'Added to waitlist.' : 'Registered successfully!');
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle="Your personalized voting hub — stay informed and cast your vote."
        breadcrumbs={[{ label: 'Voter' }, { label: 'Dashboard' }]}
      />

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Elections', value: myElections.length, icon: <Vote size={20} /> },
          { label: 'Active Now', value: activeElections.length, icon: <Zap size={20} />, color: 'text-emerald-600' },
          { label: 'Votes Cast', value: votedElections.length, icon: <CheckCircle2 size={20} />, color: 'text-primary' },
          { label: 'Upcoming', value: upcomingElections.length, icon: <Calendar size={20} />, color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-foreground">Active Elections</h3>
            </div>
            <Link to="/voter/elections/active" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {activeElections.slice(0, 3).map(e => {
              const reg = myRegs.find(r => r.electionId === e.id);
              const hasVoted = reg?.status === 'voted';
              const isRegistered = reg?.status === 'registered';
              const isWaitlisted = reg?.status === 'waitlisted';

              return (
                <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={hasVoted ? 'voted' : 'active'} dot={!hasVoted} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">{e.category}</span>
                    </div>
                    <h4 className="font-bold text-foreground truncate">{e.title}</h4>
                    <p className="text-sm text-muted-foreground">{e.organization} · {e.candidates.length} candidates</p>
                    {!hasVoted && e.endDate && <p className="text-xs text-primary font-semibold mt-1">Ends: <CountdownTimer endDate={e.endDate} /></p>}
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    {hasVoted && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold shrink-0">
                        <CheckCircle2 size={16} /> Voted
                      </div>
                    )}
                    {isWaitlisted && (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm rounded-xl">
                        <Clock size={14} /> Waitlisted
                      </span>
                    )}
                    {isRegistered && !hasVoted && (
                      <Link to={`/voter/vote/${e.id}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 shrink-0">
                        <Zap size={16} /> Cast Vote
                      </Link>
                    )}
                    {!reg && (
                      e.currentVoters < e.maxVoters ? (
                        <button onClick={() => handleJoin(e.id)} disabled={joining === e.id}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 shrink-0">
                          {joining === e.id ? 'Joining...' : 'Register to Vote'}
                        </button>
                      ) : e.isWaitlistEnabled ? (
                        <button onClick={() => setConfirmWaitlistElection(e)} disabled={joining === e.id}
                          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 shrink-0">
                          {joining === e.id ? 'Joining...' : 'Join Waitlist'}
                        </button>
                      ) : (
                        <button disabled
                          className="flex items-center gap-2 px-5 py-2.5 bg-muted text-muted-foreground font-bold rounded-xl text-sm shrink-0 cursor-not-allowed border border-border">
                          Capacity Reached
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Secret IDs', href: '/voter/secret-ids', icon: Key, color: 'from-primary/10 to-primary/5 text-primary border-primary/20' },
          { label: 'Voting History', href: '/voter/history', icon: History, color: 'from-purple-50 to-purple-50/50 text-purple-700 border-purple-200' },
          { label: 'View Results', href: '/voter/results', icon: Trophy, color: 'from-amber-50 to-amber-50/50 text-amber-700 border-amber-200' },
          { label: 'Notifications', href: '/voter/notifications', icon: Bell, color: 'from-blue-50 to-blue-50/50 text-blue-700 border-blue-200' },
        ].map(item => (
          <Link key={item.href} to={item.href}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br border font-semibold text-sm hover:shadow-md transition-all text-center ${item.color}`}>
            <item.icon size={22} />
            {item.label}
            {item.label === 'Notifications' && unread > 0 && <span className="text-xs bg-destructive text-white px-1.5 py-0.5 rounded-full font-black">{unread}</span>}
          </Link>
        ))}
      </div>

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between gap-4">
            <h3 className="font-bold">Upcoming Elections</h3>
            <Link to="/voter/elections/upcoming" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingElections.slice(0, 3).map(e => {
              const reg = myRegs.find(r => r.electionId === e.id);
              
              return (
                <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm mb-1">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.organization} · Starts {new Date(e.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {reg ? (
                      <StatusBadge status={reg.status === 'waitlisted' ? 'waitlisted' : 'registered'} />
                    ) : (
                      e.currentVoters < e.maxVoters ? (
                        <button onClick={() => handleJoin(e.id)} disabled={joining === e.id}
                          className="px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-all disabled:opacity-60">
                          {joining === e.id ? 'Joining...' : 'Register'}
                        </button>
                      ) : e.isWaitlistEnabled ? (
                        <button onClick={() => setConfirmWaitlistElection(e)} disabled={joining === e.id}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20">
                          {joining === e.id ? 'Joining...' : 'Join Waitlist'}
                        </button>
                      ) : (
                        <button disabled
                          className="px-4 py-2 bg-muted text-muted-foreground border border-border font-bold text-sm rounded-xl cursor-not-allowed">
                          Capacity Reached
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeElections.length === 0 && upcomingElections.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
          <div className="text-5xl mb-4">🗳️</div>
          <h3 className="font-bold text-lg mb-2 text-foreground">No elections available</h3>
          <p className="text-sm">There are no active or upcoming elections at the moment. Check back later.</p>
        </div>
      )}

      {confirmWaitlistElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-amber-200 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <Clock size={24} />
              </div>
              <h4 className="font-bold text-lg">Join Election Waitlist</h4>
            </div>
            
            <p className="text-sm text-muted-foreground">
              The election <strong>{confirmWaitlistElection.title}</strong> has reached its registration capacity of <strong>{confirmWaitlistElection.maxVoters}</strong> voters.
            </p>
            
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-semibold">⚠️ Waitlist Terms:</p>
              <p>• You will be placed on the queue as #{(confirmWaitlistElection.waitlistCount || 0) + 1}.</p>
              <p>• If an existing registered voter leaves or is removed, you will be automatically promoted.</p>
              <p>• You will receive a notification if you are activated.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmWaitlistElection(null)}
                className="px-4 py-2 border border-border text-sm font-semibold rounded-xl hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const electionId = confirmWaitlistElection.id;
                  setConfirmWaitlistElection(null);
                  handleJoin(electionId);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                Confirm & Join Waitlist
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
