export function StatCardsSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5"
        />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="h-72 animate-pulse rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5" />
  )
}

export function ListRowSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200/80 dark:bg-white/10" />
      ))}
    </div>
  )
}
