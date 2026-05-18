import { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { PageHeader, StatusBadge } from '../../components/common/UIComponents';
import { motion } from 'framer-motion';

const actionColor: Record<string, string> = {
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-gray-100 text-gray-600',
  vote: 'bg-emerald-100 text-emerald-700',
  approve: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-700',
  create: 'bg-purple-100 text-purple-700',
  edit: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  override: 'bg-orange-100 text-orange-700',
};

const ITEMS_PER_PAGE = 8;

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = MOCK_AUDIT_LOGS.filter(l => {
    const matchSearch = l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search);
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable log of every action performed on VoteSphere."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Audit Logs' }]}
        actions={
          <button onClick={() => {
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,Mock%20Audit%20Log%20Data';
            a.download = `audit_logs_${new Date().getTime()}.csv`;
            a.click();
          }} className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
            <Download size={15} /> Export CSV
          </button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search logs, user, IP..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted-foreground" />
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">All Actions</option>
            {['login', 'logout', 'vote', 'approve', 'reject', 'create', 'edit', 'delete', 'override'].map(a => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-muted-foreground font-semibold">{filtered.length} entries</span>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Timestamp', 'Action', 'User', 'Role', 'Description', 'IP Address', 'Override'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map(log => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`hover:bg-muted/30 transition-colors ${log.isAdminOverride ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${actionColor[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{log.userName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground capitalize">{log.userRole.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{log.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{log.ipAddress}</td>
                  <td className="px-4 py-3">
                    {log.isAdminOverride && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black">OVERRIDE</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-border rounded-lg text-sm font-semibold hover:bg-muted disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-border rounded-lg text-sm font-semibold hover:bg-muted disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
