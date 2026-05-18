import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Globe, ChevronRight, Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';


const ROLE_REDIRECTS: Record<string, string> = {
  super_admin: '/admin/dashboard',
  election_creator: '/creator/dashboard',
  voter: '/voter/dashboard',
};

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login({ email, password, rememberMe });
    if (success) {
      const user = useAuthStore.getState().user;
      if (user) navigate(ROLE_REDIRECTS[user.role]);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Animated Abstract Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] min-h-[600px] bg-card border border-border/40 rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0b1c30] via-[#1e1b4b] to-primary flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(53,37,205,0.3),transparent)]" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity w-fit cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">VoteSphere</h1>
              <p className="text-white/50 text-xs uppercase tracking-widest">Secure Elections</p>
            </div>
          </Link>
          <h2 className="text-white font-bold text-4xl leading-tight mb-6">
            The Future of<br /><span className="text-primary-fixed-dim">Democratic Voting</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Government-grade security. Blockchain-anchored integrity. Complete transparency. Built for the modern democratic process.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[['1.2M+', 'Votes Cast'], ['450+', 'Elections Run'], ['99.99%', 'Uptime'], ['0', 'Fraud Cases']].map(([val, label]) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-primary-fixed-dim font-bold text-2xl">{val}</p>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[380px]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>

          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
            <Globe size={24} className="text-primary" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">VoteSphere</span>
          </Link>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to access your dashboard</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
              <Shield size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={email} onChange={e => { if (error) clearError(); setEmail(e.target.value); }} required placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { if (error) clearError(); setPassword(e.target.value); }} required placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me for 30 days</label>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-primary/20">
              {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Signing in...</> : <>Sign In <ChevronRight size={16} /></>}
            </button>
          </form>


          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
