// ============================================================
// VoteSphere — Notification Service
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Notification, NotificationType } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const sb = supabase as any;

function rowToNotification(row: any): Notification {
  return { id: row.id, userId: row.user_id, type: row.type as NotificationType, title: row.title, message: row.message, isRead: row.is_read, actionUrl: row.action_url ?? undefined, createdAt: row.created_at };
}

export const notificationService = {
  async fetchNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await sb.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
    if (error) handleSupabaseError(error, 'fetchNotifications');
    return (data ?? []).map(rowToNotification);
  },

  async createNotification(n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    const { error } = await sb.from('notifications').insert({ user_id: n.userId, type: n.type, title: n.title, message: n.message, action_url: n.actionUrl ?? null, is_read: false });
    if (error) console.error('[NotificationService] create:', error.message);
  },

  async markRead(id: string): Promise<void> {
    const { error } = await sb.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) console.error('[NotificationService] markRead:', error.message);
  },

  async markAllRead(userId: string): Promise<void> {
    const { error } = await sb.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (error) console.error('[NotificationService] markAllRead:', error.message);
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await sb.from('notifications').delete().eq('id', id);
    if (error) console.error('[NotificationService] delete:', error.message);
  },

  subscribeToNotifications(userId: string, onNew: (n: Notification) => void): RealtimeChannel {
    return supabase.channel(`notifications:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload: any) => onNew(rowToNotification(payload.new)))
      .subscribe();
  },

  async notifyUsers(userIds: string[], notification: { type: NotificationType; title: string; message: string; actionUrl?: string }): Promise<void> {
    if (userIds.length === 0) return;
    const rows = userIds.map(uid => ({ user_id: uid, type: notification.type, title: notification.title, message: notification.message, action_url: notification.actionUrl ?? null }));
    const { error } = await sb.from('notifications').insert(rows);
    if (error) console.error('[NotificationService] notifyUsers:', error.message);
  },
};
