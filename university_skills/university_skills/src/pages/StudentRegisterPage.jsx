import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { GraduationCap, User, Mail, Phone, Hash, Layers, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SiteBackground from '../components/layout/SiteBackground'

const labelClass = 'mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider'
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-10 pr-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200/70 text-sm'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-10 pr-10 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200/70 text-sm appearance-none cursor-pointer'

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textClass: 'text-slate-400' }
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 8) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500', textClass: 'text-rose-600 font-bold' }
  if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500', textClass: 'text-orange-600 font-bold' }
  if (score === 3) return { score, label: 'Good', color: 'bg-amber-500', textClass: 'text-amber-500 font-bold' }
  return { score, label: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-600 font-bold' }
}

export default function StudentRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    roll_number: '',
    semester: '',
    section: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const pwdStrength = getPasswordStrength(form.password)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async (e) => {
    e.preventDefault()
    
    // Validations
    if (!form.name.trim()) return toast.error('Full Name is required')
    if (!form.email.trim()) return toast.error('University Email is required')
    if (!form.phone.trim()) return toast.error('Phone Number is required')
    if (!form.roll_number.trim()) return toast.error('Roll Number is required')
    if (!form.semester) return toast.error('Please select your Semester')
    if (!form.section.trim()) return toast.error('Section is required')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      // 1. Sign up the user in Supabase Auth with custom user metadata
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            role: 'student',
            phone: form.phone.trim(),
            roll_number: form.roll_number.trim(),
            section: form.section.trim(),
            semester: form.semester,
            is_admin_created: false
          }
        }
      })

      if (error) throw error

      // 2. Optimistically sign the student out immediately
      // This is crucial because Supabase auto-logs in the user on signup, but they must wait for admin approval
      await supabase.auth.signOut()

      toast.success('Registration request submitted! Awaiting admin approval.', {
        duration: 8000
      })
      
      // Redirect to login page
      navigate('/student/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SiteBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-1 shadow-2xl shadow-sky-900/30"
        >
          <div className="rounded-[22px] bg-white p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest leading-none">CUI SkillSphere</span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Student Registration</h1>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                  Create an account to submit your skills and portfolio. Your registration requires administrator approval.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
                <GraduationCap className="h-6 w-6 text-sky-700" aria-hidden />
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <User size={15} />
                    </span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={inputClass}
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* University Email */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    University Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Mail size={15} />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={inputClass}
                      placeholder="you@university.edu"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Phone size={15} />
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={inputClass}
                      placeholder="+92 3XX XXXXXXX"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <label htmlFor="roll_number" className={labelClass}>
                    Roll Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Hash size={15} />
                    </span>
                    <input
                      id="roll_number"
                      name="roll_number"
                      type="text"
                      className={inputClass}
                      placeholder="FA24-BCS-000"
                      value={form.roll_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semester" className={labelClass}>
                    Semester
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 z-10 pointer-events-none">
                      <Layers size={15} />
                    </span>
                    <select
                      id="semester"
                      name="semester"
                      className={selectClass}
                      value={form.semester}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select Semester</option>
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Section */}
                <div>
                  <label htmlFor="section" className={labelClass}>
                    Section
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Layers size={15} />
                    </span>
                    <input
                      id="section"
                      name="section"
                      type="text"
                      className={inputClass}
                      placeholder="e.g. A, B, CS-1A"
                      value={form.section}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Lock size={15} />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={inputClass}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
                        <span className="text-slate-500 uppercase">Strength</span>
                        <span className={`${pwdStrength.textClass} uppercase`}>{pwdStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1">
                        <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-100'}`} />
                        <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-100'}`} />
                        <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-100'}`} />
                        <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-slate-100'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Lock size={15} />
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      className={inputClass}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/15 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  'Submitting request...'
                ) : (
                  <>
                    <ShieldCheck size={16} /> Register via Admin Approval <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <Link to="/student/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Already have an account? Sign in
              </Link>
              <Link to="/" className="hover:text-slate-700 transition-colors font-medium">
                Back to Home
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </SiteBackground>
  )
}
