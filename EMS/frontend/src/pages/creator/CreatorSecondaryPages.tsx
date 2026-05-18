// Creator secondary pages: Analytics, Notifications, Reports, Export, Billing, Settings, Profile
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useNotificationStore } from '../../store/notificationStore';
import { PageHeader, StatCard, NotifBadge, EmptyState } from '../../components/common/UIComponents';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Vote, BarChart3, Bell, CheckCheck, Trash2, Download, FileText, CreditCard, Settings, Camera, Save, Key, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NotificationType } from '../../types';

const analyticsData = [
  { month: 'Jul', voters: 320, votes: 280 }, { month: 'Aug', voters: 450, votes: 400 },
  { month: 'Sep', voters: 380, votes: 320 }, { month: 'Oct', voters: 610, votes: 550 },
  { month: 'Nov', voters: 820, votes: 740 }, { month: 'Dec', voters: 950, votes: 880 },
];
const typeIcon: Record<NotificationType, string> = { info: '💬', success: '✅', warning: '⚠️', error: '❌' };
const typeBg: Record<NotificationType, string> = {
  info: 'bg-blue-50 border-blue-100', success: 'bg-emerald-50 border-emerald-100',
  warning: 'bg-amber-50 border-amber-100', error: 'bg-red-50 border-red-100',
};

