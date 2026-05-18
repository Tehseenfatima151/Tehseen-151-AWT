import { useElectionStore } from '../../store/electionStore';
import { useNotificationStore } from '../../store/notificationStore';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { authService } from '../../services/authService';
import { useState, useEffect } from 'react';
import { StatCard, PageHeader, StatusBadge, SkeletonCard } from '../../components/common/UIComponents';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Vote, ShieldCheck, AlertTriangle, TrendingUp, ClipboardList, CheckCircle2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const participationData = [
  { month: 'Jun', votes: 4200 }, { month: 'Jul', votes: 7800 }, { month: 'Aug', votes: 5500 },
  { month: 'Sep', votes: 9100 }, { month: 'Oct', votes: 12400 }, { month: 'Nov', votes: 8700 },
];
const electionsByCategory = [
  { name: 'Government', value: 38, color: '#3525cd' }, { name: 'Corporate', value: 29, color: '#8b1ada' },
  { name: 'Education', value: 21, color: '#0ea5e9' }, { name: 'Community', value: 12, color: '#10b981' },
];
const fraudData = [
  { day: 'Mon', alerts: 2 }, { day: 'Tue', alerts: 0 }, { day: 'Wed', alerts: 5 },
  { day: 'Thu', alerts: 1 }, { day: 'Fri', alerts: 3 }, { day: 'Sat', alerts: 0 }, { day: 'Sun', alerts: 1 },
];

export default function AdminDashboard() {
  const { elections, requests } = useElectionStore();
  const { notifications } = useNotificationStore();

  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    authService.getAllProfiles().then(profiles => setTotalUsers(profiles.length));
  }, []);

  const activeElections  = elections.filter(e => e.status === 'active');
  const pendingRequests  = elections.filter(e => e.status === 'pending'); // elections awaiting admin approval
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const stats = [
    { label: 'Total Elections', value: elections.length, icon: <Vote size={22} />, trend: { value: '+4 this month', positive: true } },
    { label: 'Active Elections', value: activeElections.length, icon: <Activity size={22} />, color: 'text-emerald-600' },
    { label: 'Total Users', value: totalUsers, icon: <Users size={22} />, trend: { value: '+12% from last month', positive: true } },
    { label: 'Pending Requests', value: pendingRequests.length, icon: <ClipboardList size={22} />, color: 'text-amber-600' },
    { label: 'Security Health', value: '99.8%', icon: <ShieldCheck size={22} />, color: 'text-emerald-600' },
    { label: 'Fraud Alerts', value: 3, icon: <AlertTriangle size={22} />, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        subtitle="Monitoring global election integrity across all nodes."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
            </span>
          </div>
        }
      />

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.05 }} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation Trend */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">Participation Trend</h3>
              <p className="text-xs text-muted-foreground">Total votes cast per month</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={participationData}>
              <defs>
                <linearGradient id="voteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3525cd" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3525cd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="votes" stroke="#3525cd" strokeWidth={2.5} fill="url(#voteGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Elections by Category */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-foreground mb-1">Elections by Category</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution across sectors</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={electionsByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                {electionsByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {electionsByCategory.map(c => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted-foreground font-medium">{c.name}</span>
                </div>
                <span className="font-bold text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Pending Election Requests</h3>
            <Link to="/admin/elections/requests" className="text-xs text-primary font-bold hover:underline">View All</Link>
          </div>
          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {requests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-bold">{req.creatorName}</p>
                    <p className="text-xs text-muted-foreground">{req.organization}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="pending" />
                    <Link to="/admin/elections/requests" className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-lg font-bold hover:opacity-90">Review</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recent Activity</h3>
            <Link to="/admin/audit-logs" className="text-xs text-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {MOCK_AUDIT_LOGS.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.isAdminOverride ? 'bg-amber-500' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{log.description}</p>
                  <p className="text-xs text-muted-foreground">{log.userName} · {new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
                {log.isAdminOverride && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shrink-0">OVERRIDE</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud Detection Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Fraud Detection – This Week</h3>
            <p className="text-xs text-muted-foreground">Real-time suspicious activity analysis</p>
          </div>
          <Link to="/admin/security/fraud" className="text-xs text-primary font-bold hover:underline">View Details</Link>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={fraudData} barSize={20}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            <Bar dataKey="alerts" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
