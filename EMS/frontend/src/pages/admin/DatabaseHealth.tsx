import { Database, HardDrive, Zap, CheckCircle2 } from 'lucide-react';
import { PageHeader, StatCard } from '../../components/common/UIComponents';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const dbData = [
  { time: '06:00', queries: 240, connections: 12 }, { time: '09:00', queries: 820, connections: 45 },
  { time: '12:00', queries: 1200, connections: 78 }, { time: '15:00', queries: 980, connections: 62 },
  { time: '18:00', queries: 750, connections: 41 }, { time: '21:00', queries: 430, connections: 22 },
];

const TABLES = [
  { name: 'elections', rows: '1,284', size: '4.2 MB', lastUpdate: '2 min ago', status: 'optimal' },
  { name: 'votes', rows: '10,482', size: '12.8 MB', lastUpdate: '5 sec ago', status: 'optimal' },
  { name: 'users', rows: '2,847', size: '3.1 MB', lastUpdate: '1 min ago', status: 'optimal' },
  { name: 'secret_ids', rows: '8,940', size: '6.4 MB', lastUpdate: '30 sec ago', status: 'optimal' },
  { name: 'audit_logs', rows: '94,210', size: '48.6 MB', lastUpdate: '1 sec ago', status: 'optimal' },
  { name: 'notifications', rows: '5,324', size: '2.8 MB', lastUpdate: '10 min ago', status: 'optimal' },
];

export default function DatabaseHealth() {
  return (
    <div className="space-y-6">
      <PageHeader title="Database Health" subtitle="Monitor VoteSphere database performance and table metrics." breadcrumbs={[{ label: 'Admin' }, { label: 'System' }, { label: 'DB Health' }]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="DB Status" value="Healthy" icon={<Database size={20} />} color="text-emerald-600" />
        <StatCard label="Total Size" value="78.2 MB" icon={<HardDrive size={20} />} />
        <StatCard label="Active Connections" value={41} icon={<Zap size={20} />} />
        <StatCard label="Avg Query Time" value="12ms" icon={<CheckCircle2 size={20} />} color="text-emerald-600" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-4">Query Volume – Today</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dbData}>
            <defs>
              <linearGradient id="dbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3525cd" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3525cd" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            <Area type="monotone" dataKey="queries" stroke="#3525cd" strokeWidth={2} fill="url(#dbGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-bold">Table Statistics</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Table', 'Rows', 'Size', 'Last Updated', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TABLES.map(t => (
                <tr key={t.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.rows}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.size}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.lastUpdate}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
