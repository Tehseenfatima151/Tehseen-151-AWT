import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Mail, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-card border border-border rounded-2xl p-10 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3">Account Created!</h2>
        <p className="text-muted-foreground mb-2">
          We sent a verification email to
        </p>
        <p className="font-bold text-foreground mb-6">{email}</p>
        <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6 text-sm text-muted-foreground">
          <Mail size={20} className="text-primary mx-auto mb-2" />
          Please check your inbox and click the verification link to activate your account.
        </div>
        <Link to="/verify-otp" state={{ email }} className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
          Enter OTP Instead
        </Link>
        <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground mt-4">Back to sign in</Link>
      </motion.div>
    </div>
  );
}
