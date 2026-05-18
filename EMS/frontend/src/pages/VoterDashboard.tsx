import { ShieldCheck, Eye, Smartphone, History, DownloadCloud, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function VoterDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero / Welcome Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
          <h1 className="font-display-lg text-3xl md:text-4xl text-foreground font-bold">Welcome back, Adrian.</h1>
          <p className="font-body-lg text-muted-foreground max-w-xl">Your identity is verified. You have 1 active election pending your participation.</p>
        </div>
        
        {/* Secret Voter ID Widget */}
        <div className="glass-card rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] flex flex-col justify-between border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">Secret Voter ID</span>
            <ShieldCheck className="text-primary" size={24} />
          </div>
          <div className="mt-4">
            <p className="text-3xl tracking-widest font-mono text-foreground font-bold">POLL-A-****</p>
            <button className="mt-2 flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
              <Eye size={18} /> Reveal ID
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Content */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Security & 2FA Status */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between border border-border bg-card/50">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Security Health</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Government-Grade Protection</h3>
            <p className="text-sm text-muted-foreground mb-6">Your account is secured with biometric 2FA and blockchain-backed integrity logs.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="text-primary" size={18} />
                <span className="text-sm font-semibold">Biometric 2FA</span>
              </div>
              <span className="text-xs text-primary font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <History className="text-primary" size={18} />
                <span className="text-sm font-semibold">Session Monitoring</span>
              </div>
              <span className="text-xs text-primary font-bold">ON</span>
            </div>
          </div>
        </div>

        {/* Upcoming Elections */}
        <div className="md:col-span-8 glass-card rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-foreground">Upcoming Elections</h3>
            <Link to="#" className="text-sm text-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            <div className="group relative bg-card border border-border p-5 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">2024 National Governance Referendum</h4>
                    <p className="text-sm text-muted-foreground font-medium">Starts in: 2 days, 4 hours</p>
                  </div>
                </div>
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shrink-0">
                  Pre-Register
                </button>
              </div>
            </div>
            
            <div className="bg-muted border border-dashed border-border p-5 rounded-xl flex items-center gap-4 opacity-70">
              <div className="h-12 w-12 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Local District 4 Council Election</h4>
                <p className="text-sm text-muted-foreground font-medium">Scheduled for: Nov 14, 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Voting History (Timeline) */}
        <div className="md:col-span-7 glass-card rounded-2xl p-6 border border-border">
          <h3 className="text-xl font-bold mb-6">Voting History</h3>
          <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {/* Timeline Item 1 */}
            <div className="relative">
              <span className="absolute -left-[29px] top-1 h-5 w-5 rounded-full bg-primary border-4 border-background ring-2 ring-primary/20"></span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary uppercase">May 12, 2024</p>
                <h4 className="text-lg font-bold text-foreground">City Infrastructure Bond B-24</h4>
                <p className="text-sm text-muted-foreground">Vote cast successfully via encrypted terminal. Verification hash: <code className="bg-card border border-border px-1.5 py-0.5 rounded font-mono text-xs">0x88...f2a</code></p>
              </div>
            </div>
            
            {/* Timeline Item 2 */}
            <div className="relative">
              <span className="absolute -left-[29px] top-1 h-5 w-5 rounded-full bg-muted-foreground border-4 border-background"></span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">Nov 04, 2023</p>
                <h4 className="text-lg font-bold text-foreground">General State Assembly Election</h4>
                <p className="text-sm text-muted-foreground">Participation confirmed. Integrity audit complete.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Results */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border bg-card/50">
            <h3 className="text-xl font-bold mb-4">Latest Results</h3>
            <div className="space-y-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-foreground">Public Parks Initiative</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Passed</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-semibold text-muted-foreground">
                  <span>72% In Favor</span>
                  <span>Verified</span>
                </div>
              </div>
              
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-foreground">Tech Zone Expansion</span>
                  <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded uppercase">Failed</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-destructive h-full rounded-full" style={{ width: '44%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-semibold text-muted-foreground">
                  <span>44% In Favor</span>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Info */}
          <div className="bg-primary/10 border border-primary/20 text-foreground p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Audit Your Vote</h4>
              <p className="text-sm font-medium opacity-80 mb-4">Download your cryptographic proof to ensure your voice was counted exactly as cast.</p>
              <button className="w-full py-3 bg-background border border-border hover:bg-muted text-foreground rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Download Audit Trail</button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 text-primary">
              <DownloadCloud size={120} />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
