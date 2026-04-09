export default function SiteBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen bg-[#030712] text-white ${className}`.trim()}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-[420px] w-[420px] rounded-full bg-blue-600/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-px w-[min(90%,720px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      {children}
    </div>
  )
}
