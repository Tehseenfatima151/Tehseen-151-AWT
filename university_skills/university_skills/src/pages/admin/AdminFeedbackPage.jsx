import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import EmptyState from '../../components/common/EmptyState'
import { listAllFeedback } from '../../services/adminService'
import { Skeleton } from '../../components/common/Skeleton'

export default function AdminFeedbackPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await listAllFeedback()
      if (cancelled) return
      setLoading(false)
      if (error) {
        toast.error(error.message)
        return
      }
      setItems(data ?? [])
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">All feedback</h1>
        <p className="mt-1 text-sm text-slate-400">Messages admins sent to students, newest first.</p>
      </div>

      <SectionCard title="Feedback log">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No feedback yet" description={"When you add feedback on a student's portfolio, it will appear here."} />
        ) : (
          <ul className="space-y-3">
            {items.map((row) => (
              <li key={row.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-sm text-slate-800">{row.message}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>
                    <span className="font-medium text-slate-700">Student:</span> {row.student?.name ?? '—'}{' '}
                    {row.student?.email ? `(${row.student.email})` : null}
                  </span>
                  <span>
                    <span className="font-medium text-slate-700">From admin:</span> {row.admin_user?.name ?? '—'}
                  </span>
                  <span>{new Date(row.created_at).toLocaleString()}</span>
                  {row.user_id ? (
                    <Link to={`/admin/students/${row.user_id}`} className="font-medium text-sky-700 hover:underline">
                      View portfolio
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
