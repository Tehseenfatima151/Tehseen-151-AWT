import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel, loading = false }) {
  if (typeof document === 'undefined') return null

  const confirmStyles =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : 'bg-sky-600 hover:bg-sky-500 text-white'

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 shadow-2xl shadow-sky-900/50"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-sky-100/85">{message}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-white/10 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition disabled:opacity-50 ${confirmStyles}`}
              >
                {loading ? 'Please wait…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
