import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react'
import SiteBackground from '../components/layout/SiteBackground'

const team = [
  {
    id: 'super-admin',
    name: 'Muhammad Abdullah',
    role: 'Academic lead & program mentor',
    bio: 'Portfolios & mentorship at COMSATS.',
    image: '/team/sir.jpeg',
    externalUrl: 'https://muhammadabdullahwali.vercel.app/',
  },
  {
    id: 'lead-dev',
    name: 'Tehseen Fatima',
    role: 'Lead developer',
    bio: 'Engineering & UX for SkillSphere.',
    image: '/team/tehseen.jpeg',
    externalUrl: null,
  },
]

const portalCard =
  'group relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/50 p-6 shadow-lg shadow-black/40 ring-0 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-slate-900/55 hover:shadow-xl hover:shadow-black/50 hover:ring-1 hover:ring-white/[0.06]'

const portalCtaClass =
  'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-sm font-medium tracking-tight text-slate-200 transition-colors duration-200 hover:border-white/[0.22] hover:bg-white/[0.09] hover:text-white'

export default function LandingPage() {
  return (
    <SiteBackground>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-12 md:px-6 md:pt-16">
        {/* Hero — clean, no box card */}
        <motion.header
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-200/90">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" aria-hidden />
            COMSATS University Islamabad
          </span>
          <h1 className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl md:leading-[1.05]">
            <span className="text-white">CUI </span>
            <span className="bg-gradient-to-r from-sky-300 via-white to-sky-200 bg-clip-text text-transparent">
              SkillSphere
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-slate-400 md:text-base md:whitespace-nowrap md:text-slate-300">
            Build, manage &amp; showcase your portfolio — one hub for COMSATS students.
          </p>
          <div className="mt-8">
            <img
              src="/team/comsats-logo.jpeg"
              alt="COMSATS logo"
              className="h-[5.25rem] w-[5.25rem] rounded-full object-cover shadow-lg shadow-sky-900/35 ring-2 ring-white/25 md:h-28 md:w-28"
              onError={(e) => {
                e.currentTarget.src =
                  'https://ui-avatars.com/api/?name=CUI&size=220&background=0f172a&color=fff&bold=true'
              }}
            />
          </div>
        </motion.header>

        {/* Portals — centered, fixed width, not stretched */}
        <motion.section
          className="mx-auto mt-20 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Choose your portal</h2>
            <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-slate-400 md:text-base md:whitespace-nowrap">
              Secure sign-in — pick the portal that matches your role, student or administrator.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-10">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={portalCard}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-colors duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.07] group-hover:text-slate-100">
                <UserCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">Student portal</h3>
              <p className="mt-2 flex-1 text-[13px] leading-snug text-slate-400/90 md:text-sm md:whitespace-nowrap">
                Skills, projects, services &amp; certificates — your portfolio in one workspace.
              </p>
              <Link to="/student/login" className={portalCtaClass}>
                Sign in as student <ArrowRight className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={portalCard}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-colors duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.07] group-hover:text-slate-100">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">Admin portal</h3>
              <p className="mt-2 flex-1 text-[13px] leading-snug text-slate-400/90 md:text-sm md:whitespace-nowrap">
                Portfolio review, moderation, feedback, ratings &amp; student insights.
              </p>
              <Link to="/admin/login" className={portalCtaClass}>
                Sign in as admin <ArrowRight className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Team */}
        <motion.section
          className="mx-auto mt-24 max-w-3xl border-t border-white/10 pt-16 md:pt-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Meet the team
            </h2>
            <p className="mt-4 text-sm font-medium text-slate-400 md:text-base md:whitespace-nowrap">
              <span className="text-sky-300">SkillSphere</span> team — academic direction to product engineering.
            </p>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-6 min-[520px]:grid-cols-2 min-[520px]:gap-6 md:gap-10">
            {team.map((member, i) => (
              <motion.article
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.08 }}
                className="group flex h-full min-h-[360px] w-full min-w-0 flex-col rounded-2xl border border-white/10 bg-white text-center shadow-xl shadow-sky-900/15"
              >
                <div className="flex justify-center px-5 pt-6">
                  <div className="h-[7.5rem] w-[7.5rem] overflow-hidden rounded-full bg-slate-200 ring-2 ring-slate-200/90 shadow-md">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=0f172a&color=fff&bold=true`
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col px-5 pb-6 pt-4">
                  <h3 className="text-lg font-bold leading-snug text-slate-900">{member.name}</h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-sky-700">
                    {member.role}
                  </p>
                  <p className="mt-3 whitespace-nowrap text-xs leading-snug text-slate-600 md:text-sm">{member.bio}</p>
                  <div className="mt-auto flex flex-col gap-2 pt-5">
                    <Link
                      to={`/portfolio/${member.id}`}
                      className="inline-flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Portfolio <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                    {member.externalUrl ? (
                      <a
                        href={member.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
                      >
                        Live site <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Add your live site URL in LandingPage when ready"
                        className="inline-flex w-full min-h-[40px] cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"
                      >
                        Live site <ExternalLink className="h-4 w-4 shrink-0 text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </div>
    </SiteBackground>
  )
}
