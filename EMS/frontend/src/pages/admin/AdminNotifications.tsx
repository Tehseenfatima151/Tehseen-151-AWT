import { useState } from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { PageHeader, NotifBadge, EmptyState } from '../../components/common/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import type { NotificationType } from '../../types';

const typeIcon: Record<NotificationType, React.ElementType> = {
  info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle,
};
const typeBg: Record<NotificationType, string> = {
  info: 'bg-blue-50 border-blue-100', success: 'bg-emerald-50 border-emerald-100',
  warning: 'bg-amber-50 border-amber-100', error: 'bg-red-50 border-red-100',
};
const typeIconColor: Record<NotificationType, string> = {
  info: 'text-blue-500', success: 'text-emerald-500', warning: 'text-amber-500', error: 'text-red-500',
};

export default function AdminNotifications() {
  const { user } = useAuthStore();
  const { getUserNotifications, markRead, markAllRead, deleteNotification } = useNotificationStore();
  const notifications = user ? getUserNotifications(user.id) : [];
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`You have ${notifications.filter(n => !n.isRead).length} unread notifications.`}
        breadcrumbs={[{ label: 'Admin' }, { label: 'Notifications' }]}
        actions={
          <button onClick={() => user && markAllRead(user.id)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all">
            <CheckCheck size={15} /> Mark All Read
          </button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'info', 'success', 'warning', 'error'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" icon="🔔" />
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map(n => {
              const Icon = typeIcon[n.type];
              return (
                <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${typeBg[n.type]} ${!n.isRead ? 'ring-1 ring-primary/20' : ''}`}>
                  <div className={`p-2 rounded-xl bg-white shrink-0 ${typeIconColor[n.type]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-bold text-sm text-foreground">{n.title}</p>
                      <NotifBadge type={n.type} />
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <button onClick={() => markRead(n.id)} className="p-1.5 hover:bg-white/70 rounded-lg transition-colors" title="Mark as read">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} className="p-1.5 hover:bg-white/70 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={15} className="text-destructive" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
