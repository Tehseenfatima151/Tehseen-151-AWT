import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { createItem, deleteItem, listByUser, updateProfile } from '../../services/studentService'
import { uploadFile } from '../../services/uploadService'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { fieldInputClass } from '../../utils/formFieldClasses'

const emptyProfileForm = (profile) => ({
  name: profile?.name ?? '',
  department: profile?.department ?? '',
  semester: profile?.semester ?? '',
  bio: profile?.bio ?? '',
  phone: profile?.phone ?? '',
  address: profile?.address ?? '',
  dob: profile?.dob ?? '',
  nationality: profile?.nationality ?? '',
  languages: profile?.languages ?? '',
  professional_title: profile?.professional_title ?? '',
})

const emptySocialForm = (profile) => ({
  github_url: profile?.github_url ?? '',
  linkedin_url: profile?.linkedin_url ?? '',
  twitter_url: profile?.twitter_url ?? '',
  instagram_url: profile?.instagram_url ?? '',
  facebook_url: profile?.facebook_url ?? '',
  website_url: profile?.website_url ?? '',
})

export default function StudentProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [form, setForm] = useState(() => emptyProfileForm(profile))
  const [social, setSocial] = useState(() => emptySocialForm(profile))
  const [profileLoading, setProfileLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [education, setEducation] = useState([])
  const [experience, setExperience] = useState([])
  const [newEdu, setNewEdu] = useState({ degree: '', university: '', year: '' })
  const [newExp, setNewExp] = useState({ role: '', company: '', duration: '', description: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    setForm(emptyProfileForm(profile))
    setSocial(emptySocialForm(profile))
  }, [profile])

  useEffect(() => {
    if (!profile?.id) return
    listByUser('education', profile.id).then(({ data }) => setEducation(data ?? []))
    listByUser('experience', profile.id).then(({ data }) => setExperience(data ?? []))
  }, [profile?.id])

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    const payload = {
      name: form.name,
      department: form.department,
      semester: form.semester,
      bio: form.bio,
      phone: form.phone || null,
      address: form.address || null,
      dob: form.dob || null,
      nationality: form.nationality || null,
      languages: form.languages || null,
      professional_title: form.professional_title || null,
    }
    const { data, error } = await updateProfile(profile.id, payload)
    if (error) {
      setProfileLoading(false)
      return toast.error(error.message)
    }
    if (data) await refreshProfile(data)
    else await refreshProfile()
    setProfileLoading(false)
    toast.success('Profile updated')
  }

  const saveSocial = async (e) => {
    e.preventDefault()
    setSocialLoading(true)
    const payload = {
      github_url: social.github_url || null,
      linkedin_url: social.linkedin_url || null,
      twitter_url: social.twitter_url || null,
      instagram_url: social.instagram_url || null,
      facebook_url: social.facebook_url || null,
      website_url: social.website_url || null,
    }
    const { data, error } = await updateProfile(profile.id, payload)
    if (error) {
      setSocialLoading(false)
      return toast.error(error.message)
    }
    if (data) await refreshProfile(data)
    else await refreshProfile()
    setSocialLoading(false)
    toast.success('Social links saved')
  }

  const onAvatar = async (file) => {
    if (!file) return
    try {
      const publicUrl = await uploadFile('profile-pictures', profile.id, file)
      const { data, error } = await updateProfile(profile.id, { profile_picture: publicUrl })
      if (error) throw new Error(error.message)
      if (data) await refreshProfile(data)
      else await refreshProfile()
      toast.success('Profile picture updated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addEducation = async (e) => {
    e.preventDefault()
    const { error } = await createItem('education', { ...newEdu, user_id: profile.id })
    if (error) return toast.error(error.message)
    const { data } = await listByUser('education', profile.id)
    setEducation(data ?? [])
    setNewEdu({ degree: '', university: '', year: '' })
    toast.success('Education added')
  }

  const addExperience = async (e) => {
    e.preventDefault()
    const { error } = await createItem('experience', { ...newExp, user_id: profile.id })
    if (error) return toast.error(error.message)
    const { data } = await listByUser('experience', profile.id)
    setExperience(data ?? [])
    setNewExp({ role: '', company: '', duration: '', description: '' })
    toast.success('Experience added')
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Profile Management">
        <p className="mb-3 text-sm text-slate-600">Personal details and professional title. Education and work history are added below in their own sections.</p>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={saveProfile}>
          <div>
            <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input id="profile-name" className={fieldInputClass} placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="profile-email"
              className={`${fieldInputClass} cursor-not-allowed bg-slate-100 text-slate-700`}
              placeholder="you@example.com"
              value={profile?.email ?? ''}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input id="profile-phone" className={fieldInputClass} type="tel" placeholder="+92 300 0000000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label htmlFor="profile-title" className="mb-1 block text-sm font-medium text-slate-700">
              Professional title
            </label>
            <input id="profile-title" className={fieldInputClass} placeholder="e.g. Software Engineer" value={form.professional_title} onChange={(e) => setForm({ ...form, professional_title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="profile-address" className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input id="profile-address" className={fieldInputClass} placeholder="City, country" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="profile-bio" className="mb-1 block text-sm font-medium text-slate-700">
              About
            </label>
            <textarea id="profile-bio" className={fieldInputClass} placeholder="Short bio or summary" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <label htmlFor="profile-dob" className="mb-1 block text-sm font-medium text-slate-700">
              Date of birth
            </label>
            <input
              id="profile-dob"
              className={fieldInputClass}
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              max={new Date().toISOString().slice(0, 10)}
              title="Pick your full date of birth"
            />
            <p className="mt-1 text-xs text-slate-500">
              Open the calendar and choose <span className="font-medium">day</span>, <span className="font-medium">month</span>, and <span className="font-medium">year</span>.
            </p>
          </div>
          <div>
            <label htmlFor="profile-nationality" className="mb-1 block text-sm font-medium text-slate-700">
              Nationality
            </label>
            <input
              id="profile-nationality"
              className={fieldInputClass}
              placeholder="e.g. Pakistani"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="profile-languages" className="mb-1 block text-sm font-medium text-slate-700">
              Languages
            </label>
            <input id="profile-languages" className={fieldInputClass} placeholder="e.g. English, Urdu" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
          </div>
          <div>
            <label htmlFor="profile-department" className="mb-1 block text-sm font-medium text-slate-700">
              Department / major
            </label>
            <input id="profile-department" className={fieldInputClass} placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label htmlFor="profile-semester" className="mb-1 block text-sm font-medium text-slate-700">
              Semester / level
            </label>
            <input id="profile-semester" className={fieldInputClass} placeholder="e.g. 6" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="profile-avatar" className="mb-1 block text-sm font-medium text-slate-700">
              Profile picture
            </label>
            <input id="profile-avatar" type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0])} className={fieldInputClass} />
          </div>
          <button disabled={profileLoading} className="rounded-lg bg-slate-900 px-4 py-2 text-white md:col-span-2">
            {profileLoading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Social media & links">
        <p className="mb-3 text-sm text-slate-600">Add your public profiles and website. URLs should start with https://</p>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={saveSocial}>
          <div>
            <label htmlFor="social-github" className="mb-1 block text-sm font-medium text-slate-700">
              GitHub
            </label>
            <input id="social-github" className={fieldInputClass} placeholder="https://github.com/..." value={social.github_url} onChange={(e) => setSocial({ ...social, github_url: e.target.value })} />
          </div>
          <div>
            <label htmlFor="social-linkedin" className="mb-1 block text-sm font-medium text-slate-700">
              LinkedIn
            </label>
            <input id="social-linkedin" className={fieldInputClass} placeholder="https://linkedin.com/in/..." value={social.linkedin_url} onChange={(e) => setSocial({ ...social, linkedin_url: e.target.value })} />
          </div>
          <div>
            <label htmlFor="social-twitter" className="mb-1 block text-sm font-medium text-slate-700">
              Twitter / X
            </label>
            <input id="social-twitter" className={fieldInputClass} placeholder="https://x.com/..." value={social.twitter_url} onChange={(e) => setSocial({ ...social, twitter_url: e.target.value })} />
          </div>
          <div>
            <label htmlFor="social-instagram" className="mb-1 block text-sm font-medium text-slate-700">
              Instagram
            </label>
            <input id="social-instagram" className={fieldInputClass} placeholder="https://instagram.com/..." value={social.instagram_url} onChange={(e) => setSocial({ ...social, instagram_url: e.target.value })} />
          </div>
          <div>
            <label htmlFor="social-facebook" className="mb-1 block text-sm font-medium text-slate-700">
              Facebook
            </label>
            <input id="social-facebook" className={fieldInputClass} placeholder="https://facebook.com/..." value={social.facebook_url} onChange={(e) => setSocial({ ...social, facebook_url: e.target.value })} />
          </div>
          <div>
            <label htmlFor="social-website" className="mb-1 block text-sm font-medium text-slate-700">
              Website / portfolio
            </label>
            <input id="social-website" className={fieldInputClass} placeholder="https://..." value={social.website_url} onChange={(e) => setSocial({ ...social, website_url: e.target.value })} />
          </div>
          <button disabled={socialLoading} className="rounded-lg bg-sky-600 px-4 py-2 text-white md:col-span-2">
            {socialLoading ? 'Saving...' : 'Save social links'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Education">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={addEducation}>
          <div className="lg:col-span-1">
            <label htmlFor="edu-degree" className="mb-1 block text-sm font-medium text-slate-700">
              Degree
            </label>
            <input id="edu-degree" className={fieldInputClass} placeholder="e.g. BS Computer Science" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} required />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="edu-university" className="mb-1 block text-sm font-medium text-slate-700">
              University
            </label>
            <input id="edu-university" className={fieldInputClass} placeholder="Institution name" value={newEdu.university} onChange={(e) => setNewEdu({ ...newEdu, university: e.target.value })} required />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="edu-year" className="mb-1 block text-sm font-medium text-slate-700">
              Year
            </label>
            <input id="edu-year" className={fieldInputClass} placeholder="e.g. 2026" value={newEdu.year} onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })} />
          </div>
          <div className="flex items-end lg:col-span-1">
            <button type="submit" className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white">
              Add education
            </button>
          </div>
        </form>
        <div className="mt-3 space-y-2">
          {education.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{item.degree}</p>
                <p className="text-slate-600">
                  {item.university} • {item.year}
                </p>
              </div>
              <button type="button" className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => setConfirmDelete({ table: 'education', id: item.id })}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Experience">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={addExperience}>
          <div>
            <label htmlFor="exp-role" className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <input id="exp-role" className={fieldInputClass} placeholder="Job title" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="exp-company" className="mb-1 block text-sm font-medium text-slate-700">
              Company
            </label>
            <input id="exp-company" className={fieldInputClass} placeholder="Organization" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="exp-duration" className="mb-1 block text-sm font-medium text-slate-700">
              Duration
            </label>
            <input id="exp-duration" className={fieldInputClass} placeholder="e.g. Jan 2024 – Present" value={newExp.duration} onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="exp-description" className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea id="exp-description" className={fieldInputClass} placeholder="What you did and impact (optional)" value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} />
          </div>
          <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-white md:col-span-2">
            Add experience
          </button>
        </form>
        <div className="mt-3 space-y-2">
          {experience.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{item.role}</p>
                <p className="text-slate-600">
                  {item.company} • {item.duration}
                </p>
              </div>
              <button type="button" className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => setConfirmDelete({ table: 'experience', id: item.id })}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete item?"
        message="This action cannot be undone."
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return
          await deleteItem(confirmDelete.table, confirmDelete.id)
          if (confirmDelete.table === 'education') {
            const { data } = await listByUser('education', profile.id)
            setEducation(data ?? [])
          } else {
            const { data } = await listByUser('experience', profile.id)
            setExperience(data ?? [])
          }
          setConfirmDelete(null)
          toast.success('Deleted')
        }}
      />
    </div>
  )
}
