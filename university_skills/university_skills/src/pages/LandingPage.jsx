import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, ExternalLink, ShieldCheck, Sparkles, UserCircle2,
  BookOpen, Briefcase, Star, LayoutDashboard, Users, Award
} from 'lucide-react'
import SiteBackground from '../components/layout/SiteBackground'
import CuiSkillSphereTitle from '../components/landing/CuiSkillSphereTitle'

const team = [
  {
    id: 'super-admin',
    name: 'Muhammad Abdullah',
    role: 'Academic lead & program mentor',
    bio: 'Innovation & Mentorship at COMSATS',
    image: '/team/sir.jpeg',
    externalUrl: 'https://muhammadabdullahwali.vercel.app/',
  },
  {
    id: 'lead-dev',
    name: 'Tehseen Fatima',
    role: 'Lead developer',
    bio: 'Design & Development for SkillSphere.',
    image: '/team/tehseen.jpeg',
    externalUrl: 'https://sites.google.com/view/tehseens-portfolio/home',
  },
]

const studentFeatures = [
  { icon: BookOpen, label: 'Skills & Projects' },
  { icon: Award, label: 'Certificates' },
  { icon: Briefcase, label: 'Opportunities' },
  { icon: Star, label: 'Public Portfolio' },
]

const adminFeatures = [
  { icon: Users, label: 'Talent Discovery' },
  { icon: LayoutDashboard, label: 'Dashboard Stats' },
  { icon: Briefcase, label: 'Post Opportunities' },
  { icon: ShieldCheck, label: 'Review & Moderate' },
]

export default function LandingPage() {
  return (
    <SiteBackground>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-0 pt-12 md:px-6 md:pt-16">

        {/* Hero */}
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
          <div className="mt-8">
            <CuiSkillSphereTitle />
          </div>
          <div className="mx-auto mt-6 w-full max-w-3xl md:mt-7">
            <p className="rounded-2xl border border-sky-400/15 bg-gradient-to-b from-sky-500/[0.07] to-white/[0.02] px-6 py-4 text-center text-base leading-relaxed shadow-[0_0_40px_-12px_rgba(56,189,248,0.25)] ring-1 ring-white/[0.04] backdrop-blur-sm md:text-lg">
              <span className="font-medium text-slate-100">Build, manage & showcase your portfolio</span>
              <span className="text-slate-500"> — </span>
              <span className="text-slate-300">
                one hub for{' '}
                <span className="font-semibold text-sky-100">COMSATS</span> students & talent discovery.
              </span>
            </p>
          </div>
          <div className="mt-8">
            <img
              src="/team/comsats-logo.jpeg"
              alt="COMSATS logo"
              className="h-[6.5rem] w-[6.5rem] rounded-full object-cover shadow-lg shadow-sky-900/35 ring-2 ring-white/25 md:h-32 md:w-32 lg:h-36 lg:w-36"
              onError={(e) => {
                e.currentTarget.src =
                  'https://ui-avatars.com/api/?name=CUI&size=220&background=0f172a&color=fff&bold=true'
              }}
            />
          </div>
        </motion.header>

        {/* Portal Cards — redesigned */}
        <motion.section
          className="mx-auto mt-20 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Choose your portal</h2>
            <p className="mt-2 text-sm text-slate-400">Select the portal that matches your role to get started.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Student Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 p-6 shadow-xl shadow-sky-950/40 backdrop-blur-md"
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl transition-all duration-500 group-hover:bg-sky-400/20" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

              {/* Icon badge */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-400/20 transition-all duration-300 group-hover:bg-sky-500/20 group-hover:ring-sky-400/40">
                <UserCircle2 className="h-6 w-6" />
              </div>

              {/* Title + subtitle */}
              <h3 className="text-xl font-bold tracking-tight text-white">Student Portal</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Build your professional portfolio, apply for real-world opportunities, and showcase your skills to potential employers — all in one workspace.
              </p>

              {/* Feature pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {studentFeatures.map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/student/login"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-400 hover:shadow-sky-400/30 group-hover:gap-3"
              >
                Sign in as Student <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Admin Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-6 shadow-xl shadow-indigo-950/40 backdrop-blur-md"
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-400/20" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

              {/* Icon badge */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-400/20 transition-all duration-300 group-hover:bg-indigo-500/20 group-hover:ring-indigo-400/40">
                <ShieldCheck className="h-6 w-6" />
              </div>

              {/* Title + subtitle */}
              <h3 className="text-xl font-bold tracking-tight text-white">Admin Portal</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Discover top talent, post job & internship opportunities, review applications, manage portfolios, and track student performance.
              </p>

              {/* Feature pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {adminFeatures.map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/admin/login"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-400/30 group-hover:gap-3"
              >
                Sign in as Admin <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Our Expert Team</h2>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-6 min-[520px]:grid-cols-2 md:gap-10">
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
                  <p className="mt-3 text-xs leading-snug text-slate-600 md:text-sm">{member.bio}</p>
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

        {/* Footer */}
        <footer className="mt-20 border-t border-white/[0.07] py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-semibold text-white tracking-tight">CUI SkillSphere</span>
            </div>
            <p className="max-w-sm text-xs text-slate-500 leading-relaxed">
              Talent Discovery & Portfolio Platform for COMSATS University Islamabad.
              Built with React, Supabase &amp; Tailwind CSS.
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
              <span>© {new Date().getFullYear()} COMSATS University Islamabad</span>
              <span>·</span>
              <a
                href="https://uni-skillsphere.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-500 hover:text-sky-400 transition-colors"
              >
                Live Demo
              </a>
            </div>
          </div>
        </footer>

      </div>
    </SiteBackground>
  )
}
