import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthGuard, RoleGuard, GuestGuard } from './guards/RouteGuards';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { useElectionStore } from './store/electionStore';
import { useNotificationStore } from './store/notificationStore';
import { useVotingStore } from './store/votingStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import CreatorLayout from './layouts/CreatorLayout';
import VoterLayout from './layouts/VoterLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import ElectionDetailPage from './pages/public/ElectionDetailPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OTPPage from './pages/auth/OTPPage';
import TwoFAPage from './pages/auth/TwoFAPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ElectionRequests from './pages/admin/ElectionRequests';
import ApprovedElections from './pages/admin/ApprovedElections';
import RejectedElections from './pages/admin/RejectedElections';
import ActiveElectionsAdmin from './pages/admin/ActiveElectionsAdmin';
import CompletedElectionsAdmin from './pages/admin/CompletedElectionsAdmin';
import UsersManagement from './pages/admin/UsersManagement';
import ElectionCreators from './pages/admin/ElectionCreators';
import VotersManagement from './pages/admin/VotersManagement';
import BlockedUsers from './pages/admin/BlockedUsers';
import SecurityCenter from './pages/admin/SecurityCenter';
import FraudDetection from './pages/admin/FraudDetection';
import AuditLogs from './pages/admin/AuditLogs';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReports from './pages/admin/AdminReports';
import ApiMonitoring from './pages/admin/ApiMonitoring';
import DatabaseHealth from './pages/admin/DatabaseHealth';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';

// Creator Pages
import CreatorDashboard from './pages/creator/CreatorDashboard';
import MyElections from './pages/creator/MyElections';
import CreateElection from './pages/creator/CreateElection';
import DraftElections from './pages/creator/DraftElections';
import ApprovedElectionsCreator from './pages/creator/ApprovedElectionsCreator';
import ActiveElectionsCreator from './pages/creator/ActiveElectionsCreator';
import CompletedElectionsCreator from './pages/creator/CompletedElectionsCreator';
import CandidateManagement from './pages/creator/CandidateManagement';
import VoterManagement from './pages/creator/VoterManagement';
import SecretIdsCreator from './pages/creator/SecretIdsCreator';
import WaitlistPage from './pages/creator/WaitlistPage';
import LiveResults from './pages/creator/LiveResults';
import CreatorAnalytics from './pages/creator/CreatorAnalytics';
import CreatorNotifications from './pages/creator/CreatorNotifications';
import CreatorReports from './pages/creator/CreatorReports';
import ExportCenter from './pages/creator/ExportCenter';
import BillingPage from './pages/creator/BillingPage';
import CreatorSettings from './pages/creator/CreatorSettings';
import CreatorProfile from './pages/creator/CreatorProfile';

// Voter Pages
import VoterDashboard from './pages/voter/VoterDashboard';
import MyElectionsVoter from './pages/voter/MyElectionsVoter';
import ActiveVoting from './pages/voter/ActiveVoting';
import UpcomingElections from './pages/voter/UpcomingElections';
import CompletedElectionsVoter from './pages/voter/CompletedElectionsVoter';
import SecretIdsVoter from './pages/voter/SecretIdsVoter';
import VerificationCenter from './pages/voter/VerificationCenter';
import VotingHistory from './pages/voter/VotingHistory';
import ResultsVoter from './pages/voter/ResultsVoter';
import Certificates from './pages/voter/Certificates';
import VoterNotifications from './pages/voter/VoterNotifications';
import SupportCenter from './pages/voter/SupportCenter';
import SecurityVoter from './pages/voter/SecurityVoter';
import DevicesPage from './pages/voter/DevicesPage';
import VoterSettings from './pages/voter/VoterSettings';
import VoterProfile from './pages/voter/VoterProfile';

// Voting Flow
import VotingFlow from './pages/voter/VotingFlow';

// Error Pages
import { NotFoundPage, UnauthorizedPage, MaintenancePage } from './pages/error/ErrorPages';

