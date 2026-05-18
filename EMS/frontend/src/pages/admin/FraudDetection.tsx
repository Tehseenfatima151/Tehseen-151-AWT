import { useState } from 'react';
import { AlertTriangle, AlertOctagon, Eye, Download, Search, Filter } from 'lucide-react';
import { PageHeader, StatCard, EmptyState } from '../../components/common/UIComponents';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const fraudTrend = [
  { time: '00:00', alerts: 1 }, { time: '04:00', alerts: 0 }, { time: '08:00', alerts: 3 },
  { time: '12:00', alerts: 7 }, { time: '16:00', alerts: 5 }, { time: '20:00', alerts: 2 }, { time: '24:00', alerts: 1 },
];

const FRAUD_ALERTS = [
  { id: 'fa-01', type: 'Brute Force', severity: 'high', ip: '45.33.32.156', description: '15 failed login attempts in 3 minutes', time: '2 min ago', status: 'active' },
  { id: 'fa-02', type: 'Duplicate Vote Attempt', severity: 'critical', ip: '192.168.4.22', description: 'Voter tried to cast a second vote in election elec-001', time: '18 min ago', status: 'blocked' },
  { id: 'fa-03', type: 'Bot Traffic', severity: 'medium', ip: '104.21.55.203', description: 'Automated scraping detected on election listing API', time: '1 hr ago', status: 'monitoring' },
  { id: 'fa-04', type: 'Invalid Secret ID', severity: 'medium', ip: '172.16.0.55', description: '8 failed secret ID verifications for election elec-002', time: '2 hr ago', status: 'resolved' },
  { id: 'fa-05', type: 'XSS Attempt', severity: 'high', ip: '198.51.100.42', description: 'Script injection detected in candidate manifesto form', time: '3 hr ago', status: 'blocked' },
];

const severityStyle: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
};
const statusStyle: Record<string, string> = {
  active: 'text-red-600', blocked: 'text-emerald-600', monitoring: 'text-amber-600', resolved: 'text-muted-foreground',
};

export default function FraudDetection() {
  const [search, setSearch] = useState('');
  const filtered = FRAUD_ALERTS.filter(a =>
    a.type.toLowerCase().includes(search.toLowerCase()) || a.ip.includes(search)
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Fraud Detection" subtitle="Real-time analysis of suspicious activity across the platform." breadcrumbs={[{ label: 'Admin' }, { label: 'Security' }, { label: 'Fraud Detection' }]} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Alerts" value={2} icon={<AlertTriangle size={20} />} color="text-red-500" />
        <StatCard label="Blocked IPs" value={7} icon={<AlertOctagon size={20} />} color="text-orange-600" />
        <StatCard label="Resolved Today" value={12} icon={<Eye size={20} />} color="text-emerald-600" />
        <StatCard label="Fraud Score" value="Low" icon={<AlertTriangle size={20} />} color="text-emerald-600" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-4">Alert Frequency – Today</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={fraudTrend}>
            <defs>
              <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            <Area type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} fill="url(#fraudGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-bold">Security Alerts</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 w-52" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(alert => (
            <motion.div key={alert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <AlertOctagon size={18} className={alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{alert.type}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${severityStyle[alert.severity]}`}>{alert.severity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">IP: {alert.ip} · {alert.time}</p>
                </div>
              </div>
              <span className={`text-xs font-bold capitalize shrink-0 ${statusStyle[alert.status]}`}>{alert.status}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
