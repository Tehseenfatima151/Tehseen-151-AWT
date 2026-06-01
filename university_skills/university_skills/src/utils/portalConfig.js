import { Award, Briefcase, FolderKanban, GraduationCap, LayoutDashboard, MessageSquare, Shield, Trophy, UserCircle, Compass, FileText, Settings } from 'lucide-react'

export const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/opportunities', label: 'Opportunities', icon: Compass },
  { to: '/student/applications', label: 'My Applications', icon: FileText },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
  { to: '/student/skills', label: 'Skills', icon: GraduationCap },
  { to: '/student/projects', label: 'Projects', icon: FolderKanban },
  { to: '/student/services', label: 'Services', icon: Briefcase },
  { to: '/student/certificates', label: 'Certificates', icon: Award },
  { to: '/student/portfolio', label: 'Build Portfolio', icon: Shield },
  { to: '/student/settings', label: 'Settings', icon: Settings },
]

export const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/opportunities', label: 'Opportunities', icon: Compass },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/students', label: 'Student Management', icon: UserCircle },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/admin/moderation', label: 'Moderation', icon: Shield },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]