export function CreatorAnalytics() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const mine = elections.filter(e => e.creatorId === user?.id);
  const totalVoters = mine.reduce((s, e) => s + e.currentVoters, 0);
  const totalVotes = mine.reduce((s, e) => s + e.totalVotes, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Track participation trends and election performance." breadcrumbs={[{ label: 'Creator' }, { label: 'Analytics' }]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Elections" value={mine.length} icon={<Vote size={20} />} />
        <StatCard label="Total Voters" value={totalVoters.toLocaleString()} icon={<Users size={20} />} trend={{ value: '+18% this month', positive: true }} />
        <StatCard label="Total Votes" value={totalVotes.toLocaleString()} icon={<BarChart3 size={20} />} />
        <StatCard label="Avg Turnout" value={mine.length ? `${(mine.reduce((s, e) => s + e.turnoutPercentage, 0) / mine.length).toFixed(1)}%` : '0%'} icon={<TrendingUp size={20} />} color="text-emerald-600" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-4">Voter & Vote Trends</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={analyticsData}>
            <defs>
              <linearGradient id="voterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3525cd" stopOpacity={0.15} /><stop offset="95%" stopColor="#3525cd" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="voteGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b1ada" stopOpacity={0.15} /><stop offset="95%" stopColor="#8b1ada" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            <Area type="monotone" dataKey="voters" stroke="#3525cd" strokeWidth={2} fill="url(#voterGrad)" name="Registered Voters" />
            <Area type="monotone" dataKey="votes" stroke="#8b1ada" strokeWidth={2} fill="url(#voteGrad2)" name="Votes Cast" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-bold">Election Performance</h3></div>
        <div className="divide-y divide-border">
          {mine.map(e => (
            <div key={e.id} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-sm truncate">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.currentVoters}/{e.maxVoters} voters</p>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${(e.currentVoters / e.maxVoters) * 100}%` }} />
                </div>
              </div>
              <p className="font-black text-primary text-sm w-12 text-right">{e.turnoutPercentage.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreatorNotifications() {
  const { user } = useAuthStore();
  const { getUserNotifications, markRead, markAllRead, deleteNotification } = useNotificationStore();
  const notifications = user ? getUserNotifications(user.id) : [];
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" subtitle={`${notifications.filter(n => !n.isRead).length} unread`} breadcrumbs={[{ label: 'Creator' }, { label: 'Notifications' }]}
        actions={<button onClick={() => user && markAllRead(user.id)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90"><CheckCheck size={14} /> Mark All Read</button>} />
      <div className="flex gap-2 flex-wrap">
        {(['all', 'info', 'success', 'warning', 'error'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState title="No notifications" icon="🔔" /> : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${typeBg[n.type]} ${!n.isRead ? 'ring-1 ring-primary/20' : ''}`}>
              <span className="text-xl shrink-0">{typeIcon[n.type]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5"><p className="font-bold text-sm">{n.title}</p><NotifBadge type={n.type} />{!n.isRead && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}</div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                {!n.isRead && <button onClick={() => markRead(n.id)} className="p-1.5 hover:bg-white/70 rounded-lg"><CheckCheck size={14} className="text-emerald-600" /></button>}
                <button onClick={() => deleteNotification(n.id)} className="p-1.5 hover:bg-white/70 rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CREATOR_REPORTS = [
  { name: 'Election Summary Report', desc: 'All elections with status, voters, and turnout.', type: 'PDF' },
  { name: 'Voter Participation Report', desc: 'Registered voters and participation rates.', type: 'CSV' },
  { name: 'Candidate Results Report', desc: 'Vote counts and percentages per candidate.', type: 'PDF' },
  { name: 'Secret ID Audit Report', desc: 'Usage log for all generated secret IDs.', type: 'CSV' },
];

export function CreatorReports() {
  return (
    <div className="space-y-5">
      <PageHeader title="Reports" subtitle="Generate and download election reports." breadcrumbs={[{ label: 'Creator' }, { label: 'Reports' }]} />
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-bold">Available Reports</h3></div>
        {CREATOR_REPORTS.map(r => (
          <div key={r.name} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><FileText size={16} className="text-primary" /></div>
              <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.desc}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r.type}</span>
              <button onClick={() => {
                const a = document.createElement('a');
                a.href = 'data:text/plain;charset=utf-8,Mock%20Report%20Data';
                a.download = `${r.name.replace(/ /g, '_').toLowerCase()}.${r.type.toLowerCase()}`;
                a.click();
              }} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90"><Download size={12} /> Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EXPORT_OPTIONS = [
  { label: 'Voter List (CSV)', desc: 'Export all registered voters with status' },
  { label: 'Vote Data (CSV)', desc: 'Anonymous vote records with timestamps' },
  { label: 'Candidate Data (CSV)', desc: 'All candidates and their vote counts' },
  { label: 'Audit Log (CSV)', desc: 'Full activity log for your elections' },
  { label: 'Full Report (PDF)', desc: 'Complete election report with charts' },
];

export function ExportCenter() {
  return (
    <div className="space-y-5">
      <PageHeader title="Export Center" subtitle="Export election data in various formats." breadcrumbs={[{ label: 'Creator' }, { label: 'Export' }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXPORT_OPTIONS.map(opt => (
          <div key={opt.label} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Download size={18} className="text-primary" /></div>
              <div><p className="font-bold text-sm">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.desc}</p></div>
            </div>
            <button onClick={() => {
              const a = document.createElement('a');
              a.href = 'data:text/csv;charset=utf-8,Mock%20Export%20Data';
              a.download = `${opt.label.replace(/ /g, '_').toLowerCase()}.csv`;
              a.click();
            }} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 shrink-0">Export</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Billing" subtitle="Manage your VoteSphere subscription." breadcrumbs={[{ label: 'Creator' }, { label: 'Billing' }]} />
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-sm font-semibold opacity-80">Current Plan</p><h2 className="text-2xl font-black">Pro Creator</h2></div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">Active</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[['Elections', 'Unlimited'], ['Max Voters', '50,000'], ['Storage', '10 GB']].map(([l, v]) => (
            <div key={l} className="bg-white/10 rounded-xl p-3"><p className="text-lg font-black">{v}</p><p className="text-xs opacity-70 mt-1">{l}</p></div>
          ))}
        </div>
        <p className="text-sm opacity-70 mt-4">Next billing: December 1, 2024 · $49/month</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={18} className="text-primary" /> Payment Method</h3>
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center text-white text-xs font-black">VISA</div>
          <div><p className="font-semibold text-sm">•••• •••• •••• 4242</p><p className="text-xs text-muted-foreground">Expires 12/26</p></div>
          <button className="ml-auto text-xs text-primary font-bold hover:underline">Update</button>
        </div>
      </div>
    </div>
  );
}

export function CreatorSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ defaultMaxVoters: 1000, defaultTimezone: 'UTC', enableWaitlist: true, requireSecretId: true, allowAnonymous: true, emailOnApproval: true, emailOnVote: false });
  const toggle = (k: keyof typeof settings) => setSettings(s => ({ ...s, [k]: !s[k] }));

  const Toggle = ({ label, desc, k }: { label: string; desc: string; k: keyof typeof settings }) => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
      <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <button onClick={() => toggle(k)} className={`relative w-11 h-6 rounded-full transition-colors ${settings[k] ? 'bg-primary' : 'bg-muted border border-border'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[k] ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Configure your creator preferences." breadcrumbs={[{ label: 'Creator' }, { label: 'Settings' }]}
        actions={<button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90"><Save size={14} /> {saved ? 'Saved!' : 'Save'}</button>} />
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold">Default Election Settings</h3>
        <div><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Default Max Voters</label>
          <input type="number" value={settings.defaultMaxVoters} onChange={e => setSettings(s => ({ ...s, defaultMaxVoters: +e.target.value }))} className="px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
        <Toggle label="Enable Waitlist by Default" desc="New elections will have waitlist enabled" k="enableWaitlist" />
        <Toggle label="Require Secret ID by Default" desc="Voters must verify with Secret ID" k="requireSecretId" />
        <Toggle label="Anonymous Voting by Default" desc="Votes cannot be traced back to voters" k="allowAnonymous" />
        <Toggle label="Email on Approval" desc="Get notified when your election is approved" k="emailOnApproval" />
        <Toggle label="Email on Each Vote" desc="Get notified for each vote cast" k="emailOnVote" />
      </div>
    </div>
  );
}

export function CreatorProfile() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your account and creator information." breadcrumbs={[{ label: 'Creator' }, { label: 'Profile' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img src={user?.avatar} alt={user?.name} className="w-24 h-24 rounded-full border-4 border-primary/30" />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 shadow-lg"><Camera size={14} /></button>
          </div>
          <h3 className="font-bold text-lg">{user?.name}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">Election Creator</span>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[['Full Name', name, setName, true], ['Email', user?.email, null, false], ['Phone', user?.phone, null, false], ['Organization', user?.organization, null, false]].map(([l, v, setter, editable]) => (
                <div key={l as string}>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">{l as string}</label>
                  <input value={v as string || ''} onChange={editable && setter ? (e: React.ChangeEvent<HTMLInputElement>) => (setter as (v: string) => void)(e.target.value) : undefined} readOnly={!editable}
                    className={`w-full px-3 py-2.5 border border-border rounded-xl text-sm ${editable ? 'bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30' : 'bg-muted/10 text-muted-foreground cursor-not-allowed'}`} />
                </div>
              ))}
            </div>
            <button onClick={() => { updateUser({ name }); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90">
              <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Key size={16} className="text-primary" /> Change Password</h3>
            <div className="space-y-3">
              {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                <div key={l}><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">{l}</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              ))}
              <button className="px-5 py-2.5 border border-border font-bold rounded-xl text-sm hover:bg-muted">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
