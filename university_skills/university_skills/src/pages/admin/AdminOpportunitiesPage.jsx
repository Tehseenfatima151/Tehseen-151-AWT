import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, Trash2, Calendar, Target, CheckCircle2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { listOpportunities, createOpportunity, deleteOpportunity, updateOpportunity } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'

export default function AdminOpportunitiesPage() {
  const { profile } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillsStr, setSkillsStr] = useState('')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const { data, error } = await listOpportunities()
      if (error) throw error
      setOpportunities(data || [])
    } catch (err) {
      toast.error('Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !deadline) {
      return toast.error('Please fill required fields (Title, Description, Deadline)')
    }
    if (!skillsStr) {
      return toast.error('Please add at least one required skill')
    }
    
    setIsSubmitting(true)
    
    try {
      const payload = {
        title,
        description,
        required_skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
        deadline,
        created_by: profile?.id
      }
      
      const reqPromise = editingId ? updateOpportunity(editingId, payload) : createOpportunity(payload)
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase request timed out after 8 seconds. Please check your network connection or RLS properties.')), 8000)
      })
      
      const { error } = await Promise.race([reqPromise, timeoutPromise])
      
      if (error) throw error
      
      toast.success(editingId ? 'Opportunity updated successfully!' : 'Opportunity posted successfully')
      
      closeModal()
      fetchOpportunities()
    } catch (err) {
      console.error('Opp Save Catch Error:', err)
      toast.error(err.message || 'Failed to save opportunity.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setTitle('')
    setDescription('')
    setSkillsStr('')
    setDeadline('')
  }

  const openEditModal = (opp) => {
    setEditingId(opp.id)
    setTitle(opp.title)
    setDescription(opp.description)
    setSkillsStr(Array.isArray(opp.required_skills) ? opp.required_skills.join(', ') : '')
    setDeadline(opp.deadline ? String(opp.deadline).substring(0, 10) : '')
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return
    try {
      const { error } = await deleteOpportunity(id)
      if (error) throw error
      toast.success('Opportunity deleted')
      fetchOpportunities()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </span>
            Opportunities Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">Post and manage real-world jobs, internships, or projects for students.</p>
        </div>
        <button
          onClick={() => {
            closeModal() // Make sure state is reset
            setIsModalOpen(true)
          }}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/5 shadow-xl shadow-black/20"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <Plus className="w-4 h-4" />
          Post Opportunity
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5" />)}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
          <Target className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No Opportunities Yet</h3>
          <p className="mt-1 text-sm text-slate-400">Start discovering talent by posting a new opportunity.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {opportunities.map((opp) => (
              <motion.div
                layout
                key={opp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-white line-clamp-2">{opp.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(opp)}
                      className="p-1.5 text-slate-400 transition-colors hover:text-sky-400 hover:bg-sky-400/10 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(opp.id)}
                      className="p-1.5 text-slate-400 transition-colors hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-grow">{opp.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(opp.required_skills) ? opp.required_skills.slice(0, 3).map((s, i) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                      {s}
                    </span>
                  )) : null}
                  {Array.isArray(opp.required_skills) && opp.required_skills.length > 3 && (
                    <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                      +{opp.required_skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-white/5 w-full justify-between mt-auto">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> By: {new Date(opp.deadline).toLocaleDateString()}</span>
                  <span>Posted by {opp.users?.name || 'Admin'}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl overflow-hidden"
          >
            <div className="border-b border-white/10 p-5 font-semibold text-white flex justify-between items-center bg-white/5">
              {editingId ? 'Edit Opportunity' : 'Create Opportunity'}
              <button onClick={closeModal} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Job / Project Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="e.g. Frontend React Intern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                  placeholder="Details about the opportunity..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input
                  required
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="React, TypeScript, CSS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Deadline</label>
                <input
                  required
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (editingId ? 'Updating...' : 'Posting...') : (editingId ? 'Update Opportunity' : 'Post Opportunity')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
