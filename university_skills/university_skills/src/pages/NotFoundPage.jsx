import { Link } from 'react-router-dom'
import SiteBackground from '../components/layout/SiteBackground'

export default function NotFoundPage() {
  return (
    <SiteBackground>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-3 p-4">
        <h1 className="text-3xl font-bold text-white">404</h1>
        <p className="text-slate-400">Page not found.</p>
        <Link to="/" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
          Go Home
        </Link>
      </div>
    </SiteBackground>
  )
}
