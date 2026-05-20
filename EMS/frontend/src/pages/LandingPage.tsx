import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Shield, Vote, BarChart3, ArrowRight, CheckCircle2,
  Zap, Lock, Users, Calendar, Building2, ExternalLink,
  Clock, Fingerprint, AlertCircle, Download, RefreshCw, Trophy, Search, X
} from 'lucide-react';
import { useElectionStore } from '../store/electionStore';
import { electionService } from '../services/electionService';
import { votingService } from '../services/votingService';
import { supabase } from '../lib/supabase';

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

const formatLocalTimestamp = (ts: string) => {
  return new Date(ts).toLocaleString('en-US', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

const maskVoterCode = (code: string) => {
  if (!code) return '••••••••';
  const parts = code.split('-');
  if (parts.length < 3) return code;
  return `${parts[0]}-${parts[1]}-••••${parts[2].slice(-4)}`;
};

export default function LandingPage() {
  const { elections, fetchElections } = useElectionStore();

  // Detail & realtime states
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [electionVotes, setElectionVotes] = useState<Record<string, any>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [liveResults, setLiveResults] = useState<Record<string, any[]>>({});

  // Filters State
  const [showcaseTab, setShowcaseTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  // Audit Modal States
  const [activeAuditElection, setActiveAuditElection] = useState<any | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditTab, setAuditTab] = useState<'ledger' | 'results'>('ledger');
  const [auditVotes, setAuditVotes] = useState<any[]>([]);
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditError, setAuditError] = useState<string | null>(null);

  // Fetch elections on mount
  useEffect(() => {
    fetchElections();
  }, []);

  // Fetch and subscribe to live election results
  useEffect(() => {
    const liveElections = elections.filter(e => e.status === 'active');
    
    liveElections.forEach(async (election) => {
      try {
        const results = await votingService.getElectionResults(election.id);
        setLiveResults(prev => ({ ...prev, [election.id]: results }));
      } catch (err) {
        console.error('Error fetching live results for', election.id, err);
      }
    });

    const channels = liveElections.map(election => 
      votingService.subscribeToResults(election.id, async () => {
        try {
          const results = await votingService.getElectionResults(election.id);
          setLiveResults(prev => ({ ...prev, [election.id]: results }));
        } catch (err) {
          console.error('Error updating live results for', election.id, err);
        }
      })
    );

    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [elections]);

  // Show public elections based on filter tab
  const publicElections = elections
    .filter(e => {
      if (showcaseTab === 'all') return e.status === 'active' || e.status === 'approved' || e.status === 'completed';
      if (showcaseTab === 'live') return e.status === 'active';
      if (showcaseTab === 'upcoming') return e.status === 'approved';
      if (showcaseTab === 'completed') return e.status === 'completed';
      return true;
    })
    .slice(0, 6);

  // Load election details (votes) for selected election
  const loadElectionDetails = useCallback(async (electionId: string) => {
    if (loadingMap[electionId]) return;
    setLoadingMap(prev => ({ ...prev, [electionId]: true }));
    setIsLoading(true);
    try {
      const detailedVotes = await votingService.getDetailedVotes(electionId);
      setVotes(detailedVotes);
      setElectionVotes(prev => ({ ...prev, [electionId]: detailedVotes }));
    } catch (err) {
      console.error('Error loading election details:', err);
    } finally {
      setLoadingMap(prev => ({ ...prev, [electionId]: false }));
      setIsLoading(false);
    }
  }, [loadingMap]);

  // Subscribe to realtime updates when an election is selected
  useEffect(() => {
    if (!selectedElectionId) return;
    loadElectionDetails(selectedElectionId);

    const channel = votingService.subscribeToResults(selectedElectionId, async () => {
      try {
        const detailedVotes = await votingService.getDetailedVotes(selectedElectionId);
        setVotes(detailedVotes);
        setElectionVotes(prev => ({ ...prev, [selectedElectionId]: detailedVotes }));
        fetchElections();
      } catch (err) {
        console.error('Realtime updates fetch error:', err);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedElectionId, loadElectionDetails, fetchElections]);

  // Modal Load & Subscriptions
  const handleOpenAuditModal = async (election: any) => {
    setActiveAuditElection(election);
    setAuditModalOpen(true);
    setAuditTab('ledger');
    setIsAuditLoading(true);
    setAuditSearchQuery('');
    setAuditError(null);
    setAuditVotes([]);
    setAuditResults([]);
    try {
      const [votes, results] = await Promise.all([
        votingService.getDetailedVotes(election.id),
        votingService.getElectionResults(election.id)
      ]);
      setAuditVotes(votes);
      setAuditResults(results);
    } catch (err) {
      console.error('Error loading audit information:', err);
      setAuditError('Failed to load audit data. Please try again.');
    } finally {
      setIsAuditLoading(false);
    }
  };

  useEffect(() => {
    if (!activeAuditElection || activeAuditElection.status !== 'active') return;

    // Use a distinct channel name to avoid conflict with the live-results subscription
    const channel = supabase.channel(`audit-modal:${activeAuditElection.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes', filter: `election_id=eq.${activeAuditElection.id}` }, async () => {
        try {
          const [votes, results] = await Promise.all([
            votingService.getDetailedVotes(activeAuditElection.id),
            votingService.getElectionResults(activeAuditElection.id)
          ]);
          setAuditVotes(votes);
          setAuditResults(results);
        } catch (err) {
          console.error('Realtime audit updates fetch error:', err);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeAuditElection]);

  const filteredAuditVotes = auditVotes.filter(v => {
    const q = auditSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      v.secretIdCode?.toLowerCase().includes(q) ||
      v.voterHash?.toLowerCase().includes(q) ||
      v.candidateName?.toLowerCase().includes(q)
    );
  });

  const getCandidateMeta = (candidateId: string) => {
    const match = activeAuditElection?.candidates?.find((c: any) => c.id === candidateId);
    return {
      designation: match?.designation || 'Candidate Profile',
      photo: match?.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${candidateId}`
    };
  };

  const getLeader = () => {
    if (auditResults.length === 0) return null;
    return [...auditResults].sort((a, b) => b.voteCount - a.voteCount)[0];
  };

  const leader = getLeader();

  // Print-based PDF generator
  const handleDownloadPDF = () => {
    if (!activeAuditElection) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = `${activeAuditElection.title} - Official Verification Audit`;
    const sortedResults = [...auditResults].sort((a, b) => b.voteCount - a.voteCount);
    
    const standingsRows = sortedResults.map((r, i) => `
      <tr>
        <td style="font-weight: bold; width: 10%; padding: 10px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
        <td style="font-weight: bold; width: 45%; padding: 10px; border-bottom: 1px solid #e5e7eb;">${r.candidateName} ${i === 0 && r.voteCount > 0 ? '🏆' : ''}</td>
        <td style="width: 25%; font-weight: bold; padding: 10px; border-bottom: 1px solid #e5e7eb;">${r.voteCount.toLocaleString()} votes</td>
        <td style="width: 20%; color: #3b82f6; font-weight: bold; padding: 10px; border-bottom: 1px solid #e5e7eb;">${Math.round(r.percentage)}%</td>
      </tr>
    `).join('');

    const ledgerRows = auditVotes.map((v) => `
      <tr>
        <td style="font-family: monospace; font-weight: bold; padding: 10px; border-bottom: 1px solid #e5e7eb;">${maskVoterCode(v.secretIdCode)}</td>
        <td style="font-family: monospace; font-size: 11px; padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${v.voterHash}</td>
        <td style="font-weight: bold; color: #10b981; padding: 10px; border-bottom: 1px solid #e5e7eb;">${v.candidateName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${formatLocalTimestamp(v.castedAt)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Inter, system-ui, sans-serif; color: #1f2937; padding: 40px; line-height: 1.5; }
            .header { border-bottom: 3px double #e5e7eb; padding-bottom: 24px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; }
            .title-area { flex-grow: 1; }
            .title { font-size: 26px; font-weight: 900; color: #111827; margin: 0 0 6px 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 13px; color: #6b7280; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .stamp { border: 3px solid #10b981; color: #10b981; font-weight: 950; font-size: 14px; padding: 6px 12px; border-radius: 6px; transform: rotate(-2deg); text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 35px; }
            .meta-item { background: #f9fafb; padding: 14px; border-radius: 10px; border: 1px solid #e5e7eb; }
            .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; letter-spacing: 0.5px; }
            .meta-val { font-size: 14px; font-weight: 800; color: #374151; }
            h3 { font-size: 15px; font-weight: 800; color: #111827; margin: 30px 0 15px 0; border-left: 4px solid #3b82f6; padding-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; margin-bottom: 30px; }
            th { background: #f3f4f6; padding: 10px 12px; font-weight: 700; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #d1d5db; font-size: 11px; }
            td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; word-break: break-all; }
            tr:nth-child(even) td { background: #fafafa; }
            .footer { margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 9px; color: #9ca3af; text-align: center; line-height: 1.6; }
            @media print { body { padding: 20px; } h3 { page-break-after: avoid; } tr { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-area">
              <h1 class="title">VoteSphere™ Election Audit Report</h1>
              <p class="subtitle">Cryptographic Verification & Results Ledger</p>
            </div>
            <div class="stamp">VERIFIED SYSTEM</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><div class="meta-label">Election Title</div><div class="meta-val">${activeAuditElection.title}</div></div>
            <div class="meta-item"><div class="meta-label">Organization</div><div class="meta-val">${activeAuditElection.organization || 'Public'}</div></div>
            <div class="meta-item"><div class="meta-label">Total Ballots Cast</div><div class="meta-val">${auditVotes.length} / ${activeAuditElection.maxVoters?.toLocaleString() || 'Unlimited'}</div></div>
            <div class="meta-item"><div class="meta-label">Date Generated</div><div class="meta-val">${new Date().toLocaleString()}</div></div>
          </div>
          <h3>1. Candidate Standing Summary</h3>
          <table>
            <thead><tr><th style="width: 10%;">Rank</th><th style="width: 45%;">Candidate Name</th><th style="width: 25%;">Votes Accumulated</th><th style="width: 20%;">Percentage Share</th></tr></thead>
            <tbody>${standingsRows.length > 0 ? standingsRows : '<tr><td colspan="4" style="text-align: center;">No candidate records found.</td></tr>'}</tbody>
          </table>
          <h3>2. Cryptographic Ballot Trail</h3>
          <table>
            <thead><tr><th style="width: 20%;">Masked Voter Code</th><th style="width: 45%;">Cryptographic Receipt (Voter Hash)</th><th style="width: 20%;">Selected Choice</th><th style="width: 15%;">Timestamp</th></tr></thead>
            <tbody>${ledgerRows.length > 0 ? ledgerRows : '<tr><td colspan="4" style="text-align: center;">No ballots cast.</td></tr>'}</tbody>
          </table>
          <div class="footer">VoteSphere Security Network. This audit document was compiled directly from immutable decentralized ballot entries. All cryptographic voter codes are masked to preserve individual secrecy.</div>
          <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
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

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {(['all', 'live', 'upcoming', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setShowcaseTab(tab)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  showcaseTab === tab
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {tab === 'all' ? '🌐 All' : tab === 'live' ? '🔴 Live' : tab === 'upcoming' ? '📅 Upcoming' : '✅ Completed'}
              </button>
            ))}
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
              <h3 className="font-bold text-xl mb-2 text-foreground">No Elections Found</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                No elections match the current filter. Try a different category or create your own.
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
                const isCompleted = election.status === 'completed';
                const isUpcoming = election.status === 'approved';
                const coverImg = election.coverImage || COVER_IMAGES[index % COVER_IMAGES.length];
                const catColor = CATEGORY_COLORS[election.category] ?? 'bg-muted text-muted-foreground';
                const turnoutPercentage = election.maxVoters > 0
                  ? Math.round((election.currentVoters / election.maxVoters) * 100)
                  : 0;

                // Countdown calculation
                const now = new Date();
                const target = isLive ? new Date(election.endDate) : new Date(election.startDate);
                const diff = target.getTime() - now.getTime();
                const countdownValid = diff > 0;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const mins = Math.floor((diff / (1000 * 60)) % 60);
                const secs = Math.floor((diff / 1000) % 60);

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
                        ) : isCompleted ? (
                          <span className="bg-blue-500/90 backdrop-blur text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <CheckCircle2 size={10} />
                            COMPLETED
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

                      {/* Countdown timer */}
                      {(isLive || isUpcoming) && countdownValid && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                          <Clock size={10} />
                          <span>{isLive ? 'Ends in:' : 'Starts in:'} {days}d {hours}h {String(mins).padStart(2, '0')}m {String(secs).padStart(2, '0')}s</span>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-6 flex-1 flex flex-col gap-3">
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
                            <span className="ml-auto text-muted-foreground/60 shrink-0 flex items-center gap-1">
                              <Users size={10} />
                              {election.candidates?.length ?? 0} candidates
                            </span>
                          </div>
                        )}
                        {election.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-primary shrink-0" />
                            <span>
                              {new Date(election.startDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              {' — '}
                              {election.endDate
                                ? new Date(election.endDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Registration Capacity */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                          <span className="text-muted-foreground">Registration Capacity</span>
                          <span className="text-primary">{election.currentVoters?.toLocaleString()} / {election.maxVoters?.toLocaleString()} ({turnoutPercentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden border border-primary/5">
                          <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(turnoutPercentage, 2)}%` }} />
                        </div>
                      </div>

                      {/* Actions Group */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-auto">
                        {/* Audit Ledger - always visible */}
                        <button
                          onClick={() => handleOpenAuditModal(election)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs rounded-xl transition-all shadow-sm flex-1 shrink-0"
                        >
                          <Shield size={13} />
                          <span>Audit Ledger</span>
                        </button>

                        {isLive ? (
                          election.currentVoters < election.maxVoters ? (
                            <Link
                              to="/login"
                              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 flex-1 text-center"
                            >
                              <span>Cast Vote</span>
                              <ArrowRight size={12} />
                            </Link>
                          ) : (election as any).isWaitlistEnabled ? (
                            <Link
                              to="/login"
                              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex-1 text-center animate-pulse"
                            >
                              <span>Join Waitlist</span>
                              <Clock size={12} />
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-muted text-muted-foreground border border-border font-black text-xs rounded-xl cursor-not-allowed flex-1 text-center"
                            >
                              <span>Capacity Reached</span>
                            </button>
                          )
                        ) : (
                          <Link
                            to={`/elections/${election.id}`}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-border hover:border-primary/30 text-muted-foreground hover:text-primary font-bold text-xs rounded-xl transition-all shadow-sm flex-1 text-center"
                          >
                            <span>Details</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Live Results Showcase ─────────────────────────── */}
      {elections.filter(e => e.status === 'active').length > 0 && (
        <section id="live-results" className="py-20 px-4 bg-muted/10 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-3"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Real-Time Standings
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-foreground">Live Election Results</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Watch the votes come in live. Cryptographically verified and instantly updated.
              </p>
            </div>

            <div className="space-y-12">
              {elections.filter(e => e.status === 'active').map(election => {
                const results = liveResults[election.id] || [];
                const leader = [...results].sort((a, b) => b.voteCount - a.voteCount)[0];

                return (
                  <motion.div
                    key={`live-res-${election.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-3xl border border-border/80 overflow-hidden shadow-xl shadow-primary/5"
                  >
                    <div className="bg-muted/30 border-b border-border/50 px-6 py-4 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-foreground">{election.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Users size={14} />
                        <span>{election.currentVoters} / {election.maxVoters} Votes</span>
                      </div>
                    </div>
                    <div className="p-6">
                      {results.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="mx-auto mb-2 opacity-50" size={24} />
                          <p className="text-sm font-semibold">No votes cast yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {results.map((r: any) => {
                            const isWinner = leader && leader.candidateId === r.candidateId && r.voteCount > 0;
                            const match = election.candidates?.find((c: any) => c.id === r.candidateId);
                            const photo = match?.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${r.candidateId}`;
                            const designation = match?.designation || 'Candidate';

                            return (
                              <div
                                key={r.candidateId}
                                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-[130px] ${
                                  isWinner
                                    ? 'bg-amber-500/[0.03] border-amber-500/30'
                                    : 'bg-muted/10 border-border/50'
                                }`}
                              >
                                <div className="flex gap-3">
                                  <img src={photo} alt={r.candidateName} className="w-10 h-10 rounded-xl object-cover border border-border" />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-extrabold text-sm text-foreground line-clamp-1">{r.candidateName}</h4>
                                      {isWinner && <Trophy size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider line-clamp-1">{designation}</p>
                                  </div>
                                </div>
                                <div className="space-y-1.5 mt-auto">
                                  <div className="flex justify-between items-center text-[10px] font-black">
                                    <span className="text-muted-foreground uppercase tracking-wider">Votes</span>
                                    <span className="text-foreground font-mono">{r.voteCount.toLocaleString()} ({Math.round(r.percentage)}%)</span>
                                  </div>
                                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/30">
                                    <div
                                      className={`h-full rounded-full transition-all duration-1000 ${
                                        isWinner ? 'bg-amber-500' : 'bg-primary'
                                      }`}
                                      style={{ width: `${r.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Audit Modal Popup ───────────────────────────────── */}
      <AnimatePresence>
        {auditModalOpen && activeAuditElection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Sticky Secure Header */}
              <div className="sticky top-0 bg-card border-b border-border/80 px-6 py-5 flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Decentralized Audit Trail</span>
                    <h3 className="font-extrabold text-lg text-foreground line-clamp-1">{activeAuditElection.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isAuditLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => setAuditModalOpen(false)}
                    className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Secure Info banner */}
              <div className="bg-muted/40 border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  This public verification ledger displays cryptographically masked voter ID credentials mapping to their designated selections.
                </p>
                <div className="flex gap-2 shrink-0">
                  <span className="text-[9px] font-black tracking-wider uppercase bg-card border border-border px-2 py-1 rounded font-mono text-muted-foreground">AES-256</span>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-card border border-border px-2 py-1 rounded font-mono text-muted-foreground">SHA-256</span>
                </div>
              </div>

              {/* Tab Selector inside Modal */}
              <div className="flex border-b border-border/80 px-6 py-2 bg-card">
                <button
                  onClick={() => setAuditTab('ledger')}
                  className={`px-4 py-2.5 text-xs font-black relative transition-all ${
                    auditTab === 'ledger' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Verification Ballot Trail
                  {auditTab === 'ledger' && (
                    <motion.div layoutId="modalTabId" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setAuditTab('results')}
                  className={`px-4 py-2.5 text-xs font-black relative transition-all ${
                    auditTab === 'results' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Detailed Vote Standings
                  {auditTab === 'results' && (
                    <motion.div layoutId="modalTabId" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 min-h-[350px]">
                {isAuditLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 gap-3">
                    <RefreshCw size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-bold font-mono">Synchronizing Decentralized Audit Records...</span>
                  </div>
                ) : auditError ? (
                  <div className="text-center py-16 border border-dashed border-red-300 rounded-2xl bg-red-50/30 dark:bg-red-900/10">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={28} />
                    <p className="text-sm font-bold text-foreground mb-1">Failed to Load Audit Data</p>
                    <p className="text-[11px] text-muted-foreground mb-4">{auditError}</p>
                    <button
                      onClick={() => handleOpenAuditModal(activeAuditElection)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all"
                    >
                      <RefreshCw size={13} />
                      Retry
                    </button>
                  </div>
                ) : auditTab === 'ledger' ? (
                  <div className="space-y-4">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={16} />
                      <input
                        type="text"
                        placeholder="Search Voter ID (e.g. POLL-C-0002) or Candidate..."
                        value={auditSearchQuery}
                        onChange={e => setAuditSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {filteredAuditVotes.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/10">
                        <AlertCircle className="mx-auto text-muted-foreground/60 mb-2" size={24} />
                        <p className="text-xs font-bold text-foreground">
                          {auditSearchQuery.trim()
                            ? 'No matching ballots found'
                            : activeAuditElection?.status === 'active'
                              ? 'No votes cast yet'
                              : 'No ballots recorded'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {auditSearchQuery.trim()
                            ? 'Adjust your query or check for spelling errors.'
                            : activeAuditElection?.status === 'active'
                              ? 'Votes will appear here in real-time as they are cast.'
                              : 'No votes were recorded for this election.'}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-border/80 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border/80 text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                                <th className="p-4">Voter Code</th>
                                <th className="p-4">Candidate Choice</th>
                                <th className="p-4">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {filteredAuditVotes.map((v) => (
                                <tr key={v.id} className="hover:bg-muted/20 transition-all font-medium">
                                  <td className="p-4">
                                    <span className="font-mono font-bold tracking-wider bg-muted px-2.5 py-1 rounded-lg border border-border/60">
                                      {maskVoterCode(v.secretIdCode)}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px] rounded-full border border-sky-500/20">
                                      {v.candidateName}
                                    </span>
                                  </td>
                                  <td className="p-4 font-semibold text-muted-foreground text-[11px]">
                                    {formatLocalTimestamp(v.castedAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {auditResults.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/10">
                        <AlertCircle className="mx-auto text-muted-foreground/60 mb-2" size={24} />
                        <p className="text-xs font-bold text-foreground">Standings Not Initialized</p>
                        <p className="text-[10px] text-muted-foreground">Votes have not been registered for this election module yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {auditResults.map((r: any) => {
                          const meta = getCandidateMeta(r.candidateId);
                          const isWinner = leader && leader.candidateId === r.candidateId && r.voteCount > 0;
                          
                          return (
                            <div
                              key={r.candidateId}
                              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-[150px] relative overflow-hidden ${
                                isWinner
                                  ? 'bg-amber-500/[0.03] border-amber-500/30 hover:border-amber-500/50'
                                  : 'bg-muted/20 border-border/80 hover:border-primary/20'
                              }`}
                            >
                              <div className="flex gap-4">
                                <img
                                  src={meta.photo}
                                  alt={r.candidateName}
                                  className="w-12 h-12 rounded-xl object-cover border border-border"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-extrabold text-sm text-foreground">{r.candidateName}</h4>
                                    {isWinner && (
                                      <Trophy size={14} className="text-amber-500 fill-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{meta.designation}</p>
                                </div>
                              </div>

                              <div className="space-y-1.5 mt-auto">
                                <div className="flex justify-between items-center text-[10px] font-black">
                                  <span className="text-muted-foreground uppercase tracking-wider">Vote standings</span>
                                  <span className="text-foreground font-mono">{r.voteCount.toLocaleString()} votes ({Math.round(r.percentage)}%)</span>
                                </div>
                                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${
                                      isWinner 
                                        ? 'from-amber-500 to-amber-400' 
                                        : 'from-primary to-secondary'
                                    }`}
                                    style={{ width: `${r.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-muted/20 border-t border-border/80 px-6 py-4 flex justify-between items-center shrink-0 z-10 text-[9px] text-muted-foreground font-bold">
                <span>Secure Verification Terminal Active</span>
                <span>Cryptographic Proof Status: Verified ✅</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
