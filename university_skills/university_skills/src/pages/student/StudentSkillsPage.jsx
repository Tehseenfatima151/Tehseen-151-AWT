import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { createItem, deleteItem, listByUser, updateItem } from '../../services/studentService'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const CS_QUICK_SKILLS = [
  'React.js', 'Node.js', 'Python', 'JavaScript', 'SQL',
  'Git & GitHub', 'Java', 'C++', 'Data Structures', 'Tailwind CSS'
]

export default function StudentSkillsPage() {
  const { profile } = useAuth()
  const profileId = profile?.id
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ skill_name: '', skill_level: 'Beginner' })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await listByUser('skills', profileId)
    setItems(data ?? [])
  }, [profileId])
  useEffect(() => {
    if (profileId) load()
  }, [profileId, load])

  const submit = async (e) => {
    e.preventDefault()
    if (!profileId) return toast.error('Please wait, profile is still loading')
    if (!form.skill_name.trim()) return toast.error('Skill name is required')
    const skillName = form.skill_name.trim()
    const payload = {
      skill_name: skillName,
      skill_level: form.skill_level,
      user_id: profileId,
    }
    setSaving(true)
    try {
      const res = editId ? await updateItem('skills', editId, payload) : await createItem('skills', payload)
      if (res.error) return toast.error(res.error.message)

      const savedItem = res.data
      if (savedItem) {
        setItems((prev) => {
          if (editId) {
            return prev.map((item) => (item.id === editId ? savedItem : item))
          }
          return [savedItem, ...prev]
        })
      } else {
        await load()
      }

      setForm({ skill_name: '', skill_level: 'Beginner' })
      setEditId(null)
      toast.success(editId ? 'Skill updated' : 'Skill added')
    } finally {
      setSaving(false)
    }
  }

  const addQuickSkill = async (skillName) => {
    if (!profileId) return
    setSaving(true)
    const payload = {
      skill_name: skillName,
      skill_level: 'Intermediate',
      user_id: profileId,
    }
    try {
      const res = await createItem('skills', payload)
      if (res.error) return toast.error(res.error.message)
      if (res.data) {
        setItems((prev) => [res.data, ...prev])
        toast.success(`"${skillName}" added quickly!`)
      }
    } catch (err) {
      toast.error('Failed to add skill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="Skills">
      <form className="mb-6 grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <div>
          <label htmlFor="skill-name" className="mb-1 block text-sm font-medium text-slate-700">
            Skill name
          </label>
          <input
            id="skill-name"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200/60"
            placeholder="e.g. JavaScript, Figma, Public speaking"
            value={form.skill_name}
            onChange={(e) => setForm({ ...form, skill_name: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="skill-level" className="mb-1 block text-sm font-medium text-slate-700">
            Proficiency level
          </label>
          <select
            id="skill-level"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200/60"
            value={form.skill_level}
            onChange={(e) => setForm({ ...form, skill_level: e.target.value })}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">Controls how full the bar looks on your portfolio (Beginner → Expert).</p>
        </div>
        
        {/* Quick Add Skills */}
        <div className="md:col-span-2 border-t border-slate-100 pt-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Add Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {CS_QUICK_SKILLS.map((skill) => {
              const alreadyAdded = items.some(
                (item) => item.skill_name.toLowerCase() === skill.toLowerCase()
              )
              return (
                <button
                  key={skill}
                  type="button"
                  disabled={alreadyAdded || saving || !profileId}
                  onClick={() => addQuickSkill(skill)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                    alreadyAdded
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-500 hover:text-white hover:border-sky-500 active:scale-95 shadow-sm'
                  }`}
                >
                  {alreadyAdded ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button type="submit" disabled={saving || !profileId} className="rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving…' : editId ? 'Update skill' : 'Add skill'}
          </button>
          {editId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              onClick={() => {
                setEditId(null)
                setForm({ skill_name: '', skill_level: 'Beginner' })
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-sm font-medium text-slate-900">
              {item.skill_name} <span className="font-normal text-slate-600">({item.skill_level})</span>
            </p>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                onClick={() => {
                  setEditId(item.id)
                  setForm({ skill_name: item.skill_name, skill_level: item.skill_level })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Edit
              </button>
              <button type="button" className="rounded-lg bg-red-500 px-3 py-1 text-white" onClick={() => setDeleteId(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <EmptyState title="No skills added" description="Add your first skill to build your portfolio." /> : null}
      </div>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete skill?"
        message="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteItem('skills', deleteId)
          await load()
          setDeleteId(null)
          toast.success('Deleted')
        }}
      />
    </SectionCard>
  )
}
