import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuthStore as auth } from '../../store/authStore';

export default function TwoFAPage() {
  const { verify2FA, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verify2FA(code);
    if (success) {
      const u = auth.getState().user;
      const map: Record<string, string> = { super_admin: '/admin/dashboard', election_creator: '/creator/dashboard', voter: '/voter/dashboard' };
      navigate(u ? map[u.role] : '/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={30} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-muted-foreground text-sm mb-6">Enter the 6-digit code from your authenticator app for <strong>{user?.email}</strong></p>

        {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} inputMode="numeric" placeholder="000000"
            className="w-full text-center text-3xl font-bold tracking-widest py-4 border-2 border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary transition-all" />
          <p className="text-xs text-muted-foreground">Hint: any 6-digit code works for demo (try <code className="bg-muted px-1 rounded">000000</code>)</p>
          <button type="submit" disabled={isLoading || code.length < 6}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60">
            {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Verifying...</> : 'Verify & Continue'}
          </button>
        </form>
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mt-6 inline-block">← Use a different account</Link>
      </motion.div>
    </div>
  );
}
