import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { X, Search, Users, Shield, Star, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createStudentAccount, deleteStudent, listStudents, updateStudentAdminFields } from '../../services/adminService'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const emptyForm = { email: '', password: '', name: '', department: '', semester: '' }

export default function AdminStudentsPage() {
  const [form, setForm] = useState(emptyForm)
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const load = async () => {
    const { data } = await listStudents()
    setStudents(data ?? [])
  }
  useEffect(() => {
    load()
  }, [])

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    const d = departmentFilter.trim().toLowerCase()
    const sk = skillFilter.trim().toLowerCase()
    return students.filter((item) => {
      const matchesQuery = !q || item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q)
      const matchesDept = !d || String(item.department ?? '').toLowerCase().includes(d)
      const matchesSkill = !sk || item.skills?.some(s => s.skill_name?.toLowerCase().includes(sk))
      return matchesQuery && matchesDept && matchesSkill
    })
  }, [students, query, departmentFilter, skillFilter])

  const hasActiveFilters = query.trim() !== '' || departmentFilter.trim() !== '' || skillFilter.trim() !== ''

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </span>
            Talent Discovery
          </h1>
          <p className="text-sm text-slate-400 mt-1">Search, filter, and award verified badges to student talent.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md"
        >
          {isCreating ? 'Cancel Creation' : '+ Create Student'}
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
              <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              <button className="rounded-xl bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25">Create Account</button>
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
              placeholder="Search by name/email" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
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
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => { setQuery(''); setDepartmentFilter(''); setSkillFilter(''); toast.success('Filters cleared') }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium transition-colors ${hasActiveFilters ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
          >
            <X className="h-4 w-4" /> Clear
          </button>
        </div>
        
        {hasActiveFilters && (
          <p className="mt-3 text-xs text-slate-400">Showing {filteredStudents.length} of {students.length} students</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredStudents.map((item) => (
            <motion.div layout key={item.id} className="group flex flex-col rounded-2xl border border-white/10 bg-[#0f172a] overflow-hidden hover:shadow-xl transition-all">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.email}</p>
                    <p className="text-xs text-indigo-300 mt-0.5">{item.department} {item.semester ? `• Semester ${item.semester}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-col">
                    <button 
                      onClick={() => handleToggleBadge(item.id, 'is_verified_developer', item.is_verified_developer)}
                      className={`p-1.5 rounded-lg border ${item.is_verified_developer ? 'border-sky-500/30 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-white/5 text-slate-500'} hover:opacity-80 transition-opacity`}
                      title="Toggle Verified Developer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleBadge(item.id, 'is_top_performer', item.is_top_performer)}
                      className={`p-1.5 rounded-lg border ${item.is_top_performer ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-white/5 text-slate-500'} hover:opacity-80 transition-opacity`}
                      title="Toggle Top Performer"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>

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
              </div>

              <div className="grid grid-cols-2 text-sm border-t border-white/5 bg-white/[0.02]">
                <Link to={`/admin/students/${item.id}`} className="py-2.5 text-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium border-r border-white/5">
                  Portfolio
                </Link>
                <button onClick={() => setDeleteId(item.id)} className="py-2.5 text-center text-rose-400 hover:text-white hover:bg-rose-500 transition-colors font-medium">
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && students.length > 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center">
          <Shield className="mx-auto w-12 h-12 text-slate-500 mb-3" />
          <p className="text-slate-400">No students match these filters.</p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete student account?"
        message="This permanently removes student profile and authentication account."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteStudent(deleteId)
          await load()
          setDeleteId(null)
          toast.success('Student deleted')
        }}
      />
    </motion.div>
  )
}
