import { motion } from 'framer-motion'

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'sky',
  hint,
  compact = false,
  /** Same fixed height for hint row — use in a grid so all cards align (e.g. student dashboard). */
  uniformCompact = false,
  className = '',
}) {
  const accentStyles =
    accent === 'sky'
      ? 'from-sky-500/20 to-blue-600/20 text-sky-700'
      : accent === 'amber'
        ? 'from-amber-500/20 to-orange-600/20 text-amber-700'
        : 'from-emerald-500/20 to-teal-600/20 text-emerald-700'

  if (compact) {
    const showHintRow = Boolean(uniformCompact || hint)
    const hintBlock = showHintRow ? (
      <div
        className={`mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs ${uniformCompact ? 'min-h-[2.75rem] sm:min-h-[3rem]' : ''}`}
      >
        {hint ? (
          <p className="line-clamp-2">{hint}</p>
        ) : uniformCompact ? (
          <span className="block select-none opacity-0" aria-hidden>
            .
          </span>
        ) : null}
      </div>
    ) : null

    return (
      <motion.div
        whileHover={{ y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={`relative h-full w-full min-w-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 text-slate-900 shadow-sm ring-1 ring-slate-100/80 sm:p-4 ${className}`.trim()}
      >
        <div className="flex h-full items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium leading-snug text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-2xl">{value}</p>
            {hintBlock}
          </div>
          {Icon ? (
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br sm:h-10 sm:w-10 sm:rounded-xl ${accentStyles}`}
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </div>
          ) : null}
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-sky-400/10 to-blue-700/5 blur-2xl" />
      </motion.div>
    )
  }

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
