import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import { getAdminStats } from '../../services/adminService'
import { listNotifications } from '../../services/notificationService'
import { useAuth } from '../../context/AuthContext'
import { Users, FolderKanban, Award, MessageSquare, Star, Briefcase, Bell } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function AdminDashboardPage() {
  const { profile } = useAuth()
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
  
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  useEffect(() => {
    if (!profile?.id) return
    listNotifications(profile.id).then(({ data }) => {
      if (data) setNotifications(data)
    })
  }, [profile?.id])

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length
  }, [notifications])

  const recentActivityCount = useMemo(() => {
    const last24h = Date.now() - 24 * 60 * 60 * 1000
    return notifications.filter(n => new Date(n.created_at).getTime() >= last24h).length
  }, [notifications])

  const cardBtn =
    'group w-full cursor-pointer rounded-xl text-left outline-none ring-sky-400 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

  return (
    <div className="space-y-4 md:space-y-5">
      <h1 className="text-xl font-bold text-white md:text-2xl">Admin Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-4 xl:grid-cols-4">
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
        <button type="button" className={cardBtn} onClick={() => navigate('/admin/notifications')} title="Open admin inbox">
          <StatCard 
            compact 
            label="Inbox Alerts" 
            value={unreadNotificationsCount} 
            icon={Bell} 
            accent="indigo" 
            hint={recentActivityCount > 0 ? `${recentActivityCount} new in 24h` : 'No new activity'} 
          />
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

      <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-xl md:rounded-3xl md:p-5">
        <h2 className="text-sm font-semibold text-white md:text-base">Platform Activity Overview</h2>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
