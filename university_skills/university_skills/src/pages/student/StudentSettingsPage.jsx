import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, listByUser } from '../../services/studentService'
import { uploadFile } from '../../services/uploadService'
import { fieldInputClass } from '../../utils/formFieldClasses'
import { calculateProfileCompletion } from '../../utils/profileCompletion'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, User, Link2, Shield, Sparkles, AlertCircle } from 'lucide-react'

export default function StudentSettingsPage() {
  const { profile, refreshProfile } = useAuth()
  
  // Profile forms
  const [name, setName] = useState(profile?.name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [githubUrl, setGithubUrl] = useState(profile?.github_url ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url ?? '')
  const [profileLoading, setProfileLoading] = useState(false)

  // Security forms
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)

  // Data for profile completion
  const [education, setEducation] = useState([])
  const [skills, setSkills] = useState([])
  const [projects, setProjects] = useState([])
  const [certificates, setCertificates] = useState([])
  const [experience, setExperience] = useState([])

  // Fetch data for completion calculation
  const fetchCompletionData = async () => {
    if (!profile?.id) return
    const [edu, sk, proj, cert, exp] = await Promise.all([
      listByUser('education', profile.id),
      listByUser('skills', profile.id),
      listByUser('projects', profile.id),
      listByUser('certificates', profile.id),
      listByUser('experience', profile.id)
    ])
    setEducation(edu.data ?? [])
    setSkills(sk.data ?? [])
    setProjects(proj.data ?? [])
    setCertificates(cert.data ?? [])
    setExperience(exp.data ?? [])
  }

  useEffect(() => {
    fetchCompletionData()
  }, [profile?.id])

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setBio(profile.bio ?? '')
      setGithubUrl(profile.github_url ?? '')
      setLinkedinUrl(profile.linkedin_url ?? '')
      setWebsiteUrl(profile.website_url ?? '')
    }
  }, [profile])

  const { percentage, suggestions } = calculateProfileCompletion({
    profile,
    education,
    skills,
    projects,
    certificates,
    experience
  })

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    setProfileLoading(true)

    const payload = {
      name,
      bio,
      github_url: githubUrl || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,
    }

    const { data, error } = await updateProfile(profile.id, payload)
    setProfileLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      await refreshProfile(data)
      toast.success('Profile details updated!')
      fetchCompletionData()
    }
  }

  // Handle Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadToast = toast.loading('Uploading avatar...')
    try {
      // Upload directly to profile-pictures bucket under user folder
      const publicUrl = await uploadFile('profile-pictures', profile.id, file)
      
      // Update database profile
      const { data, error } = await updateProfile(profile.id, { profile_picture: publicUrl })
      if (error) throw error

      await refreshProfile(data)
      toast.success('Avatar updated successfully!', { id: uploadToast })
      fetchCompletionData()
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

  const avatarUrl = profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=0284c7&color=fff&bold=true`

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your student profile preferences, storage uploads, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <SectionCard title="Profile Details" icon={User}>
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
                  <h3 className="text-sm font-semibold text-slate-200">Profile Picture</h3>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG or JPEG. Max size of 2MB.</p>
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

              <div>
                <label htmlFor="bio-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Professional Bio</label>
                <textarea
                  id="bio-input"
                  className={fieldInputClass}
                  placeholder="Tell us about yourself, your career goals, and what stack you specialize in..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mb-3">
                  <Link2 size={14} className="text-sky-400" />
                  Social & Portfolio Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="linkedin-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">LinkedIn URL</label>
                    <input
                      id="linkedin-input"
                      className={fieldInputClass}
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="github-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">GitHub URL</label>
                    <input
                      id="github-input"
                      className={fieldInputClass}
                      type="url"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="website-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Website / Portfolio URL</label>
                    <input
                      id="website-input"
                      className={fieldInputClass}
                      type="url"
                      placeholder="https://myportfolio.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-500 transition-colors"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Security Section */}
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

        {/* Right Side: Profile Completion */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md relative overflow-hidden">
            {/* Glow backdrop */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <h2 className="text-md font-bold text-white">Profile Strength</h2>
            </div>

            {/* Circular Progress Bar */}
            <div className="flex flex-col items-center py-4">
              <div className="relative flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#0ea5e9"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - percentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-white">{percentage}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Complete</span>
                </div>
              </div>
            </div>

            {/* Action Suggestions */}
            <div className="mt-6 border-t border-white/5 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-sky-400" />
                Recommendations
              </h3>
              
              {suggestions.length === 0 ? (
                <p className="text-xs text-emerald-400 font-medium">Your profile is 100% complete! Great work.</p>
              ) : (
                <ul className="space-y-2">
                  {suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start justify-between gap-3 text-xs bg-white/[0.02] border border-white/5 rounded-lg p-2 hover:bg-white/[0.04] transition">
                      <span className="text-slate-300">{s.text}</span>
                      <Link to={s.link} className="text-[10px] font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider whitespace-nowrap">
                        Fix
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
