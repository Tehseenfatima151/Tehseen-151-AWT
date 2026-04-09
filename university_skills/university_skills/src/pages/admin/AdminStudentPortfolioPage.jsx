import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { addFeedback, getStudentPortfolio, upsertStudentRating } from '../../services/adminService'
import PortfolioView from '../../components/portfolio/PortfolioView'
import { Skeleton } from '../../components/common/Skeleton'
import { fieldInputClass } from '../../utils/formFieldClasses'

export default function AdminStudentPortfolioPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(3)

  const load = async () => {
    const data = await getStudentPortfolio(id)
    setPortfolio(data)
    setRating(data?.rating ?? 3)
  }

  useEffect(() => {
    load()
  }, [id])

  if (!portfolio) return <Skeleton className="h-56 rounded-3xl bg-white/10" />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Portfolio Review</h1>
        <p className="text-sm text-slate-400">Write feedback and assign rating for this student.</p>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-xl shadow-sky-900/10">
        <div className="grid gap-3 md:grid-cols-2">
          <textarea className={`${fieldInputClass} rounded-xl`} placeholder="Write feedback..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rating (1 to 5)</label>
            <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full" />
            <p className="text-sm font-semibold text-sky-700">{rating} / 5</p>
            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={async () => {
                if (!profile?.id) return
                const [ratingRes, feedbackRes] = await Promise.all([
                  upsertStudentRating(id, rating),
                  feedbackText.trim() ? addFeedback({ userId: id, adminId: profile.id, message: feedbackText.trim() }) : Promise.resolve({ error: null }),
                ])
                if (ratingRes.error) return toast.error(ratingRes.error.message)
                if (feedbackRes.error) return toast.error(feedbackRes.error.message)
                setFeedbackText('')
                toast.success('Review saved')
                await load()
              }}
            >
              Save Review
            </button>
          </div>
        </div>
      </div>

      <PortfolioView data={portfolio} />

      <div className="rounded-3xl bg-white p-4 shadow">
        <h2 className="text-base font-semibold text-slate-900">Recent Feedback</h2>
        <div className="mt-3 space-y-2">
          {(portfolio.feedback ?? []).map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-100 p-3 text-sm">
              <p>{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

