import { TrendingUp, CheckCircle, Users, Vote, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { motion } from 'framer-motion';

const mockChartData = [
  { name: 'Oct 01', value: 200 },
  { name: 'Oct 08', value: 180 },
  { name: 'Oct 15', value: 150 },
  { name: 'Oct 22', value: 220 },
  { name: 'Oct 30', value: 80 },
];

export default function AdminDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex items-center justify-between border border-border">
          <div>
            <p className="text-muted-foreground font-label-sm text-xs font-semibold uppercase tracking-widest mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-foreground">10,482</h3>
            <p className="text-xs text-primary flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp size={14} /> +12% from last month
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={24} />
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl flex items-center justify-between border border-border">
          <div>
            <p className="text-muted-foreground font-label-sm text-xs font-semibold uppercase tracking-widest mb-1">Active Elections</p>
            <h3 className="text-3xl font-bold text-foreground">150</h3>
            <p className="text-xs text-primary flex items-center gap-1 mt-1 font-semibold">
              <CheckCircle size={14} /> All systems operational
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <Vote size={24} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex items-center justify-between relative overflow-hidden border border-border border-l-4 border-l-primary">
          <div className="z-10">
            <p className="text-muted-foreground font-label-sm text-xs font-semibold uppercase tracking-widest mb-1">Security Health</p>
            <h3 className="text-3xl font-bold text-foreground">99.8%</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="w-[99.8%] h-full bg-primary shadow-[0_0_15px_rgba(53,37,205,0.3)]"></div>
              </div>
              <span className="text-[10px] font-bold text-primary tracking-wider">OPTIMAL</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary z-10">
            <ShieldCheck size={24} />
          </div>
          {/* Subtle Gradient Background for Health Card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fraud Detection Chart */}
        <div className="lg:col-span-8 glass-card rounded-xl p-6 md:p-8 border border-border flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-xl font-bold text-foreground">Fraud Detection</h4>
              <p className="text-muted-foreground text-sm font-medium">Real-time analysis of suspicious node traffic</p>
            </div>
            <select className="bg-card border border-border rounded-lg text-sm font-medium text-foreground p-2 outline-none focus:ring-2 focus:ring-primary">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 24 Hours</option>
            </select>
          </div>
          
          <div className="h-64 w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Alerts Feed */}
        <div className="lg:col-span-4 glass-card rounded-xl overflow-hidden flex flex-col border border-border">
          <div className="p-6 border-b border-border bg-card/50">
            <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="text-destructive" size={20} />
              Security Alerts
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <div className="p-4 border-b border-border hover:bg-primary/5 transition-colors cursor-pointer group">
              <div className="flex gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-destructive shrink-0 animate-pulse"></div>
                <div>
                  <p className="text-sm font-bold text-foreground">Brute Force Attempt</p>
                  <p className="text-xs text-muted-foreground font-medium">IP: 192.168.1.104 • Node #04</p>
                  <p className="text-[11px] text-muted-foreground mt-2 font-semibold">2 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-border hover:bg-primary/5 transition-colors cursor-pointer group">
              <div className="flex gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-foreground">System Update Required</p>
                  <p className="text-xs text-muted-foreground font-medium">Kernel patch available for Cluster-B</p>
                  <p className="text-[11px] text-muted-foreground mt-2 font-semibold">45 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-border hover:bg-primary/5 transition-colors cursor-pointer group">
              <div className="flex gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-foreground">New Admin Verified</p>
                  <p className="text-xs text-muted-foreground font-medium">Sarah Jenkins granted L2 access</p>
                  <p className="text-[11px] text-muted-foreground mt-2 font-semibold">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
          <button className="p-4 text-center text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors bg-card/50">
            View All Logs
          </button>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="glass-card rounded-xl overflow-hidden border border-border">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50">
          <h4 className="text-xl font-bold text-foreground">Pending Creator Approvals</h4>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors">Export CSV</button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">Approve All</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest border-b border-border">
              <tr>
                <th className="px-6 py-4">Requesting Body</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Verification Level</th>
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: 'City Council #401', person: 'Maria Rodriguez', level: 'Government', date: 'Oct 29, 2024', color: 'primary' },
                { name: 'Heritage High School', person: 'Derrick Vance', level: 'Educational', date: 'Oct 30, 2024', color: 'secondary' },
                { name: 'Technova Solutions', person: 'Liam O\'Brien', level: 'Corporate', date: 'Oct 30, 2024', color: 'accent' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                        ${row.color === 'primary' ? 'bg-primary/10 text-primary' : 
                          row.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-muted-foreground/10 text-muted-foreground'}
                      `}>
                        <Vote size={16} />
                      </div>
                      <span className="font-bold text-sm text-foreground">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.person}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase
                      ${row.color === 'primary' ? 'bg-primary/10 text-primary' : 
                          row.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-foreground'}
                    `}>
                      {row.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.date}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-destructive hover:underline text-sm font-semibold">Deny</button>
                    <button className="text-primary hover:underline text-sm font-bold">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
