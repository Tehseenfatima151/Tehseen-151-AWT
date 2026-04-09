import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import SectionCard from '../../components/common/SectionCard'
import { createStudentAccount, deleteStudent, listStudents } from '../../services/adminService'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { fieldInputClass } from '../../utils/formFieldClasses'

const emptyForm = { email: '', password: '', name: '', department: '', semester: '' }

export default function AdminStudentsPage() {
  const [form, setForm] = useState(emptyForm)
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    const { data } = await listStudents()
    setStudents(data ?? [])
  }
  useEffect(() => {
    load()
  }, [])

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    const s = semesterFilter.trim().toLowerCase()
    return students.filter((item) => {
      const matchesQuery = !q || item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q)
      const matchesSemester = !s || String(item.semester ?? '').toLowerCase().includes(s)
      return matchesQuery && matchesSemester
    })
  }, [students, query, semesterFilter])

  const hasActiveFilters = query.trim() !== '' || semesterFilter.trim() !== ''

  const submit = async (e) => {
    e.preventDefault()
    try {
      await createStudentAccount(form)
      toast.success('Student account created')
      setForm(emptyForm)
      await load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <SectionCard title="Student Management">
      <form className="mb-5 grid gap-3 md:grid-cols-3" onSubmit={submit}>
        <input className={fieldInputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className={fieldInputClass} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className={fieldInputClass} placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <input className={fieldInputClass} placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <input className={fieldInputClass} placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">Create Student</button>
      </form>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <input className={fieldInputClass} placeholder="Search by name/email" value={query} onChange={(e) => setQuery(e.target.value)} />
          <input className={fieldInputClass} placeholder="Filter by semester" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} />
        </div>
        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={() => {
            setQuery('')
            setSemesterFilter('')
            toast.success('Filters cleared')
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear filters
        </button>
      </div>
      {hasActiveFilters ? (
        <p className="mb-2 text-xs text-slate-500">
          Showing {filteredStudents.length} of {students.length} students
        </p>
      ) : null}

      <div className="space-y-2">
        {filteredStudents.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-slate-600">{item.email}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/students/${item.id}`} className="rounded bg-sky-600 px-3 py-1 text-white">
                View Portfolio
              </Link>
              <button className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => setDeleteId(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && students.length > 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-600">No students match these filters. Try clearing filters.</p>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete student account?"
        message="This permanently removes student profile and authentication account."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteStudent(deleteId)
          await load()
          setDeleteId(null)
          toast.success('Student deleted')
        }}
      />
    </SectionCard>
  )
}
