import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import SectionCard from '../../components/common/SectionCard'
import { listModerationData } from '../../services/adminService'
import { deleteItem } from '../../services/studentService'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const MOD_TABLES = ['skills', 'projects', 'certificates', 'services']

export default function AdminModerationPage() {
  const location = useLocation()
  const [table, setTable] = useState(
    () => (MOD_TABLES.includes(location.state?.moderationTab) ? location.state.moderationTab : 'skills'),
  )
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    const { data } = await listModerationData(table)
    setItems(data ?? [])
  }, [table])

  useEffect(() => {
    if (location.pathname !== '/admin/moderation') return
    const tab = location.state?.moderationTab
    if (tab && MOD_TABLES.includes(tab)) setTable(tab)
    else if (location.state == null || !('moderationTab' in (location.state ?? {}))) setTable('skills')
  }, [location.pathname, location.key, location.state])

  useEffect(() => {
    load()
  }, [load])

  return (
    <SectionCard title="Content Moderation">
      <div className="mb-4 flex gap-2">
        {['skills', 'projects', 'certificates', 'services'].map((item) => (
          <button
            key={item}
            className={`rounded-lg px-3 py-2 text-sm ${table === item ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}
            onClick={() => setTable(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <EmptyState title="No content found" description="Nothing to moderate in this section yet." /> : items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-semibold">{item.skill_name ?? item.title ?? item.certificate_name}</p>
              <p className="text-xs text-slate-500">By: {item.users?.name} ({item.users?.email})</p>
            </div>
            <button
              className="rounded bg-red-500 px-3 py-1 text-sm text-white"
              onClick={() => setSelected(item)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(selected)}
        title="Delete content?"
        message="This will permanently remove this content item."
        onCancel={() => setSelected(null)}
        onConfirm={async () => {
          if (!selected) return
          await deleteItem(table, selected.id)
          await load()
          setSelected(null)
          toast.success('Content removed')
        }}
      />
    </SectionCard>
  )
}
