import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Vote, Users, Zap, Trophy, BarChart3, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { PageHeader, StatCard, StatusBadge, CountdownTimer } from '../../components/common/UIComponents';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const participationData = [
  { day: 'Mon', votes: 120 }, { day: 'Tue', votes: 280 }, { day: 'Wed', votes: 190 },
  { day: 'Thu', votes: 450 }, { day: 'Fri', votes: 380 }, { day: 'Sat', votes: 220 }, { day: 'Sun', votes: 150 },
];

export default function CreatorDashboard() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const myElections = elections.filter(e => e.creatorId === user?.id);
  const active = myElections.filter(e => e.status === 'active');
  const completed = myElections.filter(e => e.status === 'completed');
  const drafts = myElections.filter(e => e.status === 'draft');
  const totalVoters = myElections.reduce((s, e) => s + e.currentVoters, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle="Manage your elections and monitor real-time participation."
        breadcrumbs={[{ label: 'Creator' }, { label: 'Dashboard' }]}
        actions={
          <Link to="/creator/elections/create" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <PlusCircle size={16} /> Create Election
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Elections', value: myElections.length, icon: <Vote size={20} />, trend: { value: `${drafts.length} drafts`, positive: true } },
          { label: 'Active Now', value: active.length, icon: <Zap size={20} />, color: 'text-emerald-600' },
          { label: 'Total Voters', value: totalVoters.toLocaleString(), icon: <Users size={20} /> },
          { label: 'Completed', value: completed.length, icon: <Trophy size={20} />, color: 'text-purple-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-1">Voter Participation – This Week</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily votes across all active elections</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={participationData}>
              <defs>
                <linearGradient id="creatorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3525cd" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3525cd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
              <Area type="monotone" dataKey="votes" stroke="#3525cd" strokeWidth={2.5} fill="url(#creatorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Create New Election', href: '/creator/elections/create', icon: PlusCircle, color: 'bg-primary text-white' },
              { label: 'View Live Results', href: '/creator/results', icon: BarChart3, color: 'bg-emerald-600 text-white' },
              { label: 'Manage Candidates', href: '/creator/candidates', icon: Users, color: 'bg-purple-600 text-white' },
              { label: 'Check Waitlist', href: '/creator/waitlist', icon: Clock, color: 'bg-amber-600 text-white' },
            ].map(item => (
              <Link key={item.href} to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] ${item.color}`}>
                <item.icon size={16} /> {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Elections */}
      {active.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-bold">🔴 Live Elections</h3>
            <Link to="/creator/elections/active" className="text-xs text-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {active.map(e => (
              <div key={e.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status="active" dot /><span className="text-xs text-muted-foreground">{e.category}</span></div>
                  <h4 className="font-bold text-foreground">{e.title}</h4>
                  <p className="text-sm text-muted-foreground">{e.currentVoters}/{e.maxVoters} voters · Ends in <CountdownTimer endDate={e.endDate} /></p>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs mb-1 font-semibold text-muted-foreground">
                    <span>Turnout</span><span>{e.turnoutPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all" style={{ width: `${e.turnoutPercentage}%` }} />
                  </div>
                </div>
                <Link to="/creator/results" className="px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-colors shrink-0">
                  Live Results
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
