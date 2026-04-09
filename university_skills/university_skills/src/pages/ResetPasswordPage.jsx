import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SiteBackground from '../components/layout/SiteBackground'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200/70'

function recoveryHintInUrl() {
  if (typeof window === 'undefined') return false
  return /type=recovery|recovery/i.test(`${window.location.hash}${window.location.search}`)
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const tryOpenForm = (session) => {
      if (cancelled || !session) return
      setStatus('form')
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY') {
        tryOpenForm(session)
        return
      }
      if (session && recoveryHintInUrl()) tryOpenForm(session)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session && recoveryHintInUrl()) tryOpenForm(session)
    })

    const t = window.setTimeout(() => {
      if (cancelled) return
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return
        if (session) tryOpenForm(session)
        else setStatus((s) => (s === 'loading' ? 'need_link' : s))
      })
    }, 4500)

    return () => {
      cancelled = true
      window.clearTimeout(t)
      subscription.unsubscribe()
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Password updated. You can sign in now.')
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <SiteBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-1 shadow-2xl"
      >
        <div className="rounded-[22px] bg-white p-6 md:p-8">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
              <p className="mt-1 text-sm text-slate-600">Use the link from your email, then choose a new password below.</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100">
              <KeyRound className="h-6 w-6 text-sky-700" aria-hidden />
            </div>
          </div>

          {status === 'loading' ? <p className="mt-6 text-sm text-slate-600">Verifying your reset link…</p> : null}

          {status === 'need_link' ? (
            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
              <p className="font-medium">We couldn&apos;t open a reset session.</p>
              <p className="mt-2 text-amber-800/90">
                Open this page from the password-reset email, or request a new link from the login screen. In Supabase, add{' '}
                <code className="rounded bg-white px-1 py-0.5 text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password</code>{' '}
                under Authentication → URL configuration → Redirect URLs.
              </p>
            </div>
          ) : null}

          {status === 'form' ? (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label htmlFor="np-pass" className="mb-1 block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="np-pass"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${inputClass} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="np-confirm" className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  id="np-confirm"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={inputClass}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-500 disabled:opacity-60"
              >
                {loading ? 'Saving…' : (
                  <>
                    Save password <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link className="font-medium text-sky-700 underline-offset-4 hover:underline" to="/student/login">
              Student login
            </Link>
            <span className="text-slate-300">·</span>
            <Link className="font-medium text-sky-700 underline-offset-4 hover:underline" to="/admin/login">
              Admin login
            </Link>
            <span className="text-slate-300">·</span>
            <Link className="font-medium text-slate-600 underline-offset-4 hover:underline" to="/">
              Home
            </Link>
          </div>
        </div>
      </motion.div>
      </div>
    </SiteBackground>
  )
}
