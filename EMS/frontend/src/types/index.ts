// ============================================================
// VoteSphere – Centralized TypeScript Types
// ============================================================

export type UserRole = 'super_admin' | 'election_creator' | 'voter';
export type ElectionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
export type VoterStatus = 'registered' | 'waitlisted' | 'voted' | 'blocked';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type AuditAction = 'login' | 'logout' | 'vote' | 'approve' | 'reject' | 'create' | 'edit' | 'delete' | 'override';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  is2FAEnabled: boolean;
  isBlocked: boolean;
  organization?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  designation: string;
  photo: string;
  manifesto: string;
  voteCount: number;
  order: number;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  category: 'government' | 'corporate' | 'educational' | 'community' | 'ngo';
  organization: string;
  status: ElectionStatus;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  timezone: string;
  maxVoters: number;
  currentVoters: number;
  isWaitlistEnabled: boolean;
  waitlistCount: number;
  isVoterListLocked: boolean;
  requireSecretId: boolean;
  require2FA: boolean;
  allowAnonymous: boolean;
  candidates: Candidate[];
  totalVotes: number;
  turnoutPercentage: number;
  rejectionReason?: string;
  publishedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
}

export interface VoterRegistration {
  id: string;
  electionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: VoterStatus;
  secretId: string;
  secretIdMasked: string;
  registeredAt: string;
  votedAt?: string;
  waitlistPosition?: number;
  voteHash?: string;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string; // hashed for anonymity
  secretId: string;
  castedAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetId?: string;
  targetType?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  isAdminOverride: boolean;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface SecretId {
  id: string;
  electionId: string;
  electionTitle: string;
  userId: string;
  code: string; // POLL-A-0001
  masked: string; // POLL-A-****
  isUsed: boolean;
  isRevoked: boolean;
  generatedAt: string;
  usedAt?: string;
  expiresAt: string;
}

export interface ElectionRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string;
  organization: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface DashboardStats {
  totalElections: number;
  activeElections: number;
  totalUsers: number;
  totalVoters: number;
  totalCreators: number;
  pendingRequests: number;
  totalVotesCast: number;
  fraudAlerts: number;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  organization?: string;
  purpose?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
