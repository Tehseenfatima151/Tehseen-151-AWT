import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentPortfolio } from '../../services/adminService'
import PortfolioView from '../../components/portfolio/PortfolioView'
import { Skeleton } from '../../components/common/Skeleton'

export default function StudentPortfolioPage() {
  const { profile } = useAuth()
  const [portfolio, setPortfolio] = useState(null)

  useEffect(() => {
    if (!profile?.id) return
    getStudentPortfolio(profile.id).then(setPortfolio)
  }, [profile?.id])

  if (!portfolio) {
    return <Skeleton className="h-56 rounded-3xl bg-white/10" />
  }

  return (
    <div className="space-y-4">
      <PortfolioView data={portfolio} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-800">Your public portfolio URL</p>
        <p className="mt-0.5 text-xs text-slate-500">Share this view with anyone — no login required.</p>
        <Link
          to={`/portfolio/${profile?.id}`}
          className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Public Portfolio
        </Link>
      </div>
    </div>
  )
}
