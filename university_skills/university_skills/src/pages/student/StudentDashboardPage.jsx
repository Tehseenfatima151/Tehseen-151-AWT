import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import StatCard from '../../components/common/StatCard'
import { useAuth } from '../../context/AuthContext'
import { getStudentStats, listFeedbackForStudent, listMyApplications, listByUser } from '../../services/studentService'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { Award, FolderKanban, Star, TrendingUp, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { Skeleton } from '../../components/common/Skeleton.jsx'
import { useNavigate } from 'react-router-dom'
import { calculateProfileCompletion } from '../../utils/profileCompletion'

// Module-level cache to persist dashboard data across component unmounts/remounts
let dashboardCache = null

export default function StudentDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  // Use cache if it matches the current user's session
  const hasCache = dashboardCache && dashboardCache.userId === profile?.id

  const [stats, setStats] = useState(hasCache ? dashboardCache.stats : { totalSkills: 0, totalProjects: 0, totalCertificates: 0, rating: null })
  const [applications, setApplications] = useState(hasCache ? dashboardCache.applications : [])
  const [loading, setLoading] = useState(!hasCache)
  const [feedback, setFeedback] = useState(hasCache ? dashboardCache.feedback : [])

  const [education, setEducation] = useState(hasCache ? dashboardCache.education : [])
  const [skills, setSkills] = useState(hasCache ? dashboardCache.skills : [])
  const [projects, setProjects] = useState(hasCache ? dashboardCache.projects : [])
  const [certificates, setCertificates] = useState(hasCache ? dashboardCache.certificates : [])
  const [experience, setExperience] = useState(hasCache ? dashboardCache.experience : [])

  useEffect(() => {
    if (!profile?.id) return
    
    // Only show full loading skeleton if cache is empty
    if (!hasCache) {
      setLoading(true)
    }
    
    Promise.all([
      getStudentStats(profile.id).then(res => {
        setStats(res)
        return res
      }).catch(err => {
        console.error('Error fetching student stats:', err)
        return null
      }),
      listFeedbackForStudent(profile.id).then(({ data }) => {
        const val = data ?? []
        setFeedback(val)
        return val
      }).catch(err => {
        console.error('Error fetching student feedback:', err)
        return []
      }),
      listMyApplications(profile.id).then(({ data }) => {
        const val = data ?? []
        setApplications(val)
        return val
      }).catch(err => {
        console.error('Error fetching student applications:', err)
        return []
      }),
      listByUser('education', profile.id).then(({ data }) => {
        const val = data ?? []
        setEducation(val)
        return val
      }).catch(err => {
        console.error('Error fetching education:', err)
        return []
      }),
      listByUser('skills', profile.id).then(({ data }) => {
        const val = data ?? []
        setSkills(val)
        return val
      }).catch(err => {
        console.error('Error fetching skills:', err)
        return []
      }),
      listByUser('projects', profile.id).then(({ data }) => {
        const val = data ?? []
        setProjects(val)
        return val
      }).catch(err => {
        console.error('Error fetching projects:', err)
        return []
      }),
      listByUser('certificates', profile.id).then(({ data }) => {
        const val = data ?? []
        setCertificates(val)
        return val
      }).catch(err => {
        console.error('Error fetching certificates:', err)
        return []
      }),
      listByUser('experience', profile.id).then(({ data }) => {
        const val = data ?? []
        setExperience(val)
        return val
      }).catch(err => {
        console.error('Error fetching experience:', err)
        return []
      })
    ]).then(([statsVal, feedbackVal, applicationsVal, educationVal, skillsVal, projectsVal, certificatesVal, experienceVal]) => {
      // Save fresh data to module-level cache
      dashboardCache = {
        userId: profile.id,
        stats: statsVal ?? dashboardCache?.stats ?? { totalSkills: 0, totalProjects: 0, totalCertificates: 0, rating: null },
        feedback: feedbackVal ?? dashboardCache?.feedback ?? [],
        applications: applicationsVal ?? dashboardCache?.applications ?? [],
        education: educationVal ?? dashboardCache?.education ?? [],
        skills: skillsVal ?? dashboardCache?.skills ?? [],
        projects: projectsVal ?? dashboardCache?.projects ?? [],
        certificates: certificatesVal ?? dashboardCache?.certificates ?? [],
        experience: experienceVal ?? dashboardCache?.experience ?? []
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [profile?.id, hasCache])

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

  const statBtn = "group text-left w-full h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-950"

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

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-xl flex flex-col justify-between">
          {loading ? (
            <Skeleton className="h-full w-full rounded-2xl bg-white/5" />
          ) : (
            (() => {
              const { percentage, suggestions } = calculateProfileCompletion({
                profile,
                education,
                skills,
                projects,
                certificates,
                experience
              })
              return (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-white">Profile Completion</h2>
                      <span className="text-sm font-bold text-sky-400">{percentage}%</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">Optimize your portfolio for recruiters</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Action Items List */}
                    <div className="mt-5 space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                      {suggestions.length === 0 ? (
                        <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                          🎉 Your profile is 100% complete! You are fully discoverable.
                        </div>
                      ) : (
                        suggestions.map((s, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-3 text-xs bg-white/[0.02] border border-white/5 rounded-lg p-2 hover:bg-white/[0.04] transition">
                            <span className="text-slate-300">{s.text}</span>
                            <button onClick={() => navigate(s.link)} className="text-[10px] font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider whitespace-nowrap">
                              Add
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })()
          )}
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
