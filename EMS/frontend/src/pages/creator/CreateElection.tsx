import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, FileText, Calendar, Users,
  User, Shield, Eye, Save, Send, PlusCircle, Trash2, Image, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useElectionStore } from '../../store/electionStore';
import type { Election, Candidate } from '../../types';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Schedule', icon: Calendar },
  { id: 3, label: 'Voters', icon: Users },
  { id: 4, label: 'Candidates', icon: User },
  { id: 5, label: 'Security', icon: Shield },
  { id: 6, label: 'Review', icon: Eye },
];

const CATEGORIES = ['government', 'corporate', 'educational', 'community', 'ngo'];
const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Asia/Karachi', 'Asia/Dubai'];

export default function CreateElection() {
  const { user } = useAuthStore();
  const { createElection, updateElection, saveDraft, currentDraft } = useElectionStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Election>>({
    title: currentDraft?.title || '',
    description: currentDraft?.description || '',
    category: currentDraft?.category || 'government',
    organization: currentDraft?.organization || user?.organization || '',
    startDate: currentDraft?.startDate || '',
    endDate: currentDraft?.endDate || '',
    registrationDeadline: currentDraft?.registrationDeadline || '',
    timezone: currentDraft?.timezone || 'UTC',
    maxVoters: currentDraft?.maxVoters || 1000,
    isWaitlistEnabled: currentDraft?.isWaitlistEnabled ?? false,
    requireSecretId: currentDraft?.requireSecretId ?? true,
    require2FA: currentDraft?.require2FA ?? false,
    allowAnonymous: currentDraft?.allowAnonymous ?? true,
    candidates: currentDraft?.candidates || [],
    creatorId: user?.id || '',
    creatorName: user?.name || '',
    creatorEmail: user?.email || '',
  });

  const [newCandidate, setNewCandidate] = useState({ name: '', designation: '', manifesto: '', photo: '' });

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.type === 'number' ? +e.target.value : e.target.value }));

  const setToggle = (k: keyof typeof form) => setForm(f => ({ ...f, [k]: !f[k] }));

  const addCandidate = () => {
    if (!newCandidate.name) return;
    const c: Candidate = {
      id: `cand-new-${Date.now()}`, electionId: savedId || 'new',
      name: newCandidate.name, designation: newCandidate.designation,
      manifesto: newCandidate.manifesto,
      photo: newCandidate.photo || `https://api.dicebear.com/7.x/personas/svg?seed=${newCandidate.name}`,
      voteCount: 0, order: (form.candidates?.length || 0) + 1,
    };
    setForm(f => ({ ...f, candidates: [...(f.candidates || []), c] }));
    setNewCandidate({ name: '', designation: '', manifesto: '', photo: '' });
  };

  const removeCandidate = (id: string) => setForm(f => ({ ...f, candidates: f.candidates?.filter(c => c.id !== id) }));

  const handleSaveDraft = async () => {
    setIsLoading(true);
    saveDraft(form);
    if (!savedId) {
      const id = await createElection(form);
      setSavedId(id);
    } else {
      await updateElection(savedId, form);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let id = savedId;
    if (!id) id = await createElection(form);
    else await updateElection(id, form);
    setIsLoading(false);
    navigate('/creator/elections');
  };

  const Toggle = ({ label, desc, field }: { label: string; desc: string; field: keyof typeof form }) => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
      <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <button onClick={() => setToggle(field)} className={`relative w-11 h-6 rounded-full transition-colors ${form[field] ? 'bg-primary' : 'bg-muted border border-border'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form[field] ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  const Input = ({ label, field, type = 'text', required = false, placeholder = '' }: { label: string; field: keyof typeof form; type?: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">{label}{required && ' *'}</label>
      <input type={type} value={form[field] as string || ''} onChange={setField(field)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-black mb-6">Create New Election</h1>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 shrink-0">
              <button onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${step === s.id ? 'bg-primary text-white shadow-lg' : step > s.id ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {step > s.id ? <Check size={12} /> : <s.icon size={12} />}
                <span className="hidden sm:block">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={12} className="text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-5">

          {step === 1 && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={18} className="text-primary" /> Basic Information</h2>
              <Input label="Election Title" field="title" required placeholder="e.g. Annual Board Member Election 2024" />
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Description *</label>
                <textarea value={form.description} onChange={setField('description')} rows={4} placeholder="Describe the purpose and scope of this election..."
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Category *</label>
                  <select value={form.category} onChange={setField('category')} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <Input label="Organization" field="organization" required placeholder="Your org name" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar size={18} className="text-primary" /> Schedule & Timing</h2>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Timezone</label>
                <select value={form.timezone} onChange={setField('timezone')} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <Input label="Registration Deadline" field="registrationDeadline" type="datetime-local" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Election Start" field="startDate" type="datetime-local" required />
                <Input label="Election End" field="endDate" type="datetime-local" required />
              </div>
              {form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate) && (
                <p className="text-sm text-destructive font-medium">⚠️ End date must be after start date.</p>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2"><Users size={18} className="text-primary" /> Voter Settings</h2>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Maximum Voters *</label>
                <input type="number" value={form.maxVoters} onChange={setField('maxVoters')} min={10} max={1000000}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <p className="text-xs text-muted-foreground mt-1">Once reached, the voter list auto-locks.</p>
              </div>
              <Toggle label="Enable Waitlist" desc="Allow voters to join a waitlist when capacity is reached" field="isWaitlistEnabled" />
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                <strong>Voter Locking:</strong> When {form.maxVoters?.toLocaleString()} voters register, the list automatically freezes. No further registrations allowed (except admin override with audit log).
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2"><User size={18} className="text-primary" /> Candidate Management</h2>
              {(form.candidates || []).length > 0 && (
                <div className="space-y-2 mb-4">
                  {form.candidates!.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                      <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.designation}</p>
                      </div>
                      <button onClick={() => removeCandidate(c.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border border-dashed border-primary/30 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2"><PlusCircle size={15} className="text-primary" /> Add Candidate</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input value={newCandidate.name} onChange={e => setNewCandidate(n => ({ ...n, name: e.target.value }))} placeholder="Full Name *" className="px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input value={newCandidate.designation} onChange={e => setNewCandidate(n => ({ ...n, designation: e.target.value }))} placeholder="Designation/Title" className="px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <input value={newCandidate.photo} onChange={e => setNewCandidate(n => ({ ...n, photo: e.target.value }))} placeholder="Photo URL (optional – auto-generated if empty)" className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <textarea value={newCandidate.manifesto} onChange={e => setNewCandidate(n => ({ ...n, manifesto: e.target.value }))} placeholder="Manifesto / Description" rows={2} className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <button onClick={addCandidate} disabled={!newCandidate.name} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                  <PlusCircle size={15} /> Add Candidate
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2"><Shield size={18} className="text-primary" /> Security Settings</h2>
              <Toggle label="Require Secret ID" desc="Voters must verify with their unique secret POLL-X-XXXX ID before voting" field="requireSecretId" />
              <Toggle label="Require 2FA" desc="Voters must complete two-factor authentication before casting vote" field="require2FA" />
              <Toggle label="Anonymous Voting" desc="Votes are untraceable – no vote can be linked back to a voter" field="allowAnonymous" />
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                <p className="text-sm font-bold text-emerald-900">Always-on Security (Cannot be disabled)</p>
                {['Duplicate vote prevention', 'Encrypted vote storage', 'Immutable audit logging', 'Auto voter list lock at capacity', 'Admin override audit trail'].map(f => (
                  <p key={f} className="text-xs text-emerald-700 flex items-center gap-2">✓ {f}</p>
                ))}
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-lg font-bold flex items-center gap-2"><Eye size={18} className="text-primary" /> Review & Publish</h2>
              <div className="space-y-3">
                {[
                  ['Title', form.title],
                  ['Category', form.category],
                  ['Organization', form.organization],
                  ['Max Voters', form.maxVoters?.toLocaleString()],
                  ['Candidates', `${form.candidates?.length || 0} added`],
                  ['Start Date', form.startDate ? new Date(form.startDate).toLocaleString() : '—'],
                  ['End Date', form.endDate ? new Date(form.endDate).toLocaleString() : '—'],
                  ['Secret ID', form.requireSecretId ? 'Required' : 'Not required'],
                  ['2FA', form.require2FA ? 'Required' : 'Optional'],
                  ['Anonymous', form.allowAnonymous ? 'Yes' : 'No'],
                  ['Waitlist', form.isWaitlistEnabled ? 'Enabled' : 'Disabled'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground font-medium">{label}</span>
                    <span className="text-sm font-bold capitalize">{value as string || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <strong>⚠️ After submission:</strong> Your election will be reviewed by a Super Admin before going live. You'll receive a notification once approved.
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-all">
              <ChevronLeft size={15} /> Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSaveDraft} disabled={isLoading} className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-all disabled:opacity-50">
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
          </button>
          {step < 6 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60">
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Submit for Approval
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
