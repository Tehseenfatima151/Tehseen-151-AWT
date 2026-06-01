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
      ? 'from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
      : accent === 'amber'
        ? 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
        : accent === 'emerald'
          ? 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'

  const shadowStyles =
    accent === 'sky'
      ? 'hover:shadow-[0_20px_40px_rgba(14,165,233,0.15)]'
      : accent === 'amber'
        ? 'hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)]'
        : accent === 'emerald'
          ? 'hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]'
          : 'hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]'

  const glowColor =
    accent === 'sky' ? 'from-sky-400 to-blue-600' :
    accent === 'amber' ? 'from-amber-400 to-orange-600' :
    accent === 'emerald' ? 'from-emerald-400 to-teal-600' :
    'from-indigo-400 to-purple-600'

  if (compact) {
    const showHintRow = Boolean(uniformCompact || hint)

    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className={`relative h-full w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white shadow-lg backdrop-blur-md transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent ${shadowStyles} ${className}`.trim()}
      >
        {/* Decorative glow blob — z-0 so it never covers icon */}
        <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl opacity-15 z-0 ${glowColor}`} />

        {/* Content layer — z-10 ensures icon is always on top of glow */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Top half — icon pinned to top-right */}
          <div className="flex items-start justify-between gap-2 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 leading-tight break-words min-w-0 flex-1">
              {label}
            </span>
            {Icon ? (
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br border ${accentStyles}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
            ) : null}
          </div>

          {/* Bottom half — value + hint */}
          <div className="mt-4">
            <p className="text-3xl font-extrabold tabular-nums tracking-tight text-white leading-none truncate">
              {value}
            </p>
            {showHintRow && (
              <div className="mt-1.5 text-[11px] leading-snug text-slate-400 min-h-[16px]">
                {hint ? (
                  <p className="line-clamp-1">{hint}</p>
                ) : (
                  <span className="block select-none opacity-0" aria-hidden>.</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-white shadow-xl backdrop-blur-md before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent ${shadowStyles} ${className}`.trim()}
    >
      {/* Decorative glow blob — z-0 */}
      <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl opacity-20 z-0 ${glowColor}`} />

      {/* Content layer — z-10 */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-white">{value}</p>
          {hint ? <p className="mt-2 text-xs leading-snug text-slate-400">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br border ${accentStyles}`}>
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
