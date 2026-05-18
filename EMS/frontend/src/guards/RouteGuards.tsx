import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

// ── Spinner while session is being restored ───────────────────
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// ── Auth Guard: redirect to /login if not authenticated ──────
export function AuthGuard() {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();
  if (isInitializing) return <LoadingSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

// ── Role Guard: redirect to /unauthorized if role mismatch ──
interface RoleGuardProps {
  allowedRoles: UserRole[];
}
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  if (isInitializing) return <LoadingSpinner />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

// ── Guest Guard: redirect to dashboard if already logged in ─
export function GuestGuard() {
  const { isAuthenticated, user, isInitializing } = useAuthStore();
  if (isInitializing) return <LoadingSpinner />;
  if (isAuthenticated && user) {
    const redirectMap: Record<UserRole, string> = {
      super_admin:      '/admin/dashboard',
      election_creator: '/creator/dashboard',
      voter:            '/voter/dashboard',
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }
  return <Outlet />;
}

