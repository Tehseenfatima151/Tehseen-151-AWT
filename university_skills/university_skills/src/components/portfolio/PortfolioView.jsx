import { motion } from 'framer-motion'
import { Briefcase, ExternalLink, Globe, Link2 } from 'lucide-react'
import EmptyState from '../common/EmptyState'

const levelMap = { Beginner: 35, Intermediate: 65, Advanced: 80, Expert: 90 }

export default function PortfolioView({ data }) {
  const user = data?.user ?? {}
  const skills = data?.skills ?? []
  const projects = data?.projects ?? []
  const services = data?.services ?? []
  const certificates = data?.certificates ?? []
  const education = data?.education ?? []
  const experience = data?.experience ?? []

  return (
    <div className="space-y-5 text-slate-900">
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 shadow-2xl shadow-sky-950/40 ring-1 ring-white/10">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-sky-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-4">
          <motion.div
            className="shrink-0 rounded-2xl ring-2 ring-sky-400/35 shadow-lg shadow-sky-900/50"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.04, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img
              src={
                user.profile_picture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Portfolio')}&background=0f172a&color=f0f9ff&bold=true`
              }
              alt={user.name ?? 'Profile'}
              className="h-20 w-20 rounded-2xl object-cover md:h-24 md:w-24"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(56, 189, 248, 0.35)',
                  '0 0 28px 4px rgba(125, 211, 252, 0.25)',
                  '0 0 0 0 rgba(56, 189, 248, 0.35)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">Portfolio</p>
            <h1 className="mt-1 bg-gradient-to-r from-white via-sky-100 to-slate-200 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
              {user.name ?? 'Student Portfolio'}
            </h1>
            {user.professional_title ? (
              <p className="mt-1 text-sm font-semibold text-sky-200">{user.professional_title}</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-slate-300/95">
              {user.bio ? `${user.bio.slice(0, 160)}${user.bio.length > 160 ? '…' : ''}` : 'Future-ready portfolio with real academic and project achievements.'}
            </p>
            {(user.department || user.semester) && (
              <p className="mt-2 text-xs text-sky-200/70">
                {[user.department, user.semester && user.semester !== '-' && `Semester ${user.semester}`].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
        <h2 className="text-lg font-bold text-slate-900">About Me</h2>
        <p className="mt-2 text-sm text-slate-600">{user.bio ?? 'No bio provided yet.'}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {user.phone ? (
            <>
              <dt className="font-medium text-slate-500">Phone</dt>
              <dd className="text-slate-800">{user.phone}</dd>
            </>
          ) : null}
          {user.email ? (
            <>
              <dt className="font-medium text-slate-500">Email</dt>
              <dd className="text-slate-800">{user.email}</dd>
            </>
          ) : null}
          {user.address ? (
            <>
              <dt className="font-medium text-slate-500">Address</dt>
              <dd className="text-slate-800 sm:col-span-1">{user.address}</dd>
            </>
          ) : null}
          {user.dob ? (
            <>
              <dt className="font-medium text-slate-500">Date of birth</dt>
              <dd className="text-slate-800">{String(user.dob).slice(0, 10)}</dd>
            </>
          ) : null}
          {user.nationality ? (
            <>
              <dt className="font-medium text-slate-500">Nationality</dt>
              <dd className="text-slate-800">{user.nationality}</dd>
            </>
          ) : null}
          {user.languages ? (
            <>
              <dt className="font-medium text-slate-500">Languages</dt>
              <dd className="text-slate-800">{user.languages}</dd>
            </>
          ) : null}
        </dl>
      </section>

      {!data?.hideEducation ? (
        <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
          <h2 className="text-lg font-bold text-slate-900">Education</h2>
          <div className="mt-3 space-y-3">
            {education.length === 0 ? (
              <EmptyState title="No education added" description="Education details will appear here." />
            ) : (
              education.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-900">{item.degree}</p>
                  <p className="text-sm text-slate-600">{item.university}</p>
                  <p className="text-xs text-slate-500">{item.year}</p>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
        <h2 className="text-lg font-bold text-slate-900">Skills</h2>
        <div className="mt-4 space-y-3">
          {skills.length === 0 ? (
            <EmptyState title="No skills yet" description="Skills with progress bars will appear here." />
          ) : (
            skills.map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{item.skill_name}</span>
                  <span className="text-slate-500">{item.skill_level}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${levelMap[item.skill_level] ?? 55}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10 ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900">Services</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">What you offer, how you work, and when you&apos;re available.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {services.length === 0 ? (
            <EmptyState title="No services listed" description="Add services from your student portal to showcase professional offerings." />
          ) : (
            services.map((item) => (
              <motion.article
                key={item.id}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-md shadow-sky-900/5 transition-shadow hover:shadow-lg hover:shadow-sky-900/10"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
                <h3 className="pr-8 text-base font-bold text-slate-900">{item.title}</h3>
                {item.description ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{item.description}</p> : null}
                {item.offering_tags ? (
                  <p className="mt-3 text-xs font-medium text-sky-900/90">
                    <span className="text-slate-500">Offers: </span>
                    {item.offering_tags}
                  </p>
                ) : null}
                {item.availability ? (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-100">
                    <span className="font-semibold text-slate-600">Availability: </span>
                    {item.availability}
                  </p>
                ) : null}
              </motion.article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
        <h2 className="text-lg font-bold text-slate-900">Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {projects.length === 0 ? (
            <EmptyState title="No projects yet" description="Projects will appear in card format." />
          ) : (
            projects.map((item) => (
              <motion.article
                key={item.id}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {item.cover_image ? (
                    <img src={item.cover_image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-slate-400">No cover image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600">{item.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.tech_used}</p>
                  {item.github_link ? (
                    <a
                      href={item.github_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                    >
                      <Link2 className="h-4 w-4" /> View link
                    </a>
                  ) : null}
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
        <h2 className="text-lg font-bold text-slate-900">Certificates</h2>
        <div className="mt-3 space-y-2">
          {certificates.length === 0 ? (
            <EmptyState title="No certificates yet" description="Certificates with preview/download links will appear here." />
          ) : (
            certificates.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.certificate_name}</p>
                  <p className="text-xs text-slate-500">{item.issue_date}</p>
                </div>
                <a href={item.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                </a>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
        <h2 className="text-lg font-bold text-slate-900">Experience</h2>
        <div className="mt-3 space-y-3">
          {experience.length === 0 ? (
            <EmptyState title="No experience added" description="Experience entries will appear here." />
          ) : (
            experience.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{item.role}</p>
                <p className="text-sm text-slate-600">{item.company}</p>
                <p className="text-xs text-slate-500">{item.duration}</p>
                {item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl shadow-sky-900/10">
        <h2 className="text-lg font-bold text-slate-900">Social & web</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { url: user.portfolio_url, label: 'Portfolio' },
            { url: user.github_url, label: 'GitHub' },
            { url: user.linkedin_url, label: 'LinkedIn' },
            { url: user.twitter_url, label: 'Twitter / X' },
            { url: user.instagram_url, label: 'Instagram' },
            { url: user.facebook_url, label: 'Facebook' },
            { url: user.website_url, label: 'Website' },
          ]
            .filter((l) => l.url)
            .map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                <Globe className="h-4 w-4" /> {l.label}
              </a>
            ))}
          {!user.portfolio_url &&
          !user.github_url &&
          !user.linkedin_url &&
          !user.twitter_url &&
          !user.instagram_url &&
          !user.facebook_url &&
          !user.website_url ? (
            <p className="text-sm text-slate-500">No social links added yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

