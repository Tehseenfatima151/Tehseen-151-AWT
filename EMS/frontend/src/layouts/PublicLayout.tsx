import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function PublicLayout() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const dashboardLink = user
    ? user.role === 'super_admin' ? '/admin/dashboard'
    : user.role === 'election_creator' ? '/creator/dashboard'
    : '/voter/dashboard'
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                <path d="M12 21L4 5h4l4 10 4-10h4L12 21z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">VoteSphere</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`hover:text-foreground transition-colors cursor-pointer ${location.pathname === '/' ? 'text-foreground' : ''}`}>Home</Link>
            <button onClick={() => document.getElementById('elections')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">Elections</button>
            <button onClick={() => document.getElementById('live-results')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">Statistics</button>
            <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors cursor-pointer">About</button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors mr-2">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {dashboardLink ? (
              <Link to={dashboardLink} className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-all">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/signup" className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all">
                  <UserPlus size={15} /> Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileOpen(o => !o)} className="p-2 rounded-lg hover:bg-muted">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-card overflow-hidden">
              <div className="p-4 space-y-2">
                {dashboardLink ? (
                  <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="block w-full py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl text-center">Go to Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full py-2.5 border border-border rounded-xl text-sm font-bold text-center hover:bg-muted">Login</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="block w-full py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl text-center">Sign Up</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main><Outlet /></main>

      <footer className="border-t border-border/60 bg-background pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="col-span-1">
              <span className="font-black text-2xl text-primary tracking-tight block mb-6">VoteSphere</span>
              <p className="text-muted-foreground text-sm leading-relaxed pr-4">
                The gold standard for end-to-end verifiable voting and electoral integrity management.
              </p>
            </div>
            
            <div className="md:pl-8">
              <h4 className="font-bold text-xs tracking-widest uppercase text-foreground mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><Link to="#" className="hover:text-primary transition-colors">Election Engine</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Verification Portal</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Identity API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xs tracking-widest uppercase text-foreground mb-6">Compliance</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><Link to="#" className="hover:text-primary transition-colors">Security Whitepaper</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">SOC2 Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xs tracking-widest uppercase text-foreground mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium font-semibold">
            <p>© 2026 VoteSphere. Government-Grade Integrity.</p>
            <div className="flex items-center gap-8">
              <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
