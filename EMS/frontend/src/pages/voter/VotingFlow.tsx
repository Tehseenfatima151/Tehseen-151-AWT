import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Key, ChevronRight, ChevronLeft, RefreshCw, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { useVotingStore } from '../../store/votingStore';
import { CountdownTimer } from '../../components/common/UIComponents';

const STEPS = ['Verify Identity', 'Select Candidate', 'Confirm Vote', 'Success'];

export default function VotingFlow() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { elections } = useElectionStore();
  const { registrations, verifySecretId, castVote, isLoading } = useVotingStore();

  const election = elections.find(e => e.id === electionId);
  const registration = registrations.find(r => r.electionId === electionId && r.userId === user?.id);

  const [step, setStep] = useState(0);
  const [secretIdInput, setSecretIdInput] = useState('');
  const [secretIdError, setSecretIdError] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [voteHash, setVoteHash] = useState('');

  if (!election || !registration) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold mb-2">Not Registered</h2>
        <p className="text-muted-foreground mb-6">You are not registered for this election.</p>
        <button onClick={() => navigate('/voter/elections')} className="px-6 py-3 bg-primary text-white font-bold rounded-xl">Back to Elections</button>
      </div>
    );
  }

  if (registration.status === 'voted') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Already Voted</h2>
        <p className="text-muted-foreground mb-2">You have already cast your vote in <strong>{election.title}</strong>.</p>
        {registration.voteHash && <p className="font-mono text-xs bg-muted px-3 py-2 rounded-lg text-muted-foreground mt-2 mb-6">Receipt: {registration.voteHash}</p>}
        <button onClick={() => navigate('/voter/history')} className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90">View Voting History</button>
      </div>
    );
  }

  const handleVerify = async () => {
    setSecretIdError('');
    const ok = await verifySecretId(electionId!, secretIdInput);
    if (ok) setStep(1);
    else setSecretIdError('Invalid Secret ID. Please check your ID and try again. (Demo: use POLL-1-DEMO)');
  };

  const handleCastVote = async () => {
    const hash = await castVote(electionId!, selectedCandidateId, secretIdInput);
    if (hash) {
      setVoteHash(hash);
      setStep(3);
    }
  };

  const selectedCandidate = election.candidates.find(c => c.id === selectedCandidateId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-black transition-all shrink-0 ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Election Header */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{election.category}</p>
            <h2 className="font-black text-xl text-foreground">{election.title}</h2>
            <p className="text-sm text-muted-foreground">{election.organization}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground font-medium">Time Left</p>
            <p className="font-mono font-bold text-primary"><CountdownTimer endDate={election.endDate} /></p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Verify Secret ID */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Key size={24} className="text-primary" /></div>
              <div><h3 className="font-bold text-lg">Verify Your Identity</h3><p className="text-sm text-muted-foreground">Enter your Secret ID to proceed to voting</p></div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 block">Secret ID</label>
              <input value={secretIdInput} onChange={e => setSecretIdInput(e.target.value.toUpperCase())} placeholder="POLL-X-XXXX" maxLength={20}
                className="w-full px-4 py-3 border-2 border-border rounded-xl font-mono text-lg tracking-widest text-center focus:outline-none focus:border-primary transition-all bg-muted/30" />
              {secretIdError && <p className="text-destructive text-sm mt-2 font-medium">{secretIdError}</p>}
              <p className="text-xs text-muted-foreground mt-2">Hint: use <code className="bg-muted px-1 rounded">POLL-1-DEMO</code> for demo</p>
            </div>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs">
              <ShieldCheck size={15} /> Your identity is verified anonymously — your vote cannot be traced back to you.
            </div>
            <button onClick={handleVerify} disabled={!secretIdInput || isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
              {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Verifying...</> : <>Verify & Continue <ChevronRight size={16} /></>}
            </button>
          </motion.div>
        )}

        {/* Step 1: Select Candidate */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-1">Select Your Candidate</h3>
              <p className="text-sm text-muted-foreground">Choose one candidate. This action cannot be undone.</p>
            </div>
            <div className="space-y-3">
              {election.candidates.map(c => (
                <motion.button key={c.id} onClick={() => setSelectedCandidateId(c.id)} whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${selectedCandidateId === c.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'}`}>
                  <img src={c.photo} alt={c.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground text-base">{c.name}</p>
                    <p className="text-sm text-primary font-semibold">{c.designation}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.manifesto}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedCandidateId === c.id ? 'border-primary bg-primary' : 'border-border'}`}>
                    {selectedCandidateId === c.id && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 px-4 py-3 border border-border rounded-xl font-semibold text-sm hover:bg-muted"><ChevronLeft size={15} /> Back</button>
              <button onClick={() => setStep(2)} disabled={!selectedCandidateId}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
                Review Vote <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && selectedCandidate && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-lg">Confirm Your Vote</h3>
            <div className="flex items-center gap-4 p-4 bg-primary/5 border-2 border-primary rounded-2xl">
              <img src={selectedCandidate.photo} alt={selectedCandidate.name} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Your Selection</p>
                <p className="font-black text-xl">{selectedCandidate.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCandidate.designation}</p>
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                <Lock size={15} /> <strong>Warning:</strong> Once submitted, your vote cannot be changed or undone.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border"><span className="text-muted-foreground">Election</span><span className="font-semibold">{election.title}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border"><span className="text-muted-foreground">Candidate</span><span className="font-semibold">{selectedCandidate.name}</span></div>
              <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Anonymous</span><span className="font-semibold text-emerald-600">✓ Yes</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-3 border border-border rounded-xl font-semibold text-sm hover:bg-muted"><ChevronLeft size={15} /> Change</button>
              <button onClick={handleCastVote} disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all shadow-lg">
                {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Submitting...</> : <><CheckCircle2 size={16} /> Submit My Vote</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={42} className="text-emerald-600" />
            </motion.div>
            <div>
              <h3 className="font-black text-2xl text-foreground mb-2">Vote Recorded! 🎉</h3>
              <p className="text-muted-foreground">Your vote has been anonymously recorded on the blockchain.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1 font-semibold">Your Voting Receipt (keep this safe)</p>
              <p className="font-mono font-bold text-sm text-primary break-all">{voteHash || `VS-${Date.now().toString(36).toUpperCase()}`}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/voter/history')} className="flex-1 py-3 border border-border rounded-xl font-bold text-sm hover:bg-muted">View History</button>
              <button onClick={() => navigate('/voter/results')} className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90">View Results</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
