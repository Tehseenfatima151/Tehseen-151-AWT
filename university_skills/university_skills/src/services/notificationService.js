import { supabase } from '../lib/supabase'

/**
 * Fetch all notifications for a specific user
 */
export async function listNotifications(userId) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId) {
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllAsRead(userId) {
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select()
}

/**
 * Delete a single notification
 */
export async function deleteNotification(notificationId) {
  return supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
}

/**
 * Subscribe to realtime notifications for a specific user.
 * Invokes the callback function with the new notification record on INSERT.
 */
export function subscribeToNotifications(userId, onNewNotification) {
  const uniqueId = Math.random().toString(36).substring(2, 10)
  return supabase
    .channel(`notifications-user-${userId}-${uniqueId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          onNewNotification(payload.new)
        }
      }
    )
    .subscribe()
}
