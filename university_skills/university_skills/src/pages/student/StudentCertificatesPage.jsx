import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SectionCard from '../../components/common/SectionCard'
import { useAuth } from '../../context/AuthContext'
import { createItem, deleteItem, listByUser } from '../../services/studentService'
import { uploadFile } from '../../services/uploadService'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { fieldInputClass } from '../../utils/formFieldClasses'

export default function StudentCertificatesPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    const { data } = await listByUser('certificates', profile.id)
    setItems(data ?? [])
  }, [profile?.id])
  useEffect(() => {
    if (profile?.id) load()
  }, [profile?.id, load])

  const submit = async (e) => {
    e.preventDefault()
    if (!profile?.id) return toast.error('Please wait, profile is still loading')
    if (!file) return toast.error('Please upload file')
    setLoading(true)
    try {
      const fileUrl = await uploadFile('certificates', profile.id, file)
      const { error } = await createItem('certificates', {
        user_id: profile.id,
        certificate_name: name.trim(),
        issue_date: issueDate || null,
        file_url: fileUrl,
      })
      if (error) throw error
      setName('')
      setIssueDate('')
      setFile(null)
      await load()
      toast.success('Certificate uploaded')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard title="Certificates">
      <form className="mb-6 grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <div>
          <label htmlFor="cert-name" className="mb-1 block text-sm font-medium text-slate-700">
            Certificate name
          </label>
          <input
            id="cert-name"
            className={fieldInputClass}
            placeholder="e.g. React Developer Certificate"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cert-date" className="mb-1 block text-sm font-medium text-slate-700">
            Issue date
          </label>
          <input
            id="cert-date"
            type="date"
            className={fieldInputClass}
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            title="When the certificate was issued"
          />
          <p className="mt-1 text-xs text-slate-500">Optional. Leave blank if you don&apos;t know the exact date.</p>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="cert-file" className="mb-1 block text-sm font-medium text-slate-700">
            File (PDF or image)
          </label>
          <input
            id="cert-file"
            key={file?.name ?? 'empty'}
            type="file"
            accept=".pdf,image/*"
            className={fieldInputClass}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-60">
            {loading ? 'Uploading…' : 'Upload certificate'}
          </button>
        </div>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
            <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
              {item.certificate_name}
            </a>
            <button type="button" className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => setDeleteId(item.id)}>
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 ? <EmptyState title="No certificates uploaded" description="Upload a certificate to display achievements." /> : null}
      </div>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete certificate?"
        message="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteItem('certificates', deleteId)
          await load()
          setDeleteId(null)
          toast.success('Deleted')
        }}
      />
    </SectionCard>
  )
}
