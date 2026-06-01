import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { X, Search, Users, Shield, Star, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createStudentAccount, deleteStudent, listStudents, updateStudentAdminFields, upsertStudentRating, addFeedback } from '../../services/adminService'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { supabase } from '../../lib/supabase'

const emptyForm = { email: '', password: '', name: '', department: '', semester: '' }

export default function AdminStudentsPage() {
  const [form, setForm] = useState(emptyForm)
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  
  // Feedback states
  const [feedbackStudent, setFeedbackStudent] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(3)
  const [savingFeedback, setSavingFeedback] = useState(false)

  const handleSaveFeedback = async () => {
    if (!feedbackStudent) return
    if (!feedbackText.trim()) {
      toast.error('Feedback message is required')
      return
    }
    setSavingFeedback(true)
    const toastId = toast.loading('Saving feedback and rating...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const adminId = user?.id
      if (!adminId) throw new Error('Admin session not found. Please log in again.')

      const [ratingRes, feedbackRes] = await Promise.all([
        upsertStudentRating(feedbackStudent.id, rating),
        addFeedback({ userId: feedbackStudent.id, adminId, message: feedbackText.trim() })
      ])

      if (ratingRes.error) throw ratingRes.error
      if (feedbackRes.error) throw feedbackRes.error

      toast.success('Feedback and rating saved successfully!', { id: toastId })
      setFeedbackStudent(null)
      setFeedbackText('')
      setRating(3)
      await load() // refresh stars
    } catch (err) {
      toast.error(err.message || 'Something went wrong.', { id: toastId })
    } finally {
      setSavingFeedback(false)
    }
  }

  const load = async () => {
    const { data } = await listStudents()
    setStudents(data ?? [])
  }
  useEffect(() => {
    load()
  }, [])

  const approvedStudents = useMemo(() => students.filter((item) => item.is_approved !== false), [students])
  const pendingStudents = useMemo(() => students.filter((item) => item.is_approved === false), [students])

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    const d = departmentFilter.trim().toLowerCase()
    const sk = skillFilter.trim().toLowerCase()
    const baseList = activeTab === 'active' ? approvedStudents : pendingStudents

    return baseList.filter((item) => {
      const matchesQuery = !q || 
        item.name?.toLowerCase().includes(q) || 
        item.email?.toLowerCase().includes(q) || 
        item.roll_number?.toLowerCase().includes(q)
      const matchesDept = !d || String(item.department ?? '').toLowerCase().includes(d)
      const matchesSkill = !sk || item.skills?.some(s => s.skill_name?.toLowerCase().includes(sk))
      return matchesQuery && matchesDept && matchesSkill
    })
  }, [approvedStudents, pendingStudents, activeTab, query, departmentFilter, skillFilter])

  const hasActiveFilters = query.trim() !== '' || (activeTab === 'active' && (departmentFilter.trim() !== '' || skillFilter.trim() !== ''))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await createStudentAccount(form)
      toast.success('Student account created')
      setForm(emptyForm)
      setIsCreating(false)
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleBadge = async (userId, badgeType, currentValue) => {
    try {
      await updateStudentAdminFields(userId, { [badgeType]: !currentValue })
      toast.success(`${badgeType.replace('is_', '').replace('_', ' ')} updated successfully`)
      setStudents(students.map(s => s.id === userId ? { ...s, [badgeType]: !currentValue } : s))
    } catch {
      toast.error('Failed to update badge')
    }
  }

  const handleApproveStudent = async (userId) => {
    const approveToast = toast.loading('Approving student registration...')
    try {
      const { error } = await updateStudentAdminFields(userId, { is_approved: true })
      if (error) throw error
      toast.success('Student registration approved! They can now log in.', { id: approveToast })
      setStudents(students.map(s => s.id === userId ? { ...s, is_approved: true } : s))
    } catch (err) {
      toast.error(err.message || 'Failed to approve student', { id: approveToast })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </span>
            Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Search, filter, manage approvals, and award verified badges to student portfolios.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md cursor-pointer"
        >
          {isCreating ? 'Cancel Creation' : '+ Create Student'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => { setActiveTab('active'); setQuery(''); setDepartmentFilter(''); setSkillFilter(''); }}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'active' 
              ? 'border-sky-400 text-sky-450' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Students ({approvedStudents.length})
        </button>
        <button
          onClick={() => { setActiveTab('pending'); setQuery(''); setDepartmentFilter(''); setSkillFilter(''); }}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending' 
              ? 'border-sky-400 text-sky-405' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Approvals
          {pendingStudents.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-md shadow-amber-500/20">
              {pendingStudents.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.form 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }} 
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
            onSubmit={submit}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Semester (e.g. 6)" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              <button className="rounded-xl bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25 cursor-pointer">Create Account</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
              placeholder={activeTab === 'active' ? "Search by name/email/roll number" : "Search by name/email/roll number"}
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
          {activeTab === 'active' && (
            <>
              <input 
                className="w-full md:w-64 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                placeholder="Filter by Department" 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)} 
              />
              <input 
                className="w-full md:w-64 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                placeholder="Skill (e.g. React, Python)" 
                value={skillFilter} 
                onChange={(e) => setSkillFilter(e.target.value)} 
              />
            </>
          )}
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => { setQuery(''); setDepartmentFilter(''); setSkillFilter(''); toast.success('Filters cleared') }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${hasActiveFilters ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
          >
            <X className="h-4 w-4" /> Clear
          </button>
        </div>
        
        {hasActiveFilters && (
          <p className="mt-3 text-xs text-slate-400">Showing {filteredStudents.length} of {activeTab === 'active' ? approvedStudents.length : pendingStudents.length} students</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredStudents.map((item) => (
            <motion.div layout key={item.id} className="group flex flex-col rounded-2xl border border-white/10 bg-[#0f172a] overflow-hidden hover:shadow-xl transition-all">
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate" title={item.name}>{item.name}</h3>
                      <p className="text-xs text-slate-400 truncate" title={item.email}>{item.email}</p>
                      {item.department && (
                        <p className="text-xs text-indigo-300 mt-0.5">{item.department} {item.semester ? `• Semester ${item.semester}` : ''}</p>
                      )}
                    </div>
                    {activeTab === 'active' && (
                      <div className="flex items-center gap-1.5 flex-col shrink-0">
                        <button 
                          onClick={() => handleToggleBadge(item.id, 'is_verified_developer', item.is_verified_developer)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${item.is_verified_developer ? 'border-sky-500/30 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-white/5 text-slate-500'} hover:opacity-80 transition-opacity`}
                          title="Toggle Verified Developer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleBadge(item.id, 'is_top_performer', item.is_top_performer)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${item.is_top_performer ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-white/5 text-slate-500'} hover:opacity-80 transition-opacity`}
                          title="Toggle Top Performer"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render Extra details for Pending accounts */}
                  {activeTab === 'pending' && (
                    <div className="mt-3.5 space-y-2 border-t border-white/5 pt-3.5 text-xs text-slate-400">
                      {item.roll_number && (
                        <div className="flex justify-between">
                          <span>Roll Number:</span>
                          <span className="font-semibold text-slate-200">{item.roll_number}</span>
                        </div>
                      )}
                      {item.semester && (
                        <div className="flex justify-between">
                          <span>Semester:</span>
                          <span className="font-semibold text-slate-200">Semester {item.semester} {item.section ? `(${item.section})` : ''}</span>
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex justify-between">
                          <span>Phone Number:</span>
                          <span className="font-semibold text-slate-200">{item.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeTab === 'active' && (
                  <div className="flex flex-wrap gap-1.5 mb-2 mt-4">
                    {item.skills?.slice(0, 4).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {s.skill_name}
                      </span>
                    ))}
                    {item.skills?.length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">+{item.skills.length - 4}</span>
                    )}
                    {(!item.skills || item.skills.length === 0) && (
                      <span className="text-xs text-slate-500 italic">No skills added</span>
                    )}
                  </div>
                )}
              </div>

              {activeTab === 'active' ? (
                <div className="grid grid-cols-3 text-xs border-t border-white/5 bg-white/[0.02]">
                  <Link to={`/admin/students/${item.id}`} className="py-2.5 text-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium border-r border-white/5">
                    Portfolio
                  </Link>
                  <button onClick={() => setFeedbackStudent(item)} className="py-2.5 text-center text-sky-405 hover:text-white hover:bg-sky-600 transition-colors font-medium border-r border-white/5 cursor-pointer">
                    + Feedback
                  </button>
                  <button onClick={() => setDeleteId(item.id)} className="py-2.5 text-center text-rose-400 hover:text-white hover:bg-rose-500 transition-colors font-medium cursor-pointer">
                    Delete
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 text-sm border-t border-white/5 bg-white/[0.02]">
                  <button 
                    onClick={() => handleApproveStudent(item.id)} 
                    className="py-2.5 text-center text-emerald-400 hover:text-white hover:bg-emerald-600 transition-all font-semibold border-r border-white/5 cursor-pointer uppercase tracking-wider text-[11px]"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => setDeleteId(item.id)} 
                    className="py-2.5 text-center text-rose-450 hover:text-white hover:bg-rose-500 transition-all font-semibold cursor-pointer uppercase tracking-wider text-[11px]"
                  >
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
          <Shield className="mx-auto w-12 h-12 text-slate-500 mb-3" />
          <p className="text-slate-400">
            {activeTab === 'active' ? 'No active students found.' : 'No pending registrations.'}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={activeTab === 'active' ? "Delete student account?" : "Reject registration request?"}
        message={activeTab === 'active' ? "This permanently removes student profile and authentication account." : "This will reject and permanently delete the student's registration request."}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteStudent(deleteId)
          await load()
          setDeleteId(null)
          toast.success(activeTab === 'active' ? 'Student deleted' : 'Registration rejected & deleted')
        }}
      />

      {/* Feedback & Rating Modal */}
      <AnimatePresence>
        {feedbackStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-base font-bold text-white">Give Feedback to {feedbackStudent.name}</h3>
                <button 
                  onClick={() => setFeedbackStudent(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-350 uppercase tracking-wider block">Feedback Message</label>
                  <textarea
                    rows={4}
                    placeholder="Write constructive portfolio feedback..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition placeholder:text-slate-500"
                    disabled={savingFeedback}
                  />
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-350 uppercase tracking-wider">
                    <span>Assign Rating</span>
                    <span className="text-sky-400 font-bold">{rating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full cursor-pointer accent-sky-500"
                    disabled={savingFeedback}
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>1 (Poor)</span>
                    <span>3 (Good)</span>
                    <span>5 (Excellent)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
                <button
                  onClick={() => setFeedbackStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                  disabled={savingFeedback}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 transition disabled:opacity-60 cursor-pointer"
                  disabled={savingFeedback}
                >
                  {savingFeedback ? 'Saving...' : 'Save & Notify'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
