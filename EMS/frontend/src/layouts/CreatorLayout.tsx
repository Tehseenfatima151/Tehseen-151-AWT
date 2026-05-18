import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Vote, PlusCircle, FileText, CheckCircle2, Zap,
  Trophy, Users, Key, Clock, BarChart2, Bell, BarChart3,
  Download, CreditCard, Settings, User, LogOut, Menu, Globe,
  ChevronDown, ChevronRight, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useThemeStore } from '../store/themeStore';

const creatorNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/creator/dashboard' },
  {
    label: 'My Elections', icon: Vote, children: [
      { label: 'All Elections', href: '/creator/elections', icon: Vote },
      { label: 'Create Election', href: '/creator/elections/create', icon: PlusCircle },
      { label: 'Drafts', href: '/creator/elections/drafts', icon: FileText },
      { label: 'Approved', href: '/creator/elections/approved', icon: CheckCircle2 },
      { label: 'Active', href: '/creator/elections/active', icon: Zap },
      { label: 'Completed', href: '/creator/elections/completed', icon: Trophy },
    ]
  },
  { label: 'Candidates', icon: Users, href: '/creator/candidates' },
  { label: 'Voter Management', icon: User, href: '/creator/voters' },
  { label: 'Secret IDs', icon: Key, href: '/creator/secret-ids' },
  { label: 'Waitlist', icon: Clock, href: '/creator/waitlist' },
  { label: 'Live Results', icon: BarChart2, href: '/creator/results' },
  { label: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
  { label: 'Notifications', icon: Bell, href: '/creator/notifications' },
  { label: 'Reports', icon: FileText, href: '/creator/reports' },
  { label: 'Export Center', icon: Download, href: '/creator/export' },
  { label: 'Billing', icon: CreditCard, href: '/creator/billing' },
  { label: 'Settings', icon: Settings, href: '/creator/settings' },
];

function NavLink({ item, collapsed }: { item: typeof creatorNav[0]; collapsed: boolean }) {
  const location = useLocation();
  const [open, setOpen] = useState(() =>
    'children' in item && item.children ? item.children.some(c => location.pathname === c.href) : false
  );
  const isActive = 'href' in item && item.href ? location.pathname === item.href
    : 'children' in item && item.children ? item.children.some(c => location.pathname === c.href) : false;

  if ('children' in item && item.children) {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
            ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-foreground'}`}>
          <item.icon size={18} className="shrink-0" />
          {!collapsed && <><span className="flex-1 text-left">{item.label}</span>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                {item.children.map(child => (
                  <Link key={child.href} to={child.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all
                      ${location.pathname === child.href ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}>
                    <child.icon size={15} className="shrink-0" />
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link to={(item as { href: string }).href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
        ${isActive ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-foreground hover:translate-x-0.5'}`}>
      <item.icon size={18} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function CreatorLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { getUserNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notifications = user ? getUserNotifications(user.id) : [];
  const unread = notifications.filter(n => !n.isRead).length;
  const handleLogout = () => { logout(); navigate('/login'); };

  const LogoSVG = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
      <path d="M12 21L4 5h4l4 10 4-10h4L12 21z" fill="currentColor" />
    </svg>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center gap-3 px-5 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
          <LogoSVG />
        </div>
        {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight truncate leading-tight">VoteSphere</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Creator Portal</span>
        </div>
      )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {creatorNav.map(item => <NavLink key={item.label} item={item as typeof creatorNav[0]} collapsed={collapsed} />)}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className={`hidden md:flex flex-col bg-slate-50/50 dark:bg-slate-900/50 border-r border-border/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-all duration-300 shrink-0 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-card/80 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-4 shrink-0 relative z-30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted"><Menu size={20} /></button>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/creator/notifications" className="relative p-2 rounded-lg hover:bg-muted">
            <Bell size={18} />
            {unread > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm">{unread}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2.5 hover:bg-muted/50 p-1 pl-3 rounded-full transition-colors text-right border border-transparent hover:border-border">
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none mb-0.5">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-none">Election Creator</p>
              </div>
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name} className="w-8 h-8 rounded-full border border-border bg-card" />
            </button>
            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    <div className="px-4 py-3 border-b border-border bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm font-bold truncate">{user?.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Election Creator</p>
                    </div>
                    <Link to="/creator/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-muted"><User size={16} /> My Profile</Link>
                    <Link to="/creator/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-muted"><Settings size={16} /> Settings</Link>
                    <div className="h-px bg-border my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"><LogOut size={16} /> Sign Out</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="p-4 md:p-6 lg:p-8 min-h-full">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
