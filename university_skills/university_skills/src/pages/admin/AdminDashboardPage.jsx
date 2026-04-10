import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import { getAdminStats } from '../../services/adminService'
import { Users, FolderKanban, Award, MessageSquare, Star, Briefcase } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    students: 0,
    skills: 0,
    projects: 0,
    certificates: 0,
    feedback: 0,
    ratings: 0,
    services: 0,
  })

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  const cardBtn =
    'group w-full cursor-pointer rounded-xl text-left outline-none ring-sky-400 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

  return (
    <div className="space-y-4 md:space-y-5">
      <h1 className="text-xl font-bold text-white md:text-2xl">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
        <button type="button" className={cardBtn} onClick={() => navigate('/admin/students')} title="Open student list">
          <StatCard compact label="Total Students" value={stats.students} icon={Users} />
        </button>
        <button
          type="button"
          className={cardBtn}
          onClick={() => navigate('/admin/moderation', { state: { moderationTab: 'projects' } })}
          title="View all projects"
        >
          <StatCard compact label="Total Projects" value={stats.projects} icon={FolderKanban} accent="emerald" />
        </button>
        <button
          type="button"
          className={cardBtn}
          onClick={() => navigate('/admin/moderation', { state: { moderationTab: 'certificates' } })}
          title="View all certificates"
        >
          <StatCard compact label="Certificates" value={stats.certificates} icon={Award} accent="amber" />
        </button>
        <button type="button" className={cardBtn} onClick={() => navigate('/admin/feedback')} title="View all feedback">
          <StatCard compact label="Feedback" value={stats.feedback} icon={MessageSquare} />
        </button>
        <button type="button" className={cardBtn} onClick={() => navigate('/admin/leaderboard')} title="Open ratings leaderboard">
          <StatCard compact label="Ratings" value={stats.ratings} icon={Star} />
        </button>
        <button
          type="button"
          className={cardBtn}
          onClick={() => navigate('/admin/moderation', { state: { moderationTab: 'services' } })}
          title="View all student services"
        >
          <StatCard compact label="Services" value={stats.services} icon={Briefcase} accent="emerald" />
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-lg shadow-sky-900/5 md:rounded-3xl md:p-5 md:shadow-xl">
        <h2 className="text-sm font-semibold text-slate-900 md:text-base">Activity Overview</h2>
        <div className="mt-3 h-56 md:mt-4 md:h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Students', value: stats.students },
                { name: 'Projects', value: stats.projects },
                { name: 'Skills', value: stats.skills },
                { name: 'Certificates', value: stats.certificates },
                { name: 'Feedback', value: stats.feedback },
                { name: 'Ratings', value: stats.ratings },
                { name: 'Services', value: stats.services },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
