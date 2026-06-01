import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Send, Calendar, Navigation, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { listActiveOpportunities, applyToOpportunity, listMyApplications } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

// Module-level cache to persist opportunities list across page transitions
let opportunitiesCache = null

export default function StudentOpportunitiesPage() {
  const { profile } = useAuth()

  // Use cache if it matches the current user's session
  const hasCache = opportunitiesCache && opportunitiesCache.userId === profile?.id

  const [opportunities, setOpportunities] = useState(hasCache ? opportunitiesCache.opportunities : [])
  const [applications, setApplications] = useState(hasCache ? opportunitiesCache.applications : [])
  const [loading, setLoading] = useState(!hasCache)
  const [applying, setApplying] = useState(null)

  const fetchData = async () => {
    if (!profile?.id) return
    try {
      if (!hasCache) {
        setLoading(true)
      }
      const [oppsRes, appsRes] = await Promise.all([
        listActiveOpportunities(),
        listMyApplications(profile.id)
      ])
      
      if (oppsRes.error) throw oppsRes.error
      if (appsRes.error) throw appsRes.error
      
      const opps = oppsRes.data || []
      const apps = appsRes.data || []
      
      setOpportunities(opps)
      setApplications(apps)
      
      // Update cache
      opportunitiesCache = {
        userId: profile.id,
        opportunities: opps,
        applications: apps
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err)
      toast.error('Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.id) {
      fetchData()
    }
  }, [profile?.id])

  const handleApply = async (oppId) => {
    try {
      setApplying(oppId)
      const { error } = await applyToOpportunity(oppId, profile.id)
      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied')
        } else {
          throw error
        }
      } else {
        toast.success('Successfully applied! Your portfolio was attached.')
        fetchData()
      }
    } catch (err) {
      toast.error('Failed to apply. Please try again.')
    } finally {
      setApplying(null)
    }
  }

  const hasApplied = (oppId) => applications.some(app => app.opportunity_id === oppId)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-sky-500/10 p-2 rounded-xl text-sky-400">
              <Compass className="w-6 h-6" />
            </span>
            Available Opportunities
          </h1>
          <p className="text-sm text-slate-400 mt-1">Discover and apply to internships, jobs, and project opportunities.</p>
        </div>
        <Link
          to="/student/applications"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10 text-white transition-colors text-sm font-medium"
        >
          <Navigation className="w-4 h-4"/> Track My Applications
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5" />)}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
          <Briefcase className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No Opportunities Available</h3>
          <p className="mt-1 text-sm text-slate-400">Check back later for new openings.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {opportunities.map((opp) => {
              const applied = hasApplied(opp.id)
              return (
                <motion.div
                  layout
                  key={opp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md hover:bg-white/10 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-white text-lg line-clamp-2">{opp.title}</h3>
                  </div>
                  
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-grow">{opp.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    {Array.isArray(opp.required_skills) ? opp.required_skills.slice(0, 3).map((s, i) => (
                      <span key={i} className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                        {s}
                      </span>
                    )) : null}
                    {Array.isArray(opp.required_skills) && opp.required_skills.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                        +{opp.required_skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-4 h-4"/> 
                      Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </div>
                    
                    {applied ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(opp.id)}
                        disabled={applying === opp.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 disabled:opacity-50 hover:scale-105 active:scale-95"
                      >
                        {applying === opp.id ? 'Sending...' : <><Send className="w-4 h-4"/> Apply Now</>}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

function Compass(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  )
}
