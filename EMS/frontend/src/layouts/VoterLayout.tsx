import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Vote, Zap, Calendar, Trophy, Key, ShieldCheck,
  History, BarChart3, Award, Bell, HeadphonesIcon, Shield,
  Smartphone, Settings, User, LogOut, Menu, Globe, Home, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';

const voterNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/voter/dashboard' },
  { label: 'My Elections', icon: Vote, href: '/voter/elections' },
  { label: 'Active Voting', icon: Zap, href: '/voter/elections/active' },
  { label: 'Upcoming', icon: Calendar, href: '/voter/elections/upcoming' },
  { label: 'Completed', icon: Trophy, href: '/voter/elections/completed' },
  { label: 'Secret IDs', icon: Key, href: '/voter/secret-ids' },
  { label: 'Verification', icon: ShieldCheck, href: '/voter/verification' },
  { label: 'Voting History', icon: History, href: '/voter/history' },
  { label: 'Results', icon: BarChart3, href: '/voter/results' },
  { label: 'Certificates', icon: Award, href: '/voter/certificates' },
  { label: 'Notifications', icon: Bell, href: '/voter/notifications' },
  { label: 'Support', icon: HeadphonesIcon, href: '/voter/support' },
  { label: 'Security', icon: Shield, href: '/voter/security' },
  { label: 'Devices', icon: Smartphone, href: '/voter/devices' },
  { label: 'Settings', icon: Settings, href: '/voter/settings' },
];

export default function VoterLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { getUserNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        <div className="flex flex-col min-w-0">
          <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight truncate leading-tight">VoteSphere</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Voter Portal</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-1 hover:bg-muted rounded">
          <Menu size={18} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {voterNav.map(item => (
          <Link key={item.href} to={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
              ${location.pathname === item.href
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-foreground hover:translate-x-0.5'}`}>
            <item.icon size={18} className="shrink-0" />
            {item.label}
          </Link>
        ))}
        <div className="pt-2 mt-2 border-t border-border/50">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-foreground text-sm font-semibold transition-all hover:translate-x-0.5">
            <Home size={18} className="shrink-0" /> Browse Elections
          </Link>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col bg-slate-50/50 dark:bg-slate-900/50 border-r border-border/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] w-72 transition-all duration-300 shrink-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-card/80 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-4 shrink-0 relative z-30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted"><Menu size={20} /></button>
          <div className="md:hidden font-black text-lg text-slate-900 dark:text-white">VoteSphere</div>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/voter/notifications" className="relative p-2 rounded-lg hover:bg-muted">
            <Bell size={18} />
            {unread > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm">{unread}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2.5 hover:bg-muted/50 p-1 pl-3 rounded-full transition-colors text-right border border-transparent hover:border-border">
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none mb-0.5">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-none">Registered Voter</p>
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
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Registered Voter</p>
                    </div>
                    <Link to="/voter/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-muted"><User size={16} /> My Profile</Link>
                    <Link to="/voter/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-muted"><Settings size={16} /> Settings</Link>
                    <div className="h-px bg-border my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"><LogOut size={16} /> Sign Out</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Bottom Nav for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 flex items-center justify-around py-2">
          {[
            { href: '/voter/dashboard', icon: LayoutDashboard },
            { href: '/voter/elections/active', icon: Zap },
            { href: '/voter/elections', icon: Vote },
            { href: '/voter/secret-ids', icon: Key },
            { href: '/voter/notifications', icon: Bell },
          ].map(item => (
            <Link key={item.href} to={item.href} className={`flex flex-col items-center p-2 rounded-xl ${location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon size={22} />
            </Link>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
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
