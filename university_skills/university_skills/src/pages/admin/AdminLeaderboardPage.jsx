import { useEffect, useState } from 'react'
import { Crown, Medal, Star, Trophy } from 'lucide-react'
import { listLeaderboard } from '../../services/adminService'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLeaderboardPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listLeaderboard(50).then(({ data }) => {
      setRows(data ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
            <Trophy className="w-6 h-6" />
          </span>
          Top Performers Leaderboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">Discover top talent ranked by ratings and overall performance.</p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-md">
          <Star className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white">No Ratings Yet</h3>
          <p className="mt-1 text-sm text-slate-400">Start rating students to generate the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {rows.map((item, index) => {
              const isTop3 = index < 3
              const placementClass = 
                index === 0 ? 'bg-gradient-to-r from-amber-500/20 to-amber-700/5 border-amber-500/30' : 
                index === 1 ? 'bg-gradient-to-r from-slate-300/20 to-slate-500/5 border-slate-300/30' : 
                index === 2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/5 border-orange-400/30' : 
                'bg-white/5 border-white/5 hover:bg-white/10'

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.user_id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all ${placementClass} ${isTop3 ? 'shadow-lg shadow-black/20 transform hover:-translate-y-1' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {index === 0 ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                          <Crown className="h-6 w-6" />
                        </div>
                      ) : index < 3 ? (
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${index === 1 ? 'bg-slate-300/20 border border-slate-300/50 text-slate-300' : 'bg-orange-400/20 border border-orange-400/50 text-orange-400'}`}>
                          <Medal className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-xs font-bold text-slate-400 border border-white/10">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${isTop3 ? 'text-white text-lg' : 'text-slate-200'}`}>
                        {item.users?.name ?? 'Student'}
                      </p>
                      <p className="text-xs text-slate-400 font-medium tracking-wide">
                        {item.users?.department} • Sem {item.users?.semester}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 font-bold text-lg ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-indigo-400'}`}>
                    <Star className={`h-5 w-5 ${isTop3 ? 'fill-current' : ''}`} />
                    {item.rating.toFixed(1)}
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
