import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/common/StatCard'
import { useAuth } from '../../context/AuthContext'
import { getStudentStats, listFeedbackForStudent } from '../../services/studentService'
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, FolderKanban, Star, TrendingUp } from 'lucide-react'
import { Skeleton } from '../../components/common/Skeleton.jsx'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalSkills: 0, totalProjects: 0, totalCertificates: 0, rating: null })
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    if (!profile?.id) return
    setLoading(true)
    getStudentStats(profile.id)
      .then(setStats)
      .finally(() => setLoading(false))
    listFeedbackForStudent(profile.id).then(({ data }) => setFeedback(data ?? []))
  }, [profile?.id])

  const distribution = useMemo(
    () => [
      { name: 'Skills', value: stats.totalSkills },
      { name: 'Projects', value: stats.totalProjects },
      { name: 'Certificates', value: stats.totalCertificates },
    ],
    [stats.totalSkills, stats.totalProjects, stats.totalCertificates],
  )

  const scrollToAdminFeedback = () => {
    document.getElementById('student-admin-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Your progress snapshot and portfolio distribution.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-[110px] rounded-3xl" />
            <Skeleton className="h-[110px] rounded-3xl" />
            <Skeleton className="h-[110px] rounded-3xl" />
            <Skeleton className="h-[110px] rounded-3xl" />
          </>
        ) : (
          <>
            <button type="button" onClick={() => navigate('/student/skills')} className="text-left">
              <StatCard label="Skills" value={stats.totalSkills} icon={TrendingUp} accent="sky" />
            </button>
            <button type="button" onClick={() => navigate('/student/projects')} className="text-left">
              <StatCard label="Projects" value={stats.totalProjects} icon={FolderKanban} accent="emerald" />
            </button>
            <button type="button" onClick={() => navigate('/student/certificates')} className="text-left">
              <StatCard label="Certificates" value={stats.totalCertificates} icon={Award} accent="amber" />
            </button>
            <button
              type="button"
              onClick={scrollToAdminFeedback}
              className="w-full text-left"
              title="Admin-assigned score after portfolio review — jump to feedback"
            >
              <StatCard
                label="Admin rating"
                value={stats.rating != null ? `${stats.rating} / 5` : '—'}
                icon={Star}
                accent="sky"
                hint={stats.rating != null ? 'Based on admin review' : 'Set when an admin rates your portfolio — tap for feedback'}
              />
            </button>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white p-5 shadow-xl shadow-sky-900/10">
          <h2 className="text-base font-semibold text-slate-900">Distribution (Bar)</h2>
          <p className="mt-1 text-sm text-slate-600">Skills vs Projects vs Certificates</p>
          <div className="mt-4 h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-5 shadow-xl shadow-sky-900/10">
          <h2 className="text-base font-semibold text-slate-900">Distribution (Pie)</h2>
          <p className="mt-1 text-sm text-slate-600">A quick visual of your portfolio content</p>
          <div className="mt-4 h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} fill="#60a5fa" stroke="#ffffff" strokeWidth={2} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div id="student-admin-feedback" className="scroll-mt-6 rounded-3xl border border-white/10 bg-white p-5 shadow-xl shadow-sky-900/10">
        <h2 className="text-base font-semibold text-slate-900">Admin feedback & rating</h2>
        <p className="mt-1 text-sm text-slate-600">
          Admins review your portfolio and can leave messages here. Your <span className="font-medium text-slate-800">star rating (1–5)</span> on the card
          above is saved when they submit a rating from the admin portal.
        </p>
        <div className="mt-3 space-y-2">
          {feedback.length === 0 ? (
            <p className="text-sm text-slate-500">No feedback messages yet. Your rating stays empty until an admin opens your portfolio in the admin portal and saves a score.</p>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 p-3">
                <p className="text-sm text-slate-700">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
