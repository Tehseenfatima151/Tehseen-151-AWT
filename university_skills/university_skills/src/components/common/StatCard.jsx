import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon: Icon, accent = 'sky', hint }) {
  const accentStyles =
    accent === 'sky'
      ? 'from-sky-500/20 to-blue-600/20 text-sky-700'
      : accent === 'amber'
        ? 'from-amber-500/20 to-orange-600/20 text-amber-700'
        : 'from-emerald-500/20 to-teal-600/20 text-emerald-700'

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl shadow-sky-900/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1.5 text-xs leading-snug text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentStyles}`}>
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-sky-400/15 to-blue-700/10 blur-2xl" />
    </motion.div>
  )
}
