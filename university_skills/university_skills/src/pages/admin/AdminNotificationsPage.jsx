import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Compass, 
  FileText, 
  Star, 
  Award, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  listNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../../services/notificationService'
import { getNotificationMetadata } from '../../utils/notificationUtility'
import { useNavigate } from 'react-router-dom'

const ITEMS_PER_PAGE = 8

export default function AdminNotificationsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchNotifs = async () => {
    if (!profile?.id) return
    try {
      setLoading(true)
      const { data, error } = await listNotifications(profile.id)
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to load admin notifications:', err)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [profile?.id])

  // Real-time subscription to auto-refresh notifications list
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel(`notifications-admin-page-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          listNotifications(profile.id).then(({ data }) => {
            if (data) setNotifications(data)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  const handleMarkAsRead = async (id) => {
    const { error } = await markAsRead(id)
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read)
    if (unread.length === 0) return
    
    try {
      setActionLoading(true)
      const { error } = await markAllAsRead(profile.id)
      if (error) throw error
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Failed to update notifications')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation()
    try {
      const { error } = await deleteNotification(id)
      if (error) throw error
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return
    const confirmDelete = window.confirm('Are you sure you want to clear all admin notifications permanently?')
    if (!confirmDelete) return

    try {
      setActionLoading(true)
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile.id)

      if (error) throw error
      setNotifications([])
      toast.success('All notifications cleared')
    } catch (err) {
      toast.error('Failed to clear notifications')
    } finally {
      setActionLoading(false)
    }
  }

  const handleActionClick = async (notif, actionPath) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id)
    }
    navigate(actionPath)
  }

  // Get icon depending on category
  const getCategoryIcon = (type) => {
    switch (type) {
      case 'opportunity':
        return <Compass className="w-5 h-5 text-sky-400" />
      case 'application':
      case 'status_change':
        return <FileText className="w-5 h-5 text-emerald-400" />
      case 'feedback':
        return <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
      case 'badge':
        return <Award className="w-5 h-5 text-purple-400" />
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-blue-400" />
    }
  }

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab === 'opportunities') return n.type === 'opportunity'
    if (activeTab === 'applications') return n.type === 'application' || n.type === 'status_change'
    if (activeTab === 'feedback') return n.type === 'feedback'
    return true // 'all'
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-sky-500/10 p-2 rounded-xl text-sky-400">
              <Bell className="w-6 h-6" />
            </span>
            Admin Inbox Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review alerts, updates, ratings, and application outcomes.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10 text-slate-200 transition text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-sky-400" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 hover:bg-red-500/20 text-red-400 transition text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Grid: Stats Overview & Filters */}
      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Left Side: Stats Box */}
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inbox Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block">Unread Alerts</span>
              <span className="text-2xl font-bold text-sky-400 mt-1 block">{unreadCount}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block">Total Messages</span>
              <span className="text-2xl font-bold text-slate-200 mt-1 block">{notifications.length}</span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400/70" />
            Verified Administrator Account
          </div>
        </div>

        {/* Right Side: Filters & Notification List */}
        <div className="md:col-span-3 space-y-4">
          {/* Tabs Navigation */}
          <div className="flex border-b border-white/10 overflow-x-auto pb-1.5 gap-2 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'opportunities', label: 'Opportunities' },
              { id: 'applications', label: 'Applications' },
              { id: 'feedback', label: 'Feedback' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setVisibleCount(ITEMS_PER_PAGE)
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Messages List Container */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
              <Bell className="mx-auto h-12 w-12 text-slate-500 mb-4 animate-pulse-subtle" />
              <h3 className="text-lg font-medium text-white">
                {activeTab === 'unread' ? 'Clean Inbox!' : 'No Notifications'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {activeTab === 'unread' 
                  ? "You've read all your notifications." 
                  : `There are no notifications in the ${activeTab} category.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredNotifications.slice(0, visibleCount).map((notif) => {
                  const meta = getNotificationMetadata(notif, 'admin')
                  return (
                    <motion.div
                      layout
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      className={`flex gap-4 rounded-2xl border bg-[#0f172a] p-4.5 transition-all text-left relative group ${
                        notif.is_read
                          ? 'border-white/10 hover:border-white/15'
                          : 'border-sky-500/30 bg-sky-500/[0.02] shadow-[0_0_15px_rgba(14,165,233,0.03)]'
                      }`}
                    >
                      {/* Priority Dot Accent (Left border line) */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${meta.priorityColor}`} />

                      {/* Icon */}
                      <div className="shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/5 self-start">
                        {getCategoryIcon(notif.type)}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wide ${meta.badgeColor}`}>
                            {meta.category}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            meta.priority === 'high' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : meta.priority === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {meta.priority} Priority
                          </span>

                          {!notif.is_read && (
                            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                          )}
                        </div>

                        <h3 className="font-semibold text-white text-base mt-2">{notif.title}</h3>
                        <p className="text-sm text-slate-300 mt-1 leading-relaxed break-words">{notif.message}</p>
                        
                        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap pt-3 border-t border-white/5">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(notif.created_at).toLocaleString()}
                          </span>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            {meta.action && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActionClick(notif, meta.action.path)
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider py-1 px-2 hover:bg-sky-500/10 rounded-lg cursor-pointer"
                              >
                                {meta.action.label}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={(e) => handleDeleteNotif(notif.id, e)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                              title="Delete alert"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Load More Pagination */}
              {filteredNotifications.length > visibleCount && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 hover:bg-white/10 text-white transition-colors text-sm font-semibold cursor-pointer"
                  >
                    Load More Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
