import { LogOut, Menu, X, Settings, User, Bell, ChevronDown, CheckCheck, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminNav, studentNav } from '../../utils/portalConfig'
import SiteBackground from './SiteBackground'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { 
  listNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  subscribeToNotifications 
} from '../../services/notificationService'
import { motion, AnimatePresence } from 'framer-motion'
import { generateDeadlineWarningsClient, getNotificationMetadata } from '../../utils/notificationUtility'


const linkStyles = ({ isActive }) =>
  `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 group ${
    isActive 
      ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-300 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.05)]' 
      : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-200 border border-transparent hover:border-white/5 hover:translate-x-1'
  }`

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function DashboardLayout({ portal }) {
  const [open, setOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const nav = portal === 'admin' ? adminNav : studentNav

  // Dropdown States
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  // Notifications State
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Refs for click outside
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  // Fetch notifications and subscribe to realtime updates
  useEffect(() => {
    if (!profile?.id) return

    const fetchNotifs = () => {
      listNotifications(profile.id).then(({ data, error }) => {
        if (!error && data) {
          setNotifications(data)
          setUnreadCount(data.filter((n) => !n.is_read).length)
        }
      })
    }

    // 1. Fetch notifications immediately so the bell badge loads fast
    fetchNotifs()

    // 2. Generate deadline warnings in the background (students only) — non-blocking
    if (portal === 'student') {
      Promise.allSettled([
        supabase.rpc('generate_deadline_warnings'),
        generateDeadlineWarningsClient(profile.id)
      ]).then((results) => {
        // Re-fetch after warnings are generated to pick up any new ones
        const hadNewWarnings = results.some(r => r.status === 'fulfilled')
        if (hadNewWarnings) fetchNotifs()
      }).catch(() => {
        // Silent fail — warnings are non-critical
      })
    }

    // 2. Realtime subscription
    const channel = subscribeToNotifications(profile.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev])
      setUnreadCount((prev) => prev + 1)
      toast(`🔔 ${newNotif.title}\n${newNotif.message}`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          fontSize: '13px',
        }
      })
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [profile?.id, portal])

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id) => {
    const { error } = await markAsRead(id)
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return
    const { error } = await markAllAsRead(profile.id)
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
    }
  };

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation()
    const isUnread = !notifications.find(n => n.id === id)?.is_read
    const { error } = await deleteNotification(id)
    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (isUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id)
    }
    setNotifOpen(false)

    // Routing based on notification type
    if (notif.type === 'opportunity') {
      navigate('/student/opportunities')
    } else if (notif.type === 'application') {
      navigate(portal === 'admin' ? '/admin/applications' : '/student/applications')
    } else if (notif.type === 'status_change') {
      navigate('/student/applications')
    } else if (notif.type === 'feedback') {
      navigate('/student/profile')
    } else if (notif.type === 'badge') {
      navigate('/student/profile')
    }
  }

  // Helper colors for notification badges
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'opportunity': return 'bg-sky-500/15 text-sky-400 border-sky-500/20'
      case 'application': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'status_change': return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
      case 'feedback': return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      case 'badge': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/20'
    }
  }

  const userAvatarUrl = profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=0284c7&color=fff&bold=true`

  // Shared dropdown rendering function
  const renderNotificationDropdown = (alignRight = true) => (
    <AnimatePresence>
      {notifOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute ${alignRight ? 'right-0' : 'left-0 sm:right-0 sm:left-auto'} mt-2 w-80 sm:w-96 rounded-xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl z-50 backdrop-blur-xl`}
        >
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => {
                const meta = getNotificationMetadata(notif, portal)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-2.5 rounded-lg p-2.5 cursor-pointer transition text-left border relative group ${
                      notif.is_read 
                        ? 'bg-transparent border-transparent hover:bg-white/[0.02]' 
                        : 'bg-sky-500/[0.03] border-sky-500/10 hover:bg-sky-500/[0.06]'
                    }`}
                  >
                    {/* Priority Dot */}
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${meta.priorityColor}`} title={`Priority: ${meta.priority}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold border uppercase shrink-0 ${meta.badgeColor}`}>
                          {meta.category}
                        </span>
                        {!notif.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-md shadow-sky-500/40" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{notif.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal break-words">{notif.message}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{formatRelativeTime(notif.created_at)}</p>
                    </div>

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => handleDeleteNotif(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-all rounded shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-white/5 text-center flex justify-center">
              <Link 
                to={portal === 'admin' ? '/admin/notifications' : '/student/notifications'}
                onClick={() => setNotifOpen(false)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                View All Notifications ({notifications.length})
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderProfileDropdown = () => (
    <AnimatePresence>
      {profileOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-60 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl text-left z-50 backdrop-blur-xl"
        >
          <div className="px-3 py-2.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Signed in as</p>
            <p className="text-sm font-semibold text-slate-200 truncate mt-0.5">{profile?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
          
          <div className="my-1 border-t border-white/5" />
          
          <Link
            to={portal === 'student' ? '/student/profile' : '/admin/settings'}
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <User size={14} />
            View Profile
          </Link>
          
          <Link
            to={`/${portal}/settings`}
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <Settings size={14} />
            Profile Settings
          </Link>
          
          <div className="my-1 border-t border-white/5" />
          
          <button
            onClick={() => {
              setProfileOpen(false)
              signOut()
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition text-left"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <SiteBackground>
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md md:hidden flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <img src="/team/comsats-logo.jpeg" alt="COMSATS Logo" className="h-7.5 w-7.5 rounded-full object-cover ring-1 ring-white/20" />
          <h1 className="font-semibold text-white tracking-tight">CUI SkillSphere</h1>
        </Link>
        <div className="flex items-center gap-2.5">
          
          {/* Notifications Dropdown for Mobile */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen)
                setProfileOpen(false)
              }}
              className={`relative p-2 rounded-lg bg-white/5 border border-white/5 transition text-slate-300 hover:text-white ${
                unreadCount > 0 ? 'ring-2 ring-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)] animate-pulse-subtle' : ''
              }`}
              aria-label="Toggle notifications"
            >
              <Bell size={16} className={unreadCount > 0 ? 'animate-bounce-subtle text-sky-400' : ''} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  key={unreadCount}
                  className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-slate-950 shadow-md shadow-red-500/30"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>
            {renderNotificationDropdown(false)}
          </div>

          {/* Profile Dropdown for Mobile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotifOpen(false)
              }}
              className="flex items-center rounded-full border border-white/10 overflow-hidden"
              aria-label="Toggle profile menu"
            >
              <img
                src={userAvatarUrl}
                alt="Avatar"
                className="h-8 w-8 object-cover"
              />
            </button>
            {renderProfileDropdown()}
          </div>

          {/* Sidebar Toggle for Mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 transition"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-screen w-full">
        {/* Mobile overlay backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/10 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-900/95 p-5 pt-[68px] md:pt-5 text-white backdrop-blur-xl transition-transform md:static md:translate-x-0 flex flex-col ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Link to="/" className="mb-6 flex items-center gap-3 hover:opacity-90 transition group">
            <img src="/team/comsats-logo.jpeg" alt="COMSATS Logo" className="h-10 w-10 rounded-full object-cover shadow-md shadow-sky-950/20 ring-2 ring-white/20 transition group-hover:scale-105" />
            <h2 className="text-lg font-bold text-sky-300 group-hover:text-sky-200 transition-colors">
              {portal === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </h2>
          </Link>
          
          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/${portal}`}
                className={linkStyles}
                onClick={() => setOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                    <item.icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-2.5">
                <img
                  src={userAvatarUrl}
                  alt="Avatar"
                  className="h-8 w-8 rounded-lg object-cover border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-200 font-semibold truncate leading-none">{profile?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-1.5">{profile?.email}</p>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={signOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-md shadow-red-950/20"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="relative z-0 min-w-0 flex-1 p-4 text-slate-300 md:p-6 flex flex-col overflow-x-hidden">
          
          {/* Desktop Top Header Bar */}
          <header className="mb-6 hidden md:flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Talent Portfolio System</span>
              <h1 className="text-lg font-bold text-white mt-0.5">Welcome, {profile?.name || 'User'}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              
              {/* Notifications Dropdown (Desktop) */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen)
                    setProfileOpen(false)
                  }}
                  className={`relative p-2.5 rounded-xl bg-slate-900/60 border border-white/5 transition hover:bg-slate-900 text-slate-300 hover:text-white ${
                    unreadCount > 0 ? 'ring-2 ring-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)] animate-pulse-subtle' : ''
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={18} className={unreadCount > 0 ? 'animate-bounce-subtle text-sky-400' : ''} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      key={unreadCount}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-slate-950 shadow-md shadow-red-500/30"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>
                {renderNotificationDropdown(true)}
              </div>

              {/* Profile Dropdown Button (Desktop) */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen)
                    setNotifOpen(false)
                  }}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-1.5 pr-3 hover:bg-slate-900 transition border border-white/5 text-left"
                >
                  <img
                    src={userAvatarUrl}
                    alt="Avatar"
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{profile?.name || 'User'}</p>
                    <span className="text-[9px] text-slate-400 capitalize">{portal}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 transition group-hover:text-slate-200" />
                </button>
                {renderProfileDropdown()}
              </div>

            </div>
          </header>

          {/* Child Routes Output */}
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SiteBackground>
  )
}
