import { User, Lock, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [role, setRole] = useState<'Voter' | 'Creator' | 'Super Admin'>('Voter');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate based on role (mock implementation)
      if (role === 'Voter') navigate('/voter/dashboard');
      else if (role === 'Creator') navigate('/creator/dashboard');
      else navigate('/admin/dashboard');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-[16px] p-8 md:p-10 mb-8 w-full border border-white/20"
    >
      {/* Role Toggle */}
      <div className="flex bg-surface-container-low p-1 rounded-xl mb-6">
        {['Voter', 'Creator', 'Super Admin'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r as any)}
            className={`flex-1 py-2 rounded-lg font-label-sm text-sm transition-all ${
              role === r 
                ? 'bg-background text-primary shadow-sm border border-outline-variant/20 font-bold' 
                : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* User ID Field */}
        <div className="space-y-2">
          <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">
            Email / User ID
          </label>
          <div className="relative text-on-surface">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              required
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-foreground placeholder:text-muted-foreground" 
              placeholder="Enter your credentials" 
              type="text"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block font-semibold">
              Password
            </label>
            <Link to="/forgot-password" className="font-label-sm text-sm text-primary hover:underline transition-all font-medium">
              Forgot Password?
            </Link>
          </div>
          <div className="relative text-on-surface">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              required
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-foreground placeholder:text-muted-foreground" 
              placeholder="••••••••" 
              type="password"
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-b from-primary to-primary-container text-primary-foreground rounded-xl font-headline-md text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-[0.97] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none" 
          type="submit"
        >
          <span>{isLoading ? 'Authenticating...' : 'Secure Sign In'}</span>
          {isLoading && <RefreshCw className="animate-spin" size={20} />}
        </button>
      </form>

      {/* SSO Separator */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30"></div>
        </div>
        <div className="relative flex justify-center text-sm font-medium">
          <span className="bg-background px-4 text-on-surface-variant rounded-full">Enterprise SSO</span>
        </div>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-3 gap-4">
        <button type="button" className="flex items-center justify-center p-3 bg-background border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">
          <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCydpp4lB8-1poi8oo-r9kaCCYPwK3k2yzVRwxbmd4wp_rCNJDkeaYtvrCeraT6xzO9Zb8W0af_lVCS3Qu6Vtbk25rB8ZhZIZElkVakBTkd2Jbk3omo8WPdXMFN9ahMXp_WsD7pucZBbV7bQXxgPu88v6mO1fR99SVhbSsyw4ijMQKqRBf7bOMaxEPvSaUhwRC0Q6_6RW6gP4zZl1rVlIDXDwse56clQguoiB68eNYFwXdLQBGtZ07k91DlzKk0bHLz_1LDGz-uB5E"/>
        </button>
        <button type="button" className="flex items-center justify-center p-3 bg-background border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">
          <img alt="Apple" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5UWUqLplMIExEEupVOZ2JCILev1gtZPzelwnqB3_hl3dI0RNrzzwAZa_184t9Xjv44U0teYlHAhQMEirseEgqrgoKP2nQ_pjD7EkuIhED4Vx7A2eERaJjaUxTb8rh9jfwZ2pvvfpLzwFLDagSR9lQoV4Vq4hDBinArjTeLgpg88guJ-gcAdRrUYYtnInedlp6JYLpCMIaP_HFrq4uIh-MTFV5tzooyauN2kOD9kvanMob3i8TMbccZtZ0FZKxvsSPpzcyn40Q-vQ"/>
        </button>
        <button type="button" className="flex items-center justify-center p-3 bg-background border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">
          <img alt="Microsoft" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT9Ru9aWlvzMhC0hPnmefF2Cf3EBQsSOfEfTkx_ByM46XyfCCZj_6_tYBchMxNdErMdHMEng03QFZ3o8Fh3r7lkos4STpKgdsWDqzejs1tgEE8-iyJ8mkB68fNZsclyXK9SuZT1pwhRVF0qpME6P2AxwXi_7MA9bq1ij3CAzv3VVEfBI0_sH5iEBCCRwrV0G1Xq33Ngh0Hu1-Umt1sIshgDo3suctR_jvbsiNZ4uZaJAw-zGg-5lnbnRTZbsJxHpHteMZCHz0_ED0"/>
        </button>
      </div>
    </motion.div>
  );
}
