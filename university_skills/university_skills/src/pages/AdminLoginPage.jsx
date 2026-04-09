import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { SkeletonText } from '../components/common/Skeleton.jsx'
import { getPasswordResetRedirectUrl, setAuthSessionOnly } from '../lib/authPersistence'
import SiteBackground from '../components/layout/SiteBackground'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-300/80'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshFromSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.reason === 'no_profile') {
      toast.error('Profile row missing or blocked. Run SQL fix in README / fix_rls_recursion.sql and ensure your admin row has role = admin.')
    }
  }, [location.state])

  const sendReset = async (e) => {
    e.preventDefault()
    const email = (resetEmail || form.email).trim()
    if (!email) {
      toast.error('Enter your email address.')
      return
    }
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
    })
    setResetLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Check your email for the reset link.')
    setShowForgot(false)
    setResetEmail('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAuthSessionOnly(!rememberMe)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    await refreshFromSession()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: profileRow } = await supabase.from('users').select('id, role').eq('id', user?.id ?? '').maybeSingle()
    if (!profileRow) {
      toast.error('Profile row not found in public.users for this account.')
      setLoading(false)
      return
    }
    if (profileRow.role !== 'admin') {
      toast.error('This account is not assigned admin role in public.users.')
      setLoading(false)
      return
    }
    toast.success('Admin login successful')
    navigate('/admin', { replace: true })
    setLoading(false)
  }

  return (
    <SiteBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.form
        onSubmit={showForgot ? sendReset : submit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-1 shadow-2xl shadow-sky-900/30"
      >
        <div className="rounded-[22px] bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900">{showForgot ? 'Reset password' : 'Admin Login'}</h1>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {showForgot
                  ? 'We will email you a secure link to set a new password.'
                  : 'Sign in to manage students, feedback, moderation, and analytics.'}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              <ShieldCheck className="h-6 w-6 text-slate-800" aria-hidden />
            </div>
          </div>

          {showForgot ? (
            <button
              type="button"
              className="mt-5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
              onClick={() => setShowForgot(false)}
            >
              ← Back to sign in
            </button>
          ) : null}

          {showForgot ? (
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="admin-reset-email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="admin-reset-email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder="admin@institution.edu"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
              >
                {resetLoading ? 'Sending…' : 'Send reset link'}
                {!resetLoading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="admin@institution.edu"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="shrink-0 text-sm font-semibold text-slate-800 underline-offset-2 hover:text-slate-950 hover:underline"
                      onClick={() => {
                        setShowForgot(true)
                        setResetEmail(form.email)
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`${inputClass} pr-11`}
                      placeholder="Enter your password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex w-full flex-col gap-2">
                    <span className="text-sm font-semibold">Signing in…</span>
                    <SkeletonText lines={2} />
                  </span>
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </>
          )}

          <div className="mt-6">
            <Link className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline" to="/">
              Back to home
            </Link>
          </div>
        </div>
      </motion.form>
      </div>
    </SiteBackground>
  )
}
