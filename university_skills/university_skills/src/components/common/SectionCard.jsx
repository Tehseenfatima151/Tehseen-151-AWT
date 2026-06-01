const onLightCard =
  'text-slate-900 [color-scheme:light] [&_input]:text-slate-900 [&_input]:placeholder:text-slate-400 [&_select]:text-slate-900 [&_textarea]:text-slate-900 [&_textarea]:placeholder:text-slate-400 [&_option]:bg-white [&_option]:text-slate-900'

export default function SectionCard({ title, children, action, ...props }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 ${onLightCard}`} {...props}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1.5 text-xl font-bold text-sky-900 ring-1 ring-sky-100">
          <span className="h-5 w-1 rounded-full bg-sky-600" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
