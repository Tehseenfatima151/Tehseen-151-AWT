import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import StatCard from '../../components/common/StatCard'
import { useAuth } from '../../context/AuthContext'
import { getStudentStats, listFeedbackForStudent, listMyApplications } from '../../services/studentService'
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { Award, FolderKanban, Star, TrendingUp, Send, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '../../components/common/Skeleton.jsx'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalSkills: 0, totalProjects: 0, totalCertificates: 0, rating: null })
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    if (!profile?.id) return
    setLoading(true)
    
    Promise.all([
      getStudentStats(profile.id).then(setStats),
      listFeedbackForStudent(profile.id).then(({ data }) => setFeedback(data ?? [])),
      listMyApplications(profile.id).then(({ data }) => setApplications(data ?? []))
    ]).finally(() => setLoading(false))
  }, [profile?.id])

  const distribution = useMemo(
    () => [
      { name: 'Skills', value: stats.totalSkills },
      { name: 'Projects', value: stats.totalProjects },
      { name: 'Certificates', value: stats.totalCertificates },
    ],
    [stats.totalSkills, stats.totalProjects, stats.totalCertificates],
  )

  const applicationStats = useMemo(() => {
    const total = applications.length
    const accepted = applications.filter(a => a.status === 'accepted').length
    const rejected = applications.filter(a => a.status === 'rejected').length
    const pending = applications.filter(a => a.status === 'pending').length
    return { total, accepted, rejected, pending }
  }, [applications])

  const scrollToAdminFeedback = () => {
    document.getElementById('student-admin-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const statBtn = "flex h-full min-h-0 w-full min-w-0 rounded-2xl outline-none ring-sky-400 transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-white/5 border border-white/10 backdrop-blur-md"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Your progress snapshot and portfolio distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {loading ? (
          <>
             <Skeleton className="h-[124px] rounded-2xl bg-white/5" />
             <Skeleton className="h-[124px] rounded-2xl bg-white/5" />
             <Skeleton className="h-[124px] rounded-2xl bg-white/5" />
             <Skeleton className="h-[124px] rounded-2xl bg-white/5" />
          </>
        ) : (
          <>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate('/student/skills')} className={statBtn}>
              <StatCard compact uniformCompact label="Skills" value={stats.totalSkills} icon={TrendingUp} accent="sky" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate('/student/projects')} className={statBtn}>
              <StatCard compact uniformCompact label="Projects" value={stats.totalProjects} icon={FolderKanban} accent="emerald" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate('/student/applications')} className={statBtn}>
              <StatCard compact uniformCompact label="Apps Sent" value={applicationStats.total} icon={Send} accent="indigo" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={scrollToAdminFeedback} className={statBtn}>
              <StatCard
                compact
                uniformCompact
                label="Admin rating"
                value={stats.rating != null ? `${stats.rating} / 5` : '—'}
                icon={Star}
                accent="amber"
                hint={stats.rating != null ? 'Based on admin review' : 'Awaiting review from admin'}
              />
            </motion.button>
          </>
        )}
      </div>
      
      {!loading && applicationStats.accepted > 0 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3 text-emerald-400">
               <div className="p-2 bg-emerald-500/20 rounded-xl">
                 <CheckCircle2 className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-semibold text-lg">Opportunity Accepted!</h3>
                  <p className="text-sm opacity-80">You have {applicationStats.accepted} accepted application(s). Keep up the great work!</p>
               </div>
            </div>
            <button onClick={() => navigate('/student/applications')} className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-400 transition-colors">
               View Apps
            </button>
         </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-xl">
          <h2 className="text-base font-semibold text-white">Portfolio Distribution</h2>
          <p className="mt-1 text-sm text-slate-400">Skills vs Projects vs Certificates</p>
          <div className="mt-4 h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-xl">
          <h2 className="text-base font-semibold text-white">Profile Strength</h2>
          <p className="mt-1 text-sm text-slate-400">A quick visual of your portfolio content</p>
          <div className="mt-4 h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} fill="#6366f1" stroke="#0f172a" strokeWidth={4} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div
        id="student-admin-feedback"
        className="scroll-mt-6 rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-xl"
      >
        <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Star className="w-5 h-5 fill-current" />
            <h2 className="text-base font-semibold text-white">Admin Feedback & Ratings</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Admins review your portfolio and can leave messages here. Your <span className="text-white">star rating</span> is saved when they submit a rating from the admin portal.
        </p>
        <div className="space-y-3">
          {feedback.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
               No feedback messages yet.
            </div>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/50 group-hover:bg-amber-400 transition-colors" />
                <p className="text-sm text-slate-200">{item.message}</p>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>From Admin</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
