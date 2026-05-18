import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Globe, Lock, Eye, Download, Search } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { MOCK_USERS } from '../../data/mockUsers';
import { PageHeader, StatCard, StatusBadge } from '../../components/common/UIComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const threatData = [
  { name: 'Brute Force', count: 12 }, { name: 'SQL Inject', count: 3 },
  { name: 'XSS Attempt', count: 7 }, { name: 'Rate Limit', count: 28 }, { name: 'Bot Traffic', count: 15 },
];

export default function SecurityCenter() {
  const activeSessions = MOCK_USERS.filter(u => u.lastLogin).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Security Center" subtitle="Monitor platform-wide security health and threat indicators." breadcrumbs={[{ label: 'Admin' }, { label: 'Security Center' }]} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Security Score" value="99.8%" icon={<Shield size={20} />} color="text-emerald-600" />
        <StatCard label="Active Sessions" value={activeSessions} icon={<Globe size={20} />} />
        <StatCard label="Threat Alerts" value={3} icon={<AlertTriangle size={20} />} color="text-amber-600" />
        <StatCard label="Blocked IPs" value={7} icon={<Lock size={20} />} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={threatData} barSize={24}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {MOCK_USERS.filter(u => u.lastLogin).slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{u.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-bold">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-4">Security Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Row-level database security enabled',
            'All votes encrypted at rest',
            'Rate limiting active on all endpoints',
            'XSS protection headers configured',
            'SQL injection prevention active',
            'CAPTCHA on all public forms',
            'Audit logging enabled',
            'Session timeout set to 2 hours',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-medium text-emerald-900">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
