import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminNav, studentNav } from '../../utils/portalConfig'
import SiteBackground from './SiteBackground'

const linkStyles = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-sky-500/20 font-medium text-sky-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

export default function DashboardLayout({ portal }) {
  const [open, setOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const nav = portal === 'admin' ? adminNav : studentNav

  return (
    <SiteBackground>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-white">COMSATS Skill Portfolio</h1>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/10 bg-slate-950/70 p-5 text-white backdrop-blur-xl transition-transform md:static md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <h2 className="mb-6 text-xl font-bold text-sky-300">{portal === 'admin' ? 'Admin Portal' : 'Student Portal'}</h2>
          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === `/${portal}`} className={linkStyles} onClick={() => setOpen(false)}>
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-400">
            <p className="text-slate-200">{profile?.name}</p>
            <p>{profile?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </aside>
        <main className="relative z-0 w-full flex-1 p-4 text-slate-300 md:p-6">
          <Outlet />
        </main>
      </div>
    </SiteBackground>
  )
}
