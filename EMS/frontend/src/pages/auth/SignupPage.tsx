import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Lock, Globe, Building2, RefreshCw, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: 'voter', label: 'Voter', desc: 'Participate in elections' },
  { value: 'election_creator', label: 'Election Creator', desc: 'Create & manage elections' },
];

export default function SignupPage() {
  const { signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('voter');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', organization: '', purpose: '', terms: false });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (error) clearError();
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await signup({ ...form, role });
    if (success) navigate('/verify-email', { state: { email: form.email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Animated Abstract Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-card border border-border/40 rounded-[2rem] p-8 shadow-2xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 opacity-50 pointer-events-none">
            <Globe size={20} className="text-primary" />
            <span className="font-bold text-slate-900 dark:text-white">VoteSphere</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-muted-foreground text-sm mb-6">Join VoteSphere and participate in secure elections.</p>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-xl">
          {roles.map(r => (
            <button key={r.value} type="button" onClick={() => setRole(r.value)}
              className={`py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${role === r.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={form.name} onChange={set('name')} required placeholder="John Doe" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={form.phone} onChange={set('phone')} required placeholder="+1 555-000-0000" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8} placeholder="Min. 8 characters" className="w-full pl-9 pr-10 py-2.5 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {role === 'election_creator' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Organization</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={form.organization} onChange={set('organization')} required={role === 'election_creator'} placeholder="Your organization name" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Election Purpose</label>
                <textarea value={form.purpose} onChange={set('purpose')} required={role === 'election_creator'} rows={2} placeholder="Describe why you need to run elections..." className="w-full px-3 py-2.5 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                ⚠️ Creator accounts require admin approval before you can create elections.
              </div>
            </motion.div>
          )}

          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms" checked={form.terms} onChange={set('terms')} required className="w-4 h-4 accent-primary mt-0.5" />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to VoteSphere's <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" disabled={isLoading || !form.terms}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
            {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Creating account...</> : <>Create Account <ChevronRight size={16} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
