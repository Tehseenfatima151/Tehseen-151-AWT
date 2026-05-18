import type { ReactNode } from 'react';
import type { ElectionStatus, NotificationType } from '../../types';

// ── Status Badge ──────────────────────────────────────────
const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700 border-gray-200' },
  pending: { label: 'Pending Review', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Approved', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800 border-red-200' },
  active: { label: 'Active', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  completed: { label: 'Completed', class: 'bg-purple-100 text-purple-800 border-purple-200' },
  registered: { label: 'Registered', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  waitlisted: { label: 'Waitlisted', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  voted: { label: 'Voted', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  blocked: { label: 'Blocked', class: 'bg-red-100 text-red-800 border-red-200' },
};

export function StatusBadge({ status, dot = false }: { status: string; dot?: boolean }) {
  const cfg = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.class}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {cfg.label}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string;
}
export function StatCard({ label, value, icon, trend, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-black text-foreground">{value}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-current/10 ${color}`}>{icon}</div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}
export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        {breadcrumbs && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-2">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-black text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────
export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-4xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse space-y-3">
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-7 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-card border border-border rounded-xl animate-pulse">
          <div className="h-4 bg-muted rounded flex-1" />
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Notification Toast (inline) ───────────────────────────
export function NotifBadge({ type }: { type: NotificationType }) {
  const map = { info: 'bg-blue-100 text-blue-700', success: 'bg-emerald-100 text-emerald-700', warning: 'bg-amber-100 text-amber-700', error: 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${map[type]}`}>{type}</span>;
}

// ── Secret ID Card ────────────────────────────────────────
export function SecretIdCard({ code, masked, isUsed, isRevoked, onReveal }: { code: string; masked: string; isUsed: boolean; isRevoked: boolean; onReveal?: () => void }) {
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 ${isRevoked ? 'border-red-200 bg-red-50' : isUsed ? 'border-emerald-200 bg-emerald-50' : 'border-primary/20 bg-primary/5'}`}>
      <div className="flex-1">
        <p className="font-mono text-lg font-black tracking-widest text-foreground">{masked}</p>
        <div className="flex items-center gap-2 mt-1">
          {isRevoked && <StatusBadge status="blocked" />}
          {isUsed && !isRevoked && <StatusBadge status="voted" />}
          {!isUsed && !isRevoked && <StatusBadge status="registered" />}
        </div>
      </div>
      {!isRevoked && !isUsed && onReveal && (
        <button onClick={onReveal} className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Reveal</button>
      )}
    </div>
  );
}

// ── Countdown Timer ───────────────────────────────────────
import { useEffect, useState } from 'react';
export function CountdownTimer({ endDate, onEnd }: { endDate: string; onEnd?: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); onEnd?.(); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate, onEnd]);
  return <span className="font-mono font-bold text-primary">{timeLeft}</span>;
}
