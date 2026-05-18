import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
        <div className="flex items-center justify-center gap-2 mb-12">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        <div className="text-8xl font-black text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all">
            <Home size={16} /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-all">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
        <div className="flex items-center justify-center gap-2 mb-12">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        <div className="text-8xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You don't have permission to access this page. Please contact your administrator or sign in with the correct account.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all">
            Sign In
          </Link>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-all">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
        <div className="flex items-center justify-center gap-2 mb-12">
          <Globe size={22} className="text-primary" />
          <span className="font-bold text-lg text-primary">VoteSphere</span>
        </div>
        <div className="text-8xl mb-4">🔧</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">System Maintenance</h1>
        <p className="text-muted-foreground mb-4">VoteSphere is temporarily offline for scheduled maintenance to improve your experience. We'll be back shortly.</p>
        <div className="bg-muted border border-border rounded-xl p-4 text-sm text-muted-foreground">
          <strong>Expected downtime:</strong> 30 minutes<br />
          <strong>Contact:</strong> support@votesphere.com
        </div>
      </motion.div>
    </div>
  );
}
