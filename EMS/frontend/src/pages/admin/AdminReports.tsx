import { Download, FileText, BarChart3, Users, Vote } from 'lucide-react';
import { PageHeader, StatCard } from '../../components/common/UIComponents';
import { useElectionStore } from '../../store/electionStore';
import { MOCK_USERS } from '../../data/mockUsers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'Jan', elections: 8, voters: 1200 }, { month: 'Feb', elections: 12, voters: 1800 },
  { month: 'Mar', elections: 10, voters: 1500 }, { month: 'Apr', elections: 15, voters: 2400 },
  { month: 'May', elections: 20, voters: 3100 }, { month: 'Jun', elections: 18, voters: 2800 },
];

const REPORTS = [
  { name: 'Platform Analytics Report', desc: 'Full analytics including KPIs, trends, and user growth.', type: 'PDF', size: '2.4 MB' },
  { name: 'Election Activity Report', desc: 'Complete list of all elections with statuses and results.', type: 'CSV', size: '856 KB' },
  { name: 'User Management Report', desc: 'All registered users with roles and verification status.', type: 'PDF', size: '1.1 MB' },
  { name: 'Fraud & Security Report', desc: 'Security incidents, blocked IPs, and audit summary.', type: 'PDF', size: '780 KB' },
  { name: 'Vote Audit Report', desc: 'Anonymous vote records with timestamps and election IDs.', type: 'CSV', size: '3.2 MB' },
  { name: 'Financial Summary', desc: 'Billing and subscription revenue breakdown by creator.', type: 'XLSX', size: '450 KB' },
];

export default function AdminReports() {
  const { elections } = useElectionStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Generate and download platform-wide reports." breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Elections" value={elections.length} icon={<Vote size={20} />} />
        <StatCard label="Total Users" value={MOCK_USERS.length} icon={<Users size={20} />} />
        <StatCard label="Votes Cast" value="10,482" icon={<BarChart3 size={20} />} />
        <StatCard label="Reports Generated" value={24} icon={<FileText size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Monthly Elections Created</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={20}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
              <Bar dataKey="elections" fill="#3525cd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Voter Registration Growth</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
              <Line type="monotone" dataKey="voters" stroke="#8b1ada" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-bold">Available Reports</h3></div>
        <div className="divide-y divide-border">
          {REPORTS.map(r => (
            <div key={r.name} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.desc} · {r.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r.type}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-all">
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
