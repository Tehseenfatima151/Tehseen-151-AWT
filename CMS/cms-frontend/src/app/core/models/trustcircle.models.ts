import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type KycStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type KycStepKey = 'personal' | 'financial' | 'identity' | 'review';

export interface UserPersonal {
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
}

export interface UserFinancial {
  bankName: string;
  ibanOrAccount: string;
  monthlyIncome: number;
  employmentStatus: string;
  paymentMethod: string;
}

export interface UserIdentityDocs {
  cnicUrl?: string;
  selfieUrl?: string;
  addressProofUrl?: string;
}

/** Mapped profile for navbar and legacy templates. */
export interface AuthUserView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  trustScore?: number;
  kycStatus?: KycStatus;
  kycLatestStep?: KycStepKey;
  blocked?: boolean;
  personal?: UserPersonal;
  financial?: UserFinancial;
  identity?: UserIdentityDocs;
}

export interface TrustCircleUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  blocked: boolean;
  kycStatus: KycStatus;
  kycLatestStep?: KycStepKey;
  personal?: UserPersonal;
  financial?: UserFinancial;
  identity?: UserIdentityDocs;
  trustScore: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface KycSubmission {
  userId: string;
  status: Exclude<KycStatus, 'not_started' | 'in_progress'>;
  personal?: UserPersonal;
  financial?: UserFinancial;
  identity?: UserIdentityDocs;
  submittedAt?: Timestamp | null;
  reviewedAt?: Timestamp | null;
  reviewerNote?: string;
}

export type CommitteeStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended' | 'frozen' | 'investigating';

export interface CommitteeMember {
  userId: string;
  joinedAt: Timestamp | null;
  payoutsReceivedCount: number;
}

export interface Committee {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  inviteCode: string;
  contributionAmount: number;
  currency: string;
  maxMembers: number;
  memberIds: string[];
  status: CommitteeStatus;
  /** User ids already paid out at least once in order — first payout is creator. */
  payoutRecipientOrder: string[];
  monthlyDueDay?: number;
  totalCycles: number;
  currentCycle: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type TransactionStatus = 'pending' | 'paid' | 'late' | 'missed';

export interface CommitteeTransaction {
  id: string;
  committeeId: string;
  userId: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidAt?: string | null;
  status: TransactionStatus;
  proofUrl?: string | null;
  proofHash?: string | null;
  monthKey: string;
  notes?: string;
  createdAt?: Timestamp | null;
}

export interface PayoutRecord {
  id: string;
  committeeId: string;
  cycleIndex: number;
  recipientId: string;
  method: 'creator_first' | 'random_draw';
  amount: number;
  currency: string;
  createdAt?: Timestamp | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  type: 'payment' | 'committee' | 'fraud' | 'kyc' | 'system';
  createdAt?: Timestamp | null;
}

export interface FraudReport {
  id: string;
  userId: string;
  riskScore: number;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedAt?: Timestamp | null;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt?: Timestamp | null;
}

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'dismissed';

export interface Dispute {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  committeeId?: string;
  assigneeAdminId?: string;
  status: DisputeStatus;
  amount?: number;
  priority: 'low' | 'medium' | 'high';
  claimantId?: string;
  respondentIds?: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  resolutionNote?: string;
  resolvedAt?: Timestamp | null;
}

export interface AdminAuditLog {
  id: string;
  actionBy: string;
  actionByEmail: string;
  actionType: string;
  actionReason: string;
  targetId: string;
  targetCollection: string;
  actionTimestamp: Timestamp | null;
  metadata?: any;
}
