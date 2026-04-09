import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import { getAdminStats } from '../../services/adminService'
import { Users, FolderKanban, Award, MessageSquare, Star } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ students: 0, skills: 0, projects: 0, certificates: 0, feedback: 0, ratings: 0 })

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <button
          type="button"
          className="group w-full cursor-pointer rounded-3xl text-left outline-none ring-sky-400 transition focus-visible:ring-2"
          onClick={() => navigate('/admin/students')}
          title="Open student list"
        >
          <StatCard label="Total Students" value={stats.students} icon={Users} />
        </button>
        <button
          type="button"
          className="group w-full cursor-pointer rounded-3xl text-left outline-none ring-sky-400 transition focus-visible:ring-2"
          onClick={() => navigate('/admin/moderation', { state: { moderationTab: 'projects' } })}
          title="View all projects"
        >
          <StatCard label="Total Projects" value={stats.projects} icon={FolderKanban} accent="emerald" />
        </button>
        <button
          type="button"
          className="group w-full cursor-pointer rounded-3xl text-left outline-none ring-sky-400 transition focus-visible:ring-2"
          onClick={() => navigate('/admin/moderation', { state: { moderationTab: 'certificates' } })}
          title="View all certificates"
        >
          <StatCard label="Certificates" value={stats.certificates} icon={Award} accent="amber" />
        </button>
        <button
          type="button"
          className="group w-full cursor-pointer rounded-3xl text-left outline-none ring-sky-400 transition focus-visible:ring-2"
          onClick={() => navigate('/admin/feedback')}
          title="View all feedback"
        >
          <StatCard label="Feedback" value={stats.feedback} icon={MessageSquare} />
        </button>
        <button
          type="button"
          className="group w-full cursor-pointer rounded-3xl text-left outline-none ring-sky-400 transition focus-visible:ring-2"
          onClick={() => navigate('/admin/leaderboard')}
          title="Open ratings leaderboard"
        >
          <StatCard label="Ratings" value={stats.ratings} icon={Star} />
        </button>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-xl shadow-sky-900/10">
        <h2 className="text-base font-semibold text-slate-900">Activity Overview</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Students', value: stats.students },
                { name: 'Projects', value: stats.projects },
                { name: 'Skills', value: stats.skills },
                { name: 'Certificates', value: stats.certificates },
                { name: 'Feedback', value: stats.feedback },
                { name: 'Ratings', value: stats.ratings },
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
