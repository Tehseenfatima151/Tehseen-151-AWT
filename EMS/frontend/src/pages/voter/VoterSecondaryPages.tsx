import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { useNotificationStore } from '../../store/notificationStore';
import { PageHeader, EmptyState, StatusBadge, NotifBadge } from '../../components/common/UIComponents';
import { useState } from 'react';
import { CheckCheck, Trash2, Shield, Smartphone, HeadphonesIcon, Award, BarChart3, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NotificationType } from '../../types';

const COLORS = ['#3525cd','#8b1ada','#0ea5e9','#10b981','#f59e0b','#ef4444'];
const typeBg: Record<NotificationType, string> = {
  info: 'bg-blue-50 border-blue-100', success: 'bg-emerald-50 border-emerald-100',
  warning: 'bg-amber-50 border-amber-100', error: 'bg-red-50 border-red-100',
};
const typeIcon: Record<NotificationType, string> = { info:'💬', success:'✅', warning:'⚠️', error:'❌' };

export function VerificationCenter() {
  const { user } = useAuthStore();
  return (
    <div className="space-y-5">
      <PageHeader title="Verification Center" subtitle="Your identity and account verification status." breadcrumbs={[{label:'Voter'},{label:'Verification'}]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label:'Email Verified', status: user?.isVerified, icon:'📧' },
          { label:'Phone Verified', status: !!user?.phone, icon:'📱' },
          { label:'Identity (KYC)', status: true, icon:'🪪' },
          { label:'2FA Enabled', status: user?.is2FAEnabled, icon:'🔐' },
        ].map(item => (
          <div key={item.label} className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${item.status ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{item.label}</p>
              <p className={`text-xs font-bold mt-0.5 ${item.status ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status ? '✓ Verified' : '⚠ Pending'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsVoter() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { registrations } = useVotingStore();
  const myRegs = registrations.filter(r => r.userId === user?.id);
  const completed = elections.filter(e => e.status === 'completed' && myRegs.some(r => r.electionId === e.id));

  return (
    <div className="space-y-5">
      <PageHeader title="Election Results" subtitle="Final results for completed elections." breadcrumbs={[{label:'Voter'},{label:'Results'}]} />
      {completed.length === 0 ? (
        <EmptyState title="No results yet" description="Results appear here after elections conclude." icon="📊" />
      ) : completed.map(e => {
        const sorted = [...e.candidates].sort((a,b) => b.voteCount - a.voteCount);
        const total = sorted.reduce((s,c) => s + c.voteCount, 0);
        return (
          <div key={e.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-bold">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.organization} · {total.toLocaleString()} votes cast</p>
            </div>
            <div className="divide-y divide-border">
              {sorted.map((c, i) => {
                const pct = total > 0 ? (c.voteCount / total) * 100 : 0;
                return (
                  <div key={c.id} className="p-4 flex items-center gap-4">
                    <span className="text-lg shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${pct}%`, backgroundColor: COLORS[i % COLORS.length]}} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="font-black text-sm shrink-0">{c.voteCount.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Certificates() {
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { registrations } = useVotingStore();
  const voted = registrations.filter(r => r.userId === user?.id && r.status === 'voted');

  return (
    <div className="space-y-5">
      <PageHeader title="Participation Certificates" subtitle="Download proof of your civic participation." breadcrumbs={[{label:'Voter'},{label:'Certificates'}]} />
      {voted.length === 0 ? (
        <EmptyState title="No certificates yet" description="Cast your first vote to earn a participation certificate." icon="🎖️" />
      ) : voted.map(r => {
        const e = elections.find(el => el.id === r.electionId);
        return (
          <div key={r.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0"><Award size={32} className="text-amber-600" /></div>
            <div className="flex-1">
              <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Certificate of Participation</p>
              <h3 className="font-black text-lg">{e?.title || 'Election'}</h3>
              <p className="text-sm text-muted-foreground">{e?.organization} · {r.votedAt ? new Date(r.votedAt).toLocaleDateString() : 'Voted'}</p>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white font-bold text-sm rounded-xl hover:opacity-90 shrink-0">Download PDF</button>
          </div>
        );
      })}
    </div>
  );
}

export function VoterNotifications() {
  const { user } = useAuthStore();
  const { getUserNotifications, markRead, markAllRead, deleteNotification } = useNotificationStore();
  const notifications = user ? getUserNotifications(user.id) : [];
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" subtitle={`${notifications.filter(n => !n.isRead).length} unread`} breadcrumbs={[{label:'Voter'},{label:'Notifications'}]}
        actions={<button onClick={() => user && markAllRead(user.id)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90"><CheckCheck size={14} /> All Read</button>} />
      <div className="flex gap-2 flex-wrap">
        {(['all','info','success','warning','error'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${filter===f ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState title="All caught up!" icon="🔔" /> : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${typeBg[n.type]} ${!n.isRead ? 'ring-1 ring-primary/20' : ''}`}>
              <span className="text-xl shrink-0">{typeIcon[n.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-bold text-sm">{n.title}</p>
                  <NotifBadge type={n.type} />
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
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

export function SupportCenter() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <div className="space-y-5">
      <PageHeader title="Support Center" subtitle="Get help with VoteSphere." breadcrumbs={[{label:'Voter'},{label:'Support'}]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {[
            ['How do I get my Secret ID?', 'Your Secret ID is sent to your email when you register for an election.'],
            ['Can I change my vote?', 'No. Once submitted, votes are final and immutable to ensure election integrity.'],
            ['Is my vote anonymous?', 'Yes. All votes are encrypted and cannot be traced back to you.'],
            ['What is the waitlist?', 'When an election reaches its voter limit, you join a waitlist and get notified if a spot opens.'],
          ].map(([q, a]) => (
            <details key={q as string} className="bg-card border border-border rounded-xl group">
              <summary className="p-4 font-bold text-sm cursor-pointer list-none flex items-center justify-between">
                {q}<span className="text-primary group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="px-4 pb-4 text-sm text-muted-foreground">{a as string}</p>
            </details>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-lg mb-2">Ticket Submitted!</h3>
              <p className="text-sm text-muted-foreground">We'll respond within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-4 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted">Submit Another</button>
            </div>
          ) : (
            <>
              <h3 className="font-bold mb-4 flex items-center gap-2"><HeadphonesIcon size={18} className="text-primary" /> Contact Support</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Subject</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Describe your issue" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} placeholder="Describe your issue in detail..." className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90">Submit Ticket</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SecurityVoter() {
  const { user } = useAuthStore();
  return (
    <div className="space-y-5">
      <PageHeader title="Security" subtitle="Manage your account security settings." breadcrumbs={[{label:'Voter'},{label:'Security'}]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label:'Password', desc:'Last changed 30 days ago', action:'Change Password', icon:'🔑' },
          { label:'Two-Factor Auth', desc: user?.is2FAEnabled ? 'Enabled – App Authenticator' : 'Not enabled', action: user?.is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA', icon:'🛡️' },
          { label:'Login Alerts', desc:'Get email on new login', action:'Configure', icon:'📧' },
          { label:'Active Sessions', desc:'2 active sessions', action:'View Sessions', icon:'💻' },
        ].map(item => (
          <div key={item.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button className="text-xs text-primary font-bold hover:underline shrink-0">{item.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DevicesPage() {
  const DEVICES = [
    { name:'Chrome on Windows', location:'Karachi, PK', lastActive:'Now', current:true },
    { name:'Mobile Safari – iPhone', location:'Lahore, PK', lastActive:'2 days ago', current:false },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Trusted Devices" subtitle="Devices that have logged into your account." breadcrumbs={[{label:'Voter'},{label:'Devices'}]} />
      <div className="space-y-3">
        {DEVICES.map(d => (
          <div key={d.name} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <Smartphone size={24} className="text-primary shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-bold text-sm">{d.name}</p>{d.current && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">Current</span>}</div>
              <p className="text-xs text-muted-foreground">{d.location} · {d.lastActive}</p>
            </div>
            {!d.current && <button className="text-xs text-destructive font-bold hover:underline">Remove</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VoterSettings() {
  const [emailVote, setEmailVote] = useState(true);
  const [emailResult, setEmailResult] = useState(true);
  const Toggle = ({label, desc, val, set}: {label:string; desc:string; val:boolean; set:(v:boolean)=>void}) => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
      <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <button onClick={() => set(!val)} className={`relative w-11 h-6 rounded-full transition-colors ${val ? 'bg-primary' : 'bg-muted border border-border'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Configure your voter account preferences." breadcrumbs={[{label:'Voter'},{label:'Settings'}]} />
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h3 className="font-bold">Notification Preferences</h3>
        <Toggle label="Vote Confirmation Email" desc="Email receipt after casting a vote" val={emailVote} set={setEmailVote} />
        <Toggle label="Results Notification" desc="Email when election results are published" val={emailResult} set={setEmailResult} />
      </div>
    </div>
  );
}

export function VoterProfile() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your voter account." breadcrumbs={[{label:'Voter'},{label:'Profile'}]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
          <img src={user?.avatar} alt={user?.name} className="w-24 h-24 rounded-full border-4 border-primary/30 mb-4" />
          <h3 className="font-bold text-lg">{user?.name}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">Registered Voter</span>
        </div>
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[['Full Name', name, setName, true], ['Email', user?.email, null, false], ['Phone', user?.phone, null, false]].map(([l,v,setter,editable]) => (
              <div key={l as string}>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">{l as string}</label>
                <input value={v as string || ''} onChange={editable && setter ? (e: React.ChangeEvent<HTMLInputElement>) => (setter as (v:string)=>void)(e.target.value) : undefined} readOnly={!editable}
                  className={`w-full px-3 py-2.5 border border-border rounded-xl text-sm ${editable ? 'bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30' : 'bg-muted/10 text-muted-foreground cursor-not-allowed'}`} />
              </div>
            ))}
          </div>
          <button onClick={() => { updateUser({name}); setSaved(true); setTimeout(()=>setSaved(false),2000); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
