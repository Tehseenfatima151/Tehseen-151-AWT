import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { createItem, deleteItem, listByUser, updateItem } from '../../services/studentService'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { fieldInputClass } from '../../utils/formFieldClasses'

const emptyForm = {
  title: '',
  description: '',
  offering_tags: '',
  availability: '',
}

export default function StudentServicesPage() {
  const { profile, session } = useAuth()
  const userId = profile?.id ?? session?.user?.id
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await listByUser('services', userId)
    setItems(data ?? [])
  }, [userId])

  useEffect(() => {
    if (userId) load()
  }, [userId, load])

  const submit = async (e) => {
    e.preventDefault()
    if (!userId) return toast.error('Please wait, account is still loading')
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      offering_tags: form.offering_tags.trim() || null,
      availability: form.availability.trim() || null,
      user_id: userId,
    }
    if (!payload.title) return toast.error('Title is required')
    setSaving(true)
    try {
      const res = editId ? await updateItem('services', editId, payload) : await createItem('services', payload)
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

      setForm(emptyForm)
      setEditId(null)
      toast.success(editId ? 'Service updated' : 'Service added')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="Services">
      <form className="mb-6 grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2">
          <label htmlFor="svc-title" className="mb-1 block text-sm font-medium text-slate-700">
            Service title
          </label>
          <input
            id="svc-title"
            className={fieldInputClass}
            placeholder="e.g. AI UI/UX Design & Prototyping"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="svc-desc" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="svc-desc"
            className={fieldInputClass}
            placeholder="Explain what you deliver, your process, and the value clients get."
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="svc-tags" className="mb-1 block text-sm font-medium text-slate-700">
            What you offer (tags)
          </label>
          <input
            id="svc-tags"
            className={fieldInputClass}
            placeholder="e.g. Wireframes, Figma, Design systems, Mobile apps"
            value={form.offering_tags}
            onChange={(e) => setForm({ ...form, offering_tags: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="svc-avail" className="mb-1 block text-sm font-medium text-slate-700">
            Availability &amp; delivery
          </label>
          <input
            id="svc-avail"
            className={fieldInputClass}
            placeholder="e.g. Remote · Weekends · Freelance · Worldwide"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || !userId}
            className="rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : editId ? 'Update service' : 'Add service'}
          </button>
          {editId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"
              onClick={() => {
                setEditId(null)
                setForm(emptyForm)
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            {item.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.description}</p> : null}
            {item.offering_tags ? (
              <p className="mt-2 text-xs text-slate-700">
                <span className="font-medium text-slate-600">Offers: </span>
                {item.offering_tags}
              </p>
            ) : null}
            {item.availability ? (
              <p className="mt-1 text-xs text-slate-700">
                <span className="font-medium text-slate-600">Availability: </span>
                {item.availability}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2 text-sm">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                onClick={() => {
                  setEditId(item.id)
                  setForm({
                    title: item.title ?? '',
                    description: item.description ?? '',
                    offering_tags: item.offering_tags ?? '',
                    availability: item.availability ?? '',
                  })
                }}
              >
                Edit
              </button>
              <button type="button" className="rounded-lg bg-red-500 px-3 py-1.5 text-white" onClick={() => setDeleteId(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <EmptyState title="No services yet" description="Add professional offerings visitors can hire you for." /> : null}
      </div>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this service?"
        message="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteItem('services', deleteId)
          await load()
          setDeleteId(null)
          toast.success('Deleted')
        }}
      />
    </SectionCard>
  )
}
