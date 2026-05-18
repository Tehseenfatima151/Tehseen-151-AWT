// ============================================================
// VoteSphere — Notification Store (Supabase-powered)
// Replaces mock data with real Supabase + Realtime.
// ============================================================

import { create } from 'zustand';
import type { Notification, NotificationType } from '../types';
import { notificationService } from '../services/notificationService';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
  notifications: Notification[];
  unreadCount:   number;
  _channel:      RealtimeChannel | null;
  addNotification:    (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markRead:           (id: string) => void;
  markAllRead:        (userId: string) => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  toast:              (type: NotificationType, title: string, message: string, userId?: string) => void;
  fetchAndSubscribe:  (userId: string) => Promise<void>;
  unsubscribe:        () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount:   0,
  _channel:      null,

  // ── Fetch from DB + subscribe to realtime ─────────────────
  fetchAndSubscribe: async (userId: string) => {
    // 1. Load existing notifications
    const notifications = await notificationService.fetchNotifications(userId);
    const unreadCount   = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });

    // 2. Subscribe to new ones via Realtime
    const channel = notificationService.subscribeToNotifications(userId, (newN) => {
      set(s => ({
        notifications: [newN, ...s.notifications],
        unreadCount:   s.unreadCount + 1,
      }));
    });
    set({ _channel: channel });
  },

  unsubscribe: () => {
    get()._channel?.unsubscribe();
    set({ _channel: null });
  },

  // ── Add notification (inserts to DB + local state) ────────
  addNotification: (n) => {
    notificationService.createNotification(n).catch(console.error);
    const newN: Notification = {
      ...n,
      id:        `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead:    false,
    };
    set(s => ({ notifications: [newN, ...s.notifications], unreadCount: s.unreadCount + 1 }));
  },

  // ── Mark single as read ────────────────────────────────────
  markRead: (id) => {
    notificationService.markRead(id).catch(console.error);
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      unreadCount:   Math.max(0, s.unreadCount - 1),
    }));
  },

  // ── Mark all as read ──────────────────────────────────────
  markAllRead: (userId) => {
    notificationService.markAllRead(userId).catch(console.error);
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount:   0,
    }));
  },

  // ── Delete ────────────────────────────────────────────────
  deleteNotification: (id) => {
    notificationService.deleteNotification(id).catch(console.error);
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
  },

  getUserNotifications: (userId) => get().notifications.filter(n => n.userId === userId),

  // ── Toast helper (creates a system notification) ──────────
  toast: (type, title, message, userId = 'system') => {
    get().addNotification({ userId, type, title, message });
  },
}));
