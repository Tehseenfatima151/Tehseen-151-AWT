import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { createItem, deleteItem, listByUser, updateItem } from '../../services/studentService'
import { uploadFile } from '../../services/uploadService'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { fieldInputClass } from '../../utils/formFieldClasses'

const emptyForm = { title: '', description: '', tech_used: '', github_link: '', cover_image: '' }

export default function StudentProjectsPage() {
  const { profile } = useAuth()
  const profileId = profile?.id
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverBlobPreview, setCoverBlobPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!coverFile) {
      setCoverBlobPreview(null)
      return
    }
    const u = URL.createObjectURL(coverFile)
    setCoverBlobPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [coverFile])

  const load = useCallback(async () => {
    const { data } = await listByUser('projects', profileId)
    setItems(data ?? [])
  }, [profileId])

  useEffect(() => {
    if (profileId) load()
  }, [profileId, load])

  const submit = async (e) => {
    e.preventDefault()
    if (!profileId) return
    setSaving(true)
    try {
      let coverUrl = form.cover_image || null
      if (coverFile) {
        coverUrl = await uploadFile('project-images', profileId, coverFile)
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        tech_used: form.tech_used.trim() || null,
        github_link: form.github_link.trim() || null,
        cover_image: coverUrl,
        user_id: profileId,
      }
      if (!payload.title) {
        toast.error('Title is required')
        return
      }
      const res = editId ? await updateItem('projects', editId, payload) : await createItem('projects', payload)
      if (res.error) {
        toast.error(res.error.message)
        return
      }
      setForm(emptyForm)
      setEditId(null)
      setCoverFile(null)
      await load()
      toast.success(editId ? 'Project updated' : 'Project added')
    } catch (err) {
      toast.error(err.message ?? 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item) => {
    setEditId(item.id)
    setForm({
      title: item.title ?? '',
      description: item.description ?? '',
      tech_used: item.tech_used ?? '',
      github_link: item.github_link ?? '',
      cover_image: item.cover_image ?? '',
    })
    setCoverFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <SectionCard title="Projects">
      <form className="mb-6 grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2">
          <label htmlFor="proj-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="proj-title"
            className={fieldInputClass}
            placeholder="Project name"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="proj-tech" className="mb-1 block text-sm font-medium text-slate-700">
            Tech used
          </label>
          <input
            id="proj-tech"
            className={fieldInputClass}
            placeholder="e.g. React, Supabase"
            value={form.tech_used}
            onChange={(e) => setForm({ ...form, tech_used: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="proj-github" className="mb-1 block text-sm font-medium text-slate-700">
            GitHub / demo link
          </label>
          <input
            id="proj-github"
            className={fieldInputClass}
            placeholder="https://…"
            value={form.github_link}
            onChange={(e) => setForm({ ...form, github_link: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="proj-desc" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="proj-desc"
            className={fieldInputClass}
            placeholder="What you built and the impact"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="proj-cover" className="mb-1 block text-sm font-medium text-slate-700">
            Project cover image
          </label>
          <input
            id="proj-cover"
            key={editId ?? 'new'}
            type="file"
            accept="image/*"
            className={fieldInputClass}
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-slate-500">Shown on your portfolio as a visual preview. Optional but recommended.</p>
          {(form.cover_image || coverBlobPreview) && (
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <img
                src={coverBlobPreview || form.cover_image}
                alt=""
                className="h-28 max-w-full rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={() => {
                  setCoverFile(null)
                  setForm((f) => ({ ...f, cover_image: '' }))
                }}
              >
                Remove image
              </button>
            </div>
          )}
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving…' : editId ? 'Update project' : 'Add project'}
          </button>
          {editId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              onClick={() => {
                setEditId(null)
                setForm(emptyForm)
                setCoverFile(null)
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap gap-3 rounded-xl border border-slate-200 p-3">
            {item.cover_image ? (
              <img src={item.cover_image} alt="" className="h-24 w-36 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">No image</div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
              <p className="mt-1 text-xs text-slate-500">{item.tech_used}</p>
              <div className="mt-2 flex gap-2 text-sm">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                  onClick={() => startEdit(item)}
                >
                  Edit
                </button>
                <button type="button" className="rounded-lg bg-red-500 px-3 py-1 text-white" onClick={() => setDeleteId(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 ? <EmptyState title="No projects added" description="Add projects with a cover image so your portfolio looks professional." /> : null}
      </div>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete project?"
        message="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteItem('projects', deleteId)
          await load()
          setDeleteId(null)
          toast.success('Deleted')
        }}
      />
    </SectionCard>
  )
}
