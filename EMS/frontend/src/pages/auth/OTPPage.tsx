import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function OTPPage() {
  const { verifyOTP, sendOTP, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string; purpose?: string })?.email || '';
  const purpose = (location.state as { purpose?: string })?.purpose || 'verify';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(s => s - 1), 1000); return () => clearTimeout(t); }
    else setCanResend(true);
  }, [timer]);

  const handleChange = (i: number, val: string) => {
    if (error) useAuthStore.getState().clearError();
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    const type = purpose === 'reset' ? 'recovery' : 'signup';
    const success = await verifyOTP(code, email, type);
    if (success) {
      if (purpose === 'reset') navigate('/reset-password');
      else navigate('/login');
    }
  };

  const handleResend = async () => {
    await sendOTP(email);
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📩</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
        <p className="text-muted-foreground text-sm mb-8">
          We sent a 6-digit verification code to<br /><strong className="text-foreground">{email || 'your email'}</strong>
        </p>

        {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <input key={i}
                ref={el => { inputs.current[i] = el; }}
                value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1} inputMode="numeric"
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl bg-muted/30 focus:outline-none focus:border-primary focus:bg-primary/5 transition-all" />
            ))}
          </div>
          <button type="submit" disabled={isLoading || otp.join('').length < 6}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60">
            {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Verifying...</> : <>Verify Code <ChevronRight size={16} /></>}
          </button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          {canResend ? (
            <button onClick={handleResend} className="text-primary font-bold hover:underline">Resend code</button>
          ) : (
            <>Resend code in <span className="font-bold text-foreground">{timer}s</span></>
          )}
        </div>
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mt-4 inline-block">← Back to login</Link>
      </motion.div>
    </div>
  );
}
