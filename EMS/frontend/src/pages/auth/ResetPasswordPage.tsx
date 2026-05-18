import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Lock, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ResetPasswordPage() {
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    await resetPassword('mock-token', password);
    setDone(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-8">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Password Updated!</h2>
            <p className="text-muted-foreground text-sm">Redirecting you to sign in...</p>
          </motion.div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Lock size={26} className="text-primary" /></div>
            <h2 className="text-2xl font-bold mb-2">Set new password</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>
            {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60">
                {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </form>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mt-4 inline-block">← Back to login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
