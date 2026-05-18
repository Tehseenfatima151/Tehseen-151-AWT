import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Shield } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '../../components/common/UIComponents';
import type { User, UserRole } from '../../types';
import { authService } from '../../services/authService';

function UserTable({ users, title, subtitle, filterRole }: { users: User[]; title: string; subtitle: string; filterRole?: UserRole | 'blocked' }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => {
    const nameStr = u.name || '';
    const emailStr = u.email || '';
    return nameStr.toLowerCase().includes(search.toLowerCase()) || emailStr.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }, { label: title }]} />
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <span className="text-sm text-muted-foreground font-semibold">{filtered.length} users</span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No users found" icon="👤" />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['User', 'Email', 'Phone', 'Role', 'Verified', '2FA', 'Status', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || 'user'}`} alt={u.name || 'User'} className="w-7 h-7 rounded-full" />
                        <span className="font-semibold whitespace-nowrap">{u.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.phone || 'N/A'}</td>
                    <td className="px-4 py-3"><StatusBadge status={(u.role || 'voter').replace('_', ' ')} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${u.isVerified ? 'text-emerald-600' : 'text-red-500'}`}>{u.isVerified ? '✓ Yes' : '✗ No'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${u.is2FAEnabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>{u.is2FAEnabled ? '✓ On' : '— Off'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.isBlocked ? 'blocked' : 'registered'} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function useUsers(filterRole?: UserRole | 'blocked') {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getAllProfiles().then(data => {
      let filtered = data;
      if (filterRole === 'blocked') filtered = data.filter(u => u.isBlocked);
      else if (filterRole) filtered = data.filter(u => u.role === filterRole);
      setUsers(filtered);
      setLoading(false);
    });
  }, [filterRole]);

  return { users, loading };
}

function UserTableWrapper({ title, subtitle, filterRole }: { title: string; subtitle: string; filterRole?: UserRole | 'blocked' }) {
  const { users, loading } = useUsers(filterRole);

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader title={title} subtitle={subtitle} breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }, { label: title }]} />
        <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      </div>
    );
  }

  return <UserTable users={users} title={title} subtitle={subtitle} filterRole={filterRole} />;
}

export function UsersManagement() {
  return <UserTableWrapper title="All Users" subtitle="Manage all registered users across all roles." />;
}
export function ElectionCreators() {
  return <UserTableWrapper title="Election Creators" subtitle="Approved election creator accounts." filterRole="election_creator" />;
}
export function VotersManagement() {
  return <UserTableWrapper title="Voters" subtitle="Registered voter accounts." filterRole="voter" />;
}
export function BlockedUsers() {
  return <UserTableWrapper title="Blocked Users" subtitle="Accounts suspended from the platform." filterRole="blocked" />;
}
