import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listApplications, updateApplicationStatus } from '../../services/adminService'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data, error } = await listApplications()
      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await updateApplicationStatus(id, status)
      if (error) throw error
      toast.success(`Application marked as ${status}`)
      setApplications(applications.map(app => app.id === id ? { ...app, status } : app))
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5"/> Accepted</span>
      case 'rejected': return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/20"><XCircle className="w-3.5 h-3.5"/> Rejected</span>
      default: return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5"/> Pending</span>
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
            <FileText className="w-6 h-6" />
          </span>
          Student Applications
        </h1>
        <p className="text-sm text-slate-400 mt-1">Review student applications, check their portfolios, and update their statuses.</p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
          <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No Applications Received</h3>
          <p className="mt-1 text-sm text-slate-400">Students haven't applied to any opportunities yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Opportunity</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {applications.map((app) => (
                    <motion.tr 
                      layout 
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{app.user?.name}</div>
                        <div className="text-xs text-slate-500">{app.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{app.opportunities?.title}</div>
                        <div className="text-xs text-slate-500">{new Date(app.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/portfolio/${app.student_id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 border border-white/5"
                          >
                            <ExternalLink className="w-3.5 h-3.5"/> Portfolio
                          </Link>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                className="inline-flex items-center rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
