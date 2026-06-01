import { AnimatePresence } from 'framer-motion'
import { Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PageTransition from './components/common/PageTransition'

import DashboardLayout from './components/layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import StudentLoginPage from './pages/StudentLoginPage'
import StudentRegisterPage from './pages/StudentRegisterPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import StudentSkillsPage from './pages/student/StudentSkillsPage'
import StudentProjectsPage from './pages/student/StudentProjectsPage'
import StudentServicesPage from './pages/student/StudentServicesPage'
import StudentCertificatesPage from './pages/student/StudentCertificatesPage'
import StudentPortfolioPage from './pages/student/StudentPortfolioPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminModerationPage from './pages/admin/AdminModerationPage'
import AdminStudentPortfolioPage from './pages/admin/AdminStudentPortfolioPage'
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage'
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage'
import AdminOpportunitiesPage from './pages/admin/AdminOpportunitiesPage'
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage'
import StudentOpportunitiesPage from './pages/student/StudentOpportunitiesPage'
import StudentApplicationsPage from './pages/student/StudentApplicationsPage'
import PublicPortfolioPage from './pages/PublicPortfolioPage'
import StudentSettingsPage from './pages/student/StudentSettingsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import NotFoundPage from './pages/NotFoundPage'

function RouteFallback() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center bg-[#030712]">
      <div className="h-10 w-40 animate-pulse rounded-xl bg-white/15" />
    </div>
  )
}

function SessionLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] px-4 text-slate-300">
      <p className="mb-4 text-sm font-medium text-slate-200">Loading your session…</p>
      <div className="h-2 w-56 rounded-full bg-white/10">
        <div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
      </div>
      <p className="mt-3 max-w-sm text-center text-xs text-slate-400">This should only take a moment.</p>
    </div>
  )
}

function ProtectedRoute({ role, children }) {
  const { session, profile, loading } = useAuth()
  if (loading) {
    return <SessionLoadingScreen />
  }
  if (!session) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/student/login'} replace />
  }
  if (!profile) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/student/login'} replace state={{ reason: 'no_profile' }} />
  }
  if (profile.role !== role) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />
    if (profile.role === 'student') return <Navigate to="/student" replace />
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const location = useLocation()

  const withTransition = (node) => <PageTransition>{node}</PageTransition>

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={withTransition(<LandingPage />)} />
          <Route path="/student/login" element={withTransition(<StudentLoginPage />)} />
          <Route path="/student/register" element={withTransition(<StudentRegisterPage />)} />
          <Route path="/admin/login" element={withTransition(<AdminLoginPage />)} />
          <Route path="/auth/reset-password" element={withTransition(<ResetPasswordPage />)} />
          <Route path="/portfolio/:id" element={withTransition(<PublicPortfolioPage />)} />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <DashboardLayout portal="student" />
              </ProtectedRoute>
            }
          >
            <Route index element={withTransition(<StudentDashboardPage />)} />
            <Route path="profile" element={withTransition(<StudentProfilePage />)} />
            <Route path="skills" element={withTransition(<StudentSkillsPage />)} />
            <Route path="projects" element={withTransition(<StudentProjectsPage />)} />
            <Route path="services" element={withTransition(<StudentServicesPage />)} />
            <Route path="certificates" element={withTransition(<StudentCertificatesPage />)} />
            <Route path="portfolio" element={withTransition(<StudentPortfolioPage />)} />
            <Route path="opportunities" element={withTransition(<StudentOpportunitiesPage />)} />
            <Route path="applications" element={withTransition(<StudentApplicationsPage />)} />
            <Route path="settings" element={withTransition(<StudentSettingsPage />)} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout portal="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={withTransition(<AdminDashboardPage />)} />
            <Route path="students" element={withTransition(<AdminStudentsPage />)} />
            <Route path="students/:id" element={withTransition(<AdminStudentPortfolioPage />)} />
            <Route path="feedback" element={withTransition(<AdminFeedbackPage />)} />
            <Route path="leaderboard" element={withTransition(<AdminLeaderboardPage />)} />
            <Route path="moderation" element={withTransition(<AdminModerationPage />)} />
            <Route path="opportunities" element={withTransition(<AdminOpportunitiesPage />)} />
            <Route path="applications" element={withTransition(<AdminApplicationsPage />)} />
            <Route path="settings" element={withTransition(<AdminSettingsPage />)} />
          </Route>

          <Route path="*" element={withTransition(<NotFoundPage />)} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
