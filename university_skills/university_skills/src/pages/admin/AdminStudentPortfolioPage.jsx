import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { addFeedback, getStudentPortfolio, upsertStudentRating } from '../../services/adminService'
import PortfolioView from '../../components/portfolio/PortfolioView'
import { Skeleton } from '../../components/common/Skeleton'
import { fieldInputClass } from '../../utils/formFieldClasses'

export default function AdminStudentPortfolioPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const adminId = session?.user?.id ?? null

  const [portfolio, setPortfolio] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(3)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoadError(null)
    const data = await getStudentPortfolio(id)
    if (data.errors?.length) {
      console.error('getStudentPortfolio partial errors', data.errors)
      setLoadError('Some portfolio data could not be loaded. Try refreshing.')
    }
    if (!data.user) {
      setLoadError('Student not found or you may not have access.')
    }
    setPortfolio(data)
    setRating(data?.rating ?? 3)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSaveReview = async () => {
    if (!adminId) {
      toast.error('You are not signed in. Please sign in again.')
      return
    }
    if (!id) {
      toast.error('Missing student id.')
      return
    }

    setSaving(true)
    try {
      const [ratingRes, feedbackRes] = await Promise.all([
        upsertStudentRating(id, rating),
        feedbackText.trim()
          ? addFeedback({ userId: id, adminId, message: feedbackText.trim() })
          : Promise.resolve({ data: null, error: null }),
      ])

      if (ratingRes.error) {
        toast.error(ratingRes.error.message ?? 'Could not save rating.')
        return
      }
      if (feedbackRes.error) {
        toast.error(feedbackRes.error.message ?? 'Could not save feedback.')
        return
      }

      const newRow = feedbackRes.data
      setPortfolio((prev) => {
        if (!prev) return prev
        const nextFeedback =
          newRow && typeof newRow === 'object'
            ? [newRow, ...(prev.feedback ?? [])]
            : prev.feedback ?? []
        return {
          ...prev,
          rating,
          feedback: nextFeedback,
        }
      })
      setFeedbackText('')
      toast.success('Review saved')
    } catch (e) {
      console.error(e)
      toast.error('Something went wrong while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (!portfolio) return <Skeleton className="h-56 rounded-3xl bg-white/10" />

  return (
    <div className="space-y-4">
      {loadError ? (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">{loadError}</p>
      ) : null}

      <PortfolioView data={portfolio} />

      <div className="rounded-3xl bg-white p-4 shadow">
        <h2 className="text-base font-semibold text-slate-900">Recent Feedback</h2>
        <div className="mt-3 space-y-2">
          {(portfolio.feedback ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No feedback yet.</p>
          ) : (
            (portfolio.feedback ?? []).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                <p>{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-white">Portfolio Review</h1>
        <p className="text-sm text-slate-400">Write feedback and assign rating for this student.</p>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-xl shadow-sky-900/10">
        <div className="grid gap-3 md:grid-cols-2">
          <textarea
            className={`${fieldInputClass} rounded-xl`}
            placeholder="Write feedback..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            disabled={saving}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rating (1 to 5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
              disabled={saving}
            />
            <p className="text-sm font-semibold text-sky-700">{rating} / 5</p>
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={saving || !adminId}
              onClick={() => void handleSaveReview()}
            >
              {saving ? 'Saving…' : 'Save Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
