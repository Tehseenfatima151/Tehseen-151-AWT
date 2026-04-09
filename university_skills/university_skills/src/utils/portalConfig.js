import { Award, Briefcase, FolderKanban, GraduationCap, LayoutDashboard, MessageSquare, Shield, Trophy, UserCircle } from 'lucide-react'

export const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
  { to: '/student/skills', label: 'Skills', icon: GraduationCap },
  { to: '/student/projects', label: 'Projects', icon: FolderKanban },
  { to: '/student/services', label: 'Services', icon: Briefcase },
  { to: '/student/certificates', label: 'Certificates', icon: Award },
  { to: '/student/portfolio', label: 'Portfolio', icon: Shield },
]

export const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Student Management', icon: UserCircle },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/admin/moderation', label: 'Moderation', icon: Shield },
]
