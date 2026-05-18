import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Globe, ChevronLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-8">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>

        {!sent ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Mail size={26} className="text-primary" /></div>
            <h2 className="text-2xl font-bold mb-2">Reset your password</h2>
            <p className="text-muted-foreground text-sm mb-6">Enter your email address and we'll send you a password reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60">
                {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
            <p className="text-muted-foreground text-sm mb-6">We sent a password reset link to <strong>{email}</strong>. Check your email and follow the instructions.</p>
            <button onClick={() => navigate('/verify-otp', { state: { email, purpose: 'reset' } })}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all">
              Enter OTP Code
            </button>
          </motion.div>
        )}

        <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-6 font-medium">
          <ChevronLeft size={16} /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
