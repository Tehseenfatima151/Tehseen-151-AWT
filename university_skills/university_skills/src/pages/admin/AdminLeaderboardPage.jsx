import { useEffect, useState } from 'react'
import { Crown, Medal, Star } from 'lucide-react'
import { listLeaderboard } from '../../services/adminService'
import EmptyState from '../../components/common/EmptyState'

export default function AdminLeaderboardPage() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    listLeaderboard(50).then(({ data }) => setRows(data ?? []))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Top Students Leaderboard</h1>
      <div className="rounded-3xl bg-white p-4 shadow-xl shadow-sky-900/10">
        {rows.length === 0 ? (
          <EmptyState title="No ratings yet" description="Start rating students to generate leaderboard." />
        ) : (
          <div className="space-y-2">
            {rows.map((item, index) => (
              <div key={item.user_id} className={`flex items-center justify-between rounded-2xl border p-3 ${index < 3 ? 'border-amber-200 bg-amber-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{item.users?.name ?? 'Student'}</p>
                    <p className="text-xs text-slate-600">{item.users?.department} • {item.users?.semester}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-semibold text-amber-600">
                  {index === 0 ? <Crown className="h-4 w-4" /> : index < 3 ? <Medal className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  {item.rating}/5
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

