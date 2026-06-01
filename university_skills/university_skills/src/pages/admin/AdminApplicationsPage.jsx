import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, XCircle, ExternalLink, Clock, AlertTriangle } from 'lucide-react'
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

  const isDeadlinePassed = (deadlineStr) => {
    if (!deadlineStr) return false
    const deadline = new Date(deadlineStr)
    deadline.setHours(23, 59, 59, 999)
    return new Date() > deadline
  }

  const handleUpdateStatus = async (id, status) => {
    const app = applications.find(a => a.id === id)
    if (status === 'accepted' && app && isDeadlinePassed(app.opportunities?.deadline)) {
      toast.error('Cannot approve: The opportunity deadline has passed! Please extend the deadline first.', {
        duration: 6000
      })
      return
    }

    try {
      const { error } = await updateApplicationStatus(id, status)
      if (error) throw error
      toast.success(`Application marked as ${status}`)
      setApplications(applications.map(a => a.id === id ? { ...a, status } : a))
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5"/>Accepted</span>
      case 'rejected': return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/20"><XCircle className="w-3.5 h-3.5"/>Rejected</span>
      default: return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5"/>Pending</span>
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
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
          <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No Applications Received</h3>
          <p className="mt-1 text-sm text-slate-400">Students haven't applied to any opportunities yet.</p>
        </div>
      ) : (
        <>
          {/* ── Mobile Card View (hidden on md+) ── */}
          <div className="flex flex-col gap-4 md:hidden">
            <AnimatePresence>
              {applications.map((app) => {
                const expired = isDeadlinePassed(app.opportunities?.deadline)
                return (
                  <motion.div
                    layout
                    key={app.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 space-y-3 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{app.user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{app.user?.email}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    {/* Opportunity */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-200">{app.opportunities?.title}</span>
                        {expired && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20 shrink-0">
                            <AlertTriangle className="w-3 h-3" /> Expired
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                        {app.opportunities?.deadline && (
                          <span className={expired ? 'text-rose-400' : ''}>
                            Deadline: {new Date(app.opportunities.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
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
                            disabled={expired}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={expired ? 'Cannot approve: deadline expired' : 'Approve this application'}
                          >
                            <CheckCircle className="w-3.5 h-3.5"/> Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
                          >
                            <XCircle className="w-3.5 h-3.5"/> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* ── Desktop Table View (hidden below md) ── */}
          <div className="hidden md:block rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300 min-w-[640px]">
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
                    {applications.map((app) => {
                      const expired = isDeadlinePassed(app.opportunities?.deadline)
                      return (
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
                            <div className="font-medium text-slate-200 flex items-center gap-2 flex-wrap">
                              {app.opportunities?.title}
                              {expired && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20 shadow-sm shrink-0">
                                  <AlertTriangle className="w-3 h-3" /> Closed / Expired
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Applied: {new Date(app.created_at).toLocaleDateString()}
                              {app.opportunities?.deadline && ` • Deadline: ${new Date(app.opportunities.deadline).toLocaleDateString()}`}
                            </div>
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
                                <ExternalLink className="w-3.5 h-3.5"/>Portfolio
                              </Link>
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                    disabled={expired}
                                    className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={expired ? 'Cannot approve: deadline expired' : 'Approve this application'}
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
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
