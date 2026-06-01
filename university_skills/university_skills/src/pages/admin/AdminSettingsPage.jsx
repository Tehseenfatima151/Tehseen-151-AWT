import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/studentService'
import { uploadFile } from '../../services/uploadService'
import { fieldInputClass } from '../../utils/formFieldClasses'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, User, Shield, BarChart3, Users, Briefcase, FileText, CheckCircle2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const { profile, refreshProfile } = useAuth()
  
  // Profile forms
  const [name, setName] = useState(profile?.name ?? '')
  const [profileLoading, setProfileLoading] = useState(false)

  // Security forms
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)

  // Statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    totalVerifiedStudents: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      const [students, opportunities, applications, verified] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('is_verified_developer', true)
      ])
      setStats({
        totalStudents: students.count ?? 0,
        totalOpportunities: opportunities.count ?? 0,
        totalApplications: applications.count ?? 0,
        totalVerifiedStudents: verified.count ?? 0
      })
    } catch (err) {
      console.error('Error fetching admin statistics:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [])

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
    }
  }, [profile])

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    setProfileLoading(true)

    const { data, error } = await updateProfile(profile.id, { name })
    setProfileLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      await refreshProfile(data)
      toast.success('Admin details updated!')
    }
  }

  // Handle Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadToast = toast.loading('Uploading avatar...')
    try {
      // Upload directly to profile-pictures bucket
      const publicUrl = await uploadFile('profile-pictures', profile.id, file)
      
      // Update database profile
      const { data, error } = await updateProfile(profile.id, { profile_picture: publicUrl })
      if (error) throw error

      await refreshProfile(data)
      toast.success('Avatar updated successfully!', { id: uploadToast })
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar', { id: uploadToast })
    }
  }

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters long')
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    setSecurityLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSecurityLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const avatarUrl = profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Admin')}&background=4f46e5&color=fff&bold=true`

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage portal configuration, credentials, and track university metrics.</p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Students */}
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-5 shadow-xl shadow-indigo-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-indigo-500/10 blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
              <Users size={16} />
            </span>
          </div>
          <div className="mt-3">
            {statsLoading ? (
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{stats.totalStudents}</h3>
            )}
            <p className="text-[10px] text-slate-500 mt-1 leading-none">Registered BS/MS Students</p>
          </div>
        </div>

        {/* Stat 2: Total Opportunities */}
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 p-5 shadow-xl shadow-sky-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-sky-500/10 blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jobs & Internships</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md">
              <Briefcase size={16} />
            </span>
          </div>
          <div className="mt-3">
            {statsLoading ? (
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{stats.totalOpportunities}</h3>
            )}
            <p className="text-[10px] text-slate-500 mt-1 leading-none">Opportunities posted online</p>
          </div>
        </div>

        {/* Stat 3: Total Applications */}
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 p-5 shadow-xl shadow-emerald-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applications</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
              <FileText size={16} />
            </span>
          </div>
          <div className="mt-3">
            {statsLoading ? (
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{stats.totalApplications}</h3>
            )}
            <p className="text-[10px] text-slate-500 mt-1 leading-none">Student submissions processed</p>
          </div>
        </div>

        {/* Stat 4: Verified Developers */}
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/60 p-5 shadow-xl shadow-purple-950/20 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-purple-500/10 blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Devs</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-md">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mt-3">
            {statsLoading ? (
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{stats.totalVerifiedStudents}</h3>
            )}
            <p className="text-[10px] text-slate-500 mt-1 leading-none">Students with verified badges</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Admin Profile Section */}
          <SectionCard title="Administrator Profile" icon={User}>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-white/5 pb-4">
                <div className="relative group h-20 w-20 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center">
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-[10px] text-white font-semibold transition-opacity duration-200">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-semibold text-slate-200">Admin Picture</h3>
                  <p className="text-xs text-slate-400 mt-1">This picture is visible on system reviews and feedbacks.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input
                    id="name-input"
                    className={fieldInputClass}
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address (Read-only)</label>
                  <input
                    id="email-input"
                    className={`${fieldInputClass} cursor-not-allowed bg-white/5 text-slate-400`}
                    type="email"
                    value={profile?.email ?? ''}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Admin Security Section */}
          <SectionCard title="Password & Security" icon={Shield}>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="password-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
                  <div className="relative">
                    <input
                      id="password-input"
                      className={fieldInputClass}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                  <input
                    id="confirm-password-input"
                    className={fieldInputClass}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-850 px-6 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
                >
                  {securityLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </SectionCard>

        </div>

        {/* Right Column: Information Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md relative overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h2 className="text-md font-bold text-white">System Diagnostics</h2>
            </div>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Supabase Engine</span>
                <span className="font-semibold text-emerald-400">CONNECTED</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Real-time Channels</span>
                <span className="font-semibold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Media Upload Cache</span>
                <span className="font-semibold text-slate-300">3600s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">System Role</span>
                <span className="font-semibold text-indigo-400 uppercase">SUPER-ADMIN</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
