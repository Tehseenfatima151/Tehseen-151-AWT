import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Shield, Vote, BarChart3, ArrowRight, CheckCircle2,
  Zap, Lock, Users, Calendar, Building2, ExternalLink
} from 'lucide-react';
import { useElectionStore } from '../store/electionStore';
import { electionService } from '../services/electionService';

const CATEGORY_COLORS: Record<string, string> = {
  government:   'bg-blue-100 text-blue-700',
  corporate:    'bg-purple-100 text-purple-700',
  educational:  'bg-emerald-100 text-emerald-700',
  community:    'bg-amber-100 text-amber-700',
  ngo:          'bg-rose-100 text-rose-700',
};

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
];

export default function LandingPage() {
  const { elections, fetchElections } = useElectionStore();

  // Fetch fresh public elections on mount
  useEffect(() => {
    fetchElections();
  }, []);

  // Show active + approved elections publicly
  const publicElections = elections
    .filter(e => e.status === 'active' || e.status === 'approved')
    .slice(0, 6);

  return (
    <div className="overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 flex items-center min-h-[75vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(63,70,92,0.1),transparent)] dark:bg-[radial-gradient(circle_at_top_right,rgba(63,70,92,0.4),transparent)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold text-primary mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="uppercase tracking-widest text-xs">Verified System Active</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-foreground mb-4 leading-[1.15] tracking-tight">
                Secure the Future of<br />
                <span className="text-primary">Democracy</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                The world's most trusted end-to-end verifiable voting platform. Engineered for government-grade security, transparency, and accessibility.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 group">
                  Create Election <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#elections"
                  onClick={e => { e.preventDefault(); document.getElementById('elections')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-border bg-card/50 backdrop-blur-md font-bold text-base rounded-xl hover:bg-muted transition-all"
                >
                  Browse Elections
                </a>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:block relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative z-10 bg-card p-4 rounded-[2rem] shadow-2xl border border-border/60 group"
              style={{ perspective: '1000px' }}
            >
              <div className="relative overflow-hidden rounded-[1.5rem] shadow-inner">
                <img
                  alt="Security dashboard interface"
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl border border-border/80 flex items-center gap-4 z-20"
              >
                <div className="p-3 bg-secondary/20 text-secondary rounded-full">
                  <CheckCircle2 size={24} className="fill-secondary text-white" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Integrity Status</p>
                  <p className="text-foreground font-black text-xl">100% Verifiable</p>
                </div>
              </motion.div>
            </motion.div>

            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────── */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['1.2M+', 'Votes Cast', '🗳️'], ['450+', 'Elections Run', '📋'], ['99.99%', 'Uptime', '⚡'], ['0', 'Fraud Cases', '🛡️']].map(([v, l, e]) => (
            <motion.div key={l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-3xl mb-1">{e}</p>
              <p className="text-3xl font-black text-foreground">{v}</p>
              <p className="text-sm text-muted-foreground font-semibold">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Live Elections Showcase ─────────────────────────── */}
      <section id="elections" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live & Approved Elections
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-foreground">Election Showcase</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Browse active and upcoming elections. Click any card to view details and register to vote.
              </p>
            </div>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-primary bg-card rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {/* Election cards grid */}
          {publicElections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center py-24 text-center bg-muted/30 rounded-3xl border border-dashed border-border"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-6">🗳️</div>
              <h3 className="font-bold text-xl mb-2 text-foreground">No Live Elections Yet</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                Elections will appear here once creators submit and the admin approves them. Be the first to create one!
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Create an Election <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicElections.map((election, index) => {
                const isLive = election.status === 'active';
                const coverImg = election.coverImage || COVER_IMAGES[index % COVER_IMAGES.length];
                const catColor = CATEGORY_COLORS[election.category] ?? 'bg-muted text-muted-foreground';
                const voterPct = election.maxVoters > 0
                  ? Math.round((election.currentVoters / election.maxVoters) * 100)
                  : 0;

                return (
                  <motion.div
                    key={election.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-card rounded-3xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col"
                  >
                    {/* Cover image */}
                    <div className="h-48 relative overflow-hidden shrink-0">
                      <img
                        src={coverImg}
                        alt={election.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={e => { (e.target as HTMLImageElement).src = COVER_IMAGES[0]; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Status badge */}
                      <div className="absolute top-4 left-4">
                        {isLive ? (
                          <span className="bg-red-500/90 backdrop-blur text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            LIVE
                          </span>
                        ) : (
                          <span className="bg-emerald-500/90 backdrop-blur text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            APPROVED
                          </span>
                        )}
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${catColor}`}>
                          {election.category}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div>
                        <h4 className="font-bold text-lg text-foreground line-clamp-2 mb-1">{election.title}</h4>
                        {election.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{election.description}</p>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                        {election.organization && (
                          <div className="flex items-center gap-2">
                            <Building2 size={12} className="text-primary shrink-0" />
                            <span className="truncate font-medium">{election.organization}</span>
                          </div>
                        )}
                        {election.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-primary shrink-0" />
                            <span>
                              {new Date(election.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' → '}
                              {election.endDate
                                ? new Date(election.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users size={12} className="text-primary shrink-0" />
                          <span>{election.currentVoters.toLocaleString()} / {election.maxVoters.toLocaleString()} voters</span>
                        </div>
                      </div>

                      {/* Voter progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground">Registration</span>
                          <span className="text-primary">{voterPct}% filled</span>
                        </div>
                        <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max(voterPct, 2)}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(n => (
                            <img
                              key={n}
                              alt="Voter"
                              className="w-7 h-7 rounded-full border-2 border-card object-cover"
                              src={`https://i.pravatar.cc/50?img=${index * 3 + n}`}
                            />
                          ))}
                          {election.currentVoters > 3 && (
                            <div className="w-7 h-7 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                              +{Math.min(election.currentVoters, 99)}
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/elections/${election.id}`}
                          className="flex items-center gap-1.5 text-primary font-bold text-sm hover:gap-2.5 transition-all"
                        >
                          View Details <ExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="about" className="py-20 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Why VoteSphere?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for organizations that need ironclad election integrity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Military-Grade Security', desc: 'AES-256 encryption, anti-tamper audit logs, and zero-knowledge vote storage.', color: 'text-primary bg-primary/10' },
              { icon: Vote, title: 'Anonymous Voting', desc: 'Blockchain-anchored vote anonymity. No vote can ever be traced back to a voter.', color: 'text-purple-600 bg-purple-100' },
              { icon: BarChart3, title: 'Real-Time Results', desc: 'Live dashboards with instant vote tallying and transparent result publishing.', color: 'text-emerald-600 bg-emerald-100' },
              { icon: Lock, title: 'Secret ID System', desc: 'Unique POLL-X-XXXX IDs prevent double-voting and ensure voter eligibility.', color: 'text-amber-600 bg-amber-100' },
              { icon: Zap, title: 'Smart Waitlisting', desc: 'Auto-promote waitlisted voters when capacity opens. No manual management needed.', color: 'text-blue-600 bg-blue-100' },
              { icon: CheckCircle2, title: 'Admin Oversight', desc: 'Every action is logged immutably. Admins can audit any election at any time.', color: 'text-red-600 bg-red-100' },
            ].map(f => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}><f.icon size={22} /></div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-black mb-4">Ready to Run Your First Election?</h2>
            <p className="opacity-80 mb-8">Join thousands of organizations using VoteSphere for secure, transparent elections.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-black rounded-2xl hover:opacity-90 transition-all shadow-xl">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
