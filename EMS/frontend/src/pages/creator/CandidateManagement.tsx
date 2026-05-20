import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, User, Save, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import { PageHeader, EmptyState } from '../../components/common/UIComponents';
import type { Candidate } from '../../types';
import { useEffect } from 'react';

function CandidateForm({ initial, onSave, onCancel }: { initial?: Partial<Candidate>; onSave: (c: Partial<Candidate>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: initial?.name || '', designation: initial?.designation || '', manifesto: initial?.manifesto || '', photo: initial?.photo || '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
      <h4 className="font-bold text-sm">{initial?.id ? 'Edit Candidate' : 'Add New Candidate'}</h4>
      <div className="grid grid-cols-2 gap-3">
        <input value={form.name} onChange={set('name')} placeholder="Full Name *" className="px-3 py-2.5 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <input value={form.designation} onChange={set('designation')} placeholder="Designation/Title" className="px-3 py-2.5 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <input value={form.photo} onChange={set('photo')} placeholder="Photo URL (leave empty for auto-avatar)" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <textarea value={form.manifesto} onChange={set('manifesto')} rows={3} placeholder="Manifesto / Description" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      <div className="flex gap-2">
        <button onClick={() => form.name && onSave(form)} disabled={!form.name} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50"><Save size={14} /> Save</button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 border border-border text-sm font-bold rounded-xl hover:bg-muted"><X size={14} /> Cancel</button>
      </div>
    </motion.div>
  );
}

export default function CandidateManagement() {
  const { user } = useAuthStore();
  const { elections, addCandidate, updateCandidate, deleteCandidate } = useElectionStore();
  const myElections = elections.filter(e => e.creatorId === user?.id && ['draft', 'approved', 'active'].includes(e.status));
  const [selectedElectionId, setSelectedElectionId] = useState(myElections[0]?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!selectedElectionId && myElections.length > 0) {
      setSelectedElectionId(myElections[0].id);
    } else if (selectedElectionId && myElections.length > 0 && !myElections.some(e => e.id === selectedElectionId)) {
      setSelectedElectionId(myElections[0].id);
    }
  }, [myElections, selectedElectionId]);

  const selectedElection = elections.find(e => e.id === selectedElectionId);
  const candidates = selectedElection?.candidates || [];

  const handleAdd = async (c: Partial<Candidate>) => {
    await addCandidate(selectedElectionId, { electionId: selectedElectionId, name: c.name!, designation: c.designation || '', manifesto: c.manifesto || '', photo: c.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${c.name}`, order: candidates.length + 1 });
    setShowForm(false);
  };
  const handleEdit = async (c: Partial<Candidate>) => {
    if (!editTarget) return;
    await updateCandidate(selectedElectionId, editTarget.id, c);
    setEditTarget(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Candidate Management" subtitle="Add, edit, and manage candidates for your elections." breadcrumbs={[{ label: 'Creator' }, { label: 'Candidates' }]}
        actions={<button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90"><PlusCircle size={15} /> Add Candidate</button>} />

      {myElections.length === 0 ? (
        <EmptyState title="No elections available" description="Create an election first before adding candidates." icon="🗳️" />
      ) : (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Select Election</label>
            <select value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)} className="px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full max-w-sm">
              {myElections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {showForm && <CandidateForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
            {editTarget && <CandidateForm initial={editTarget} onSave={handleEdit} onCancel={() => setEditTarget(null)} />}
          </AnimatePresence>

          {candidates.length === 0 ? (
            <EmptyState title="No candidates yet" description="Add candidates for this election." icon="👤"
              action={<button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90">Add Candidate</button>} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map(c => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <img src={c.photo} alt={c.name} className="w-14 h-14 rounded-xl object-cover border-2 border-primary/20" />
                    <div className="flex gap-1">
                      <button onClick={() => setEditTarget(c)} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><Edit2 size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => deleteCandidate(selectedElectionId, c.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={14} className="text-destructive" /></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground">{c.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-2">{c.designation}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.manifesto}</p>
                  {c.voteCount > 0 && <p className="text-xs font-bold text-emerald-600 mt-2">{c.voteCount.toLocaleString()} votes</p>}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