export default function App() {
  const { theme } = useThemeStore();
  const { initAuth, isInitializing, user, isAuthenticated } = useAuthStore();
  const { fetchElections, fetchRequests, subscribeToChanges, unsubscribe } = useElectionStore();
  const { fetchAndSubscribe, unsubscribe: unsubNotif } = useNotificationStore();
  const { fetchMyData, unsubscribeAll } = useVotingStore();
  const [appReady, setAppReady] = useState(false);

  // Apply theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Bootstrap: restore Supabase session
  useEffect(() => {
    initAuth().then(() => setAppReady(true));
  }, [initAuth]);

  // Wire up stores when user logs in/out
  useEffect(() => {
    if (!isAuthenticated || !user) {
      unsubscribe();
      unsubNotif();
      unsubscribeAll();
      return;
    }
    // Fetch initial data for the authenticated user
    const role = user.role;
    fetchElections(role === 'election_creator' ? { creatorId: user.id } : undefined);
    if (role === 'super_admin') fetchRequests();
    fetchAndSubscribe(user.id);
    if (role === 'voter') fetchMyData(user.id);
    subscribeToChanges();

    return () => {
      unsubscribe();
      unsubNotif();
      unsubscribeAll();
    };
  }, [isAuthenticated, user?.id]);

  // Show full-page loader while session is being restored
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-semibold">Loading VoteSphere...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/elections/:id" element={<ElectionDetailPage />} />
        </Route>

        {/* Auth Routes (guests only) */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
        </Route>

        {/* Semi-public auth routes */}
        <Route path="/2fa" element={<TwoFAPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Super Admin Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowedRoles={['super_admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/elections/requests" element={<ElectionRequests />} />
              <Route path="/admin/elections/approved" element={<ApprovedElections />} />
              <Route path="/admin/elections/rejected" element={<RejectedElections />} />
              <Route path="/admin/elections/active" element={<ActiveElectionsAdmin />} />
              <Route path="/admin/elections/completed" element={<CompletedElectionsAdmin />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/users/creators" element={<ElectionCreators />} />
              <Route path="/admin/users/voters" element={<VotersManagement />} />
              <Route path="/admin/users/blocked" element={<BlockedUsers />} />
              <Route path="/admin/security" element={<SecurityCenter />} />
              <Route path="/admin/security/fraud" element={<FraudDetection />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/api-monitoring" element={<ApiMonitoring />} />
              <Route path="/admin/database-health" element={<DatabaseHealth />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Election Creator Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowedRoles={['election_creator']} />}>
            <Route element={<CreatorLayout />}>
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/elections" element={<MyElections />} />
              <Route path="/creator/elections/create" element={<CreateElection />} />
              <Route path="/creator/elections/drafts" element={<DraftElections />} />
              <Route path="/creator/elections/approved" element={<ApprovedElectionsCreator />} />
              <Route path="/creator/elections/active" element={<ActiveElectionsCreator />} />
              <Route path="/creator/elections/completed" element={<CompletedElectionsCreator />} />
              <Route path="/creator/candidates" element={<CandidateManagement />} />
              <Route path="/creator/voters" element={<VoterManagement />} />
              <Route path="/creator/secret-ids" element={<SecretIdsCreator />} />
              <Route path="/creator/waitlist" element={<WaitlistPage />} />
              <Route path="/creator/results" element={<LiveResults />} />
              <Route path="/creator/analytics" element={<CreatorAnalytics />} />
              <Route path="/creator/notifications" element={<CreatorNotifications />} />
              <Route path="/creator/reports" element={<CreatorReports />} />
              <Route path="/creator/export" element={<ExportCenter />} />
              <Route path="/creator/billing" element={<BillingPage />} />
              <Route path="/creator/settings" element={<CreatorSettings />} />
              <Route path="/creator/profile" element={<CreatorProfile />} />
              <Route path="/creator" element={<Navigate to="/creator/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Voter Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowedRoles={['voter']} />}>
            <Route element={<VoterLayout />}>
              <Route path="/voter/dashboard" element={<VoterDashboard />} />
              <Route path="/voter/elections" element={<MyElectionsVoter />} />
              <Route path="/voter/elections/active" element={<ActiveVoting />} />
              <Route path="/voter/elections/upcoming" element={<UpcomingElections />} />
              <Route path="/voter/elections/completed" element={<CompletedElectionsVoter />} />
              <Route path="/voter/secret-ids" element={<SecretIdsVoter />} />
              <Route path="/voter/verification" element={<VerificationCenter />} />
              <Route path="/voter/history" element={<VotingHistory />} />
              <Route path="/voter/results" element={<ResultsVoter />} />
              <Route path="/voter/certificates" element={<Certificates />} />
              <Route path="/voter/notifications" element={<VoterNotifications />} />
              <Route path="/voter/support" element={<SupportCenter />} />
              <Route path="/voter/security" element={<SecurityVoter />} />
              <Route path="/voter/devices" element={<DevicesPage />} />
              <Route path="/voter/settings" element={<VoterSettings />} />
              <Route path="/voter/profile" element={<VoterProfile />} />
              <Route path="/voter/vote/:electionId" element={<VotingFlow />} />
              <Route path="/voter" element={<Navigate to="/voter/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
