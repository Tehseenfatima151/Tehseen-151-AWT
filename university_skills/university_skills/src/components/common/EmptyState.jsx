import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 px-6 py-14 text-center dark:border-white/10 dark:bg-white/5"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-700 dark:text-sky-300">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-sky-100/70">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  )
}
