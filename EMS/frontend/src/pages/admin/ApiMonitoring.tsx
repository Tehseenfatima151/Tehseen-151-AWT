import { Activity, Server, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader, StatCard } from '../../components/common/UIComponents';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const latencyData = [
  { time: '00:00', ms: 45 }, { time: '04:00', ms: 38 }, { time: '08:00', ms: 72 },
  { time: '12:00', ms: 95 }, { time: '16:00', ms: 88 }, { time: '20:00', ms: 52 }, { time: '24:00', ms: 41 },
];

const ENDPOINTS = [
  { path: '/api/elections', method: 'GET', status: 'healthy', latency: '42ms', calls: '12.4K', uptime: '99.9%' },
  { path: '/api/votes', method: 'POST', status: 'healthy', latency: '89ms', calls: '8.2K', uptime: '99.7%' },
  { path: '/api/auth/login', method: 'POST', status: 'healthy', latency: '120ms', calls: '5.1K', uptime: '99.9%' },
  { path: '/api/secret-ids/verify', method: 'POST', status: 'healthy', latency: '65ms', calls: '3.8K', uptime: '100%' },
  { path: '/api/candidates', method: 'GET', status: 'healthy', latency: '38ms', calls: '9.7K', uptime: '99.9%' },
  { path: '/api/admin/users', method: 'GET', status: 'degraded', latency: '320ms', calls: '1.2K', uptime: '98.2%' },
];

export default function ApiMonitoring() {
  return (
    <div className="space-y-6">
      <PageHeader title="API Monitoring" subtitle="Real-time health and performance of all VoteSphere API endpoints." breadcrumbs={[{ label: 'Admin' }, { label: 'System' }, { label: 'API Monitoring' }]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="API Uptime" value="99.8%" icon={<Activity size={20} />} color="text-emerald-600" />
        <StatCard label="Avg Latency" value="78ms" icon={<Clock size={20} />} />
        <StatCard label="Total Calls Today" value="41.2K" icon={<Server size={20} />} />
        <StatCard label="Failed Requests" value={14} icon={<AlertTriangle size={20} />} color="text-amber-600" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-4">API Latency – Today (ms)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={latencyData}>
            <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            <Line type="monotone" dataKey="ms" stroke="#3525cd" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-bold">Endpoint Health</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Endpoint', 'Method', 'Status', 'Latency', 'Calls Today', 'Uptime'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ENDPOINTS.map(e => (
                <tr key={e.path} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm">{e.path}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${e.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{e.method}</span></td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${e.status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />{e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{e.latency}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.calls}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{e.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
