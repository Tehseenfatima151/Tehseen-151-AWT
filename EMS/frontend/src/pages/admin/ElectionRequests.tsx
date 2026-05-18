import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Building2, Mail, Calendar,
  RefreshCw, Clock, FileText, Users, Tag
} from 'lucide-react';
import { useElectionStore } from '../../store/electionStore';

function RejectModal({
  electionTitle,
  onConfirm,
  onClose,
}: {
  electionTitle: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="font-bold text-lg mb-2">Reject Election</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Provide a reason for rejecting <strong>"{electionTitle}"</strong>.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection..."
          className="w-full p-3 border border-border rounded-xl text-sm bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-destructive/30 mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={() => reason && onConfirm(reason)}
            disabled={!reason}
            className="flex-1 py-2.5 bg-destructive text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ElectionRequests() {
  const { elections, approveElection, rejectElection, fetchElections, isLoading } = useElectionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Always fetch fresh data when this page mounts — fetch ALL elections so admin can see pending
  useEffect(() => {
    fetchElections(); // no filter = fetch all (admin RLS allows this)
  }, []);

  const handleRefresh = () => fetchElections();

  // Filter to only pending elections
  const pending = elections.filter(e =>
    e.status === 'pending' &&
    (
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organization.toLowerCase().includes(search.toLowerCase()) ||
      e.creatorName.toLowerCase().includes(search.toLowerCase()) ||
      e.creatorEmail.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleApprove = async (id: string) => {
    setLoading(id);
    await approveElection(id);
    setLoading(null);
    setSuccess('Election approved! The creator can now publish it.');
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleReject = async (id: string, reason: string) => {
    setLoading(id);
    await rejectElection(id, reason);
    setLoading(null);
    setRejectTarget(null);
    setSuccess('Election rejected with reason provided.');
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black">Pending Election Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve or reject elections submitted by creators.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all disabled:opacity-60"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2"
        >
          <CheckCircle2 size={16} /> {success}
        </motion.div>
      )}

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, creator or organization..."
          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold whitespace-nowrap">
          <Clock size={12} /> {pending.length} pending
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw size={32} className="animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold">Loading pending elections...</p>
          </div>
        </div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl mb-4">
            ✅
          </div>
          <h3 className="font-bold text-lg mb-1">No pending elections</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            No elections are awaiting approval right now. When a creator submits an election for review, it will appear here.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all"
          >
            <RefreshCw size={14} /> Check again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(election => (
            <motion.div
              key={election.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Title + status */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-lg shrink-0">
                      {(election.title || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{election.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(election.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={13} className="shrink-0 text-primary" />
                      <span className="truncate">{election.creatorEmail || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 size={13} className="shrink-0 text-primary" />
                      <span className="truncate">{election.organization || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag size={13} className="shrink-0 text-primary" />
                      <span className="capitalize">{election.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={13} className="shrink-0 text-primary" />
                      <span className="truncate">
                        {election.startDate
                          ? new Date(election.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                        {' → '}
                        {election.endDate
                          ? new Date(election.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={13} className="shrink-0 text-primary" />
                      <span>Max {election.maxVoters?.toLocaleString()} voters</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText size={13} className="shrink-0 text-primary" />
                      <span>{election.candidates?.length ?? 0} candidate(s)</span>
                    </div>
                  </div>

                  {/* Description */}
                  {election.description && (
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
                      <FileText size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground line-clamp-2">{election.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0 lg:flex-col">
                  <button
                    onClick={() => handleApprove(election.id)}
                    disabled={loading === election.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                  >
                    {loading === election.id
                      ? <RefreshCw size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectTarget({ id: election.id, title: election.title })}
                    disabled={loading === election.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          electionTitle={rejectTarget.title}
          onConfirm={reason => handleReject(rejectTarget.id, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
