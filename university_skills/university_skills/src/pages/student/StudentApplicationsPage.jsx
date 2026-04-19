import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { listMyApplications } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function StudentApplicationsPage() {
  const { profile } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data, error } = await listMyApplications(profile.id)
      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-4 h-4"/> Accepted</span>
      case 'rejected': return <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-400 border border-rose-500/20"><XCircle className="w-4 h-4"/> Rejected</span>
      default: return <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400 border border-amber-500/20"><Clock className="w-4 h-4"/> In Review</span>
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
              <FileText className="w-6 h-6" />
            </span>
            My Applications
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track the status of the opportunities you have applied for.</p>
        </div>
        <Link
          to="/student/opportunities"
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md"
        >
          Browse Opportunities
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
          <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No Applications Yet</h3>
          <p className="mt-1 text-sm text-slate-400">You haven't applied to any opportunities.</p>
          <Link
            to="/student/opportunities"
            className="mt-6 inline-block rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-400 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
          >
            Find Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {applications.map((app) => (
              <motion.div
                layout
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0f172a] p-5 backdrop-blur-md hover:bg-white/5 transition-all"
              >
                <div>
                  <h3 className="font-semibold text-white text-lg">{app.opportunities?.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-1 mt-1 max-w-2xl">{app.opportunities?.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center">
                  {getStatusBadge(app.status)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
