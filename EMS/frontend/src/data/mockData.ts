import type { AuditLog, Notification, SecretId, VoterRegistration, ElectionRequest } from '../types';

const now = new Date();
const sub = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-001', action: 'login', userId: 'admin-001', userName: 'Alex Chen', userRole: 'super_admin', description: 'Super admin logged in successfully', ipAddress: '192.168.1.1', userAgent: 'Chrome/120', timestamp: sub(5), isAdminOverride: false },
  { id: 'log-002', action: 'approve', userId: 'admin-001', userName: 'Alex Chen', userRole: 'super_admin', targetId: 'elec-001', targetType: 'election', description: 'Approved election: Annual City Council Board Election 2024', ipAddress: '192.168.1.1', userAgent: 'Chrome/120', timestamp: sub(20), isAdminOverride: false },
  { id: 'log-003', action: 'vote', userId: 'voter-001', userName: 'Adrian Foster', userRole: 'voter', targetId: 'elec-001', targetType: 'election', description: 'Vote cast anonymously in election elec-001', ipAddress: '10.0.0.45', userAgent: 'Safari/17', timestamp: sub(35), isAdminOverride: false },
  { id: 'log-004', action: 'vote', userId: 'voter-002', userName: 'Emma Thompson', userRole: 'voter', targetId: 'elec-001', targetType: 'election', description: 'Vote cast anonymously in election elec-001', ipAddress: '10.0.0.46', userAgent: 'Firefox/121', timestamp: sub(40), isAdminOverride: false },
  { id: 'log-005', action: 'create', userId: 'creator-001', userName: 'Maria Rodriguez', userRole: 'election_creator', targetId: 'elec-005', targetType: 'election', description: 'Created new election: Community Grant Allocation Q4 2024', ipAddress: '172.16.0.10', userAgent: 'Chrome/120', timestamp: sub(120), isAdminOverride: false },
  { id: 'log-006', action: 'reject', userId: 'admin-001', userName: 'Alex Chen', userRole: 'super_admin', targetId: 'req-003', targetType: 'request', description: "Rejected creator request – insufficient documentation", ipAddress: '192.168.1.1', userAgent: 'Chrome/120', timestamp: sub(180), isAdminOverride: false },
  { id: 'log-007', action: 'override', userId: 'admin-001', userName: 'Alex Chen', userRole: 'super_admin', targetId: 'elec-004', targetType: 'election', description: 'Admin override: Manually added voter to locked list', ipAddress: '192.168.1.1', userAgent: 'Chrome/120', timestamp: sub(240), isAdminOverride: true },
  { id: 'log-008', action: 'login', userId: 'voter-003', userName: 'James Wilson', userRole: 'voter', description: 'Suspicious login attempt – account blocked', ipAddress: '45.33.32.156', userAgent: 'Python-requests/2.28', timestamp: sub(300), isAdminOverride: false },
  { id: 'log-009', action: 'edit', userId: 'creator-002', userName: 'Derrick Vance', userRole: 'election_creator', targetId: 'elec-004', targetType: 'election', description: 'Updated election details: Heritage High School Student Council 2024', ipAddress: '172.16.0.11', userAgent: 'Edge/120', timestamp: sub(360), isAdminOverride: false },
  { id: 'log-010', action: 'delete', userId: 'creator-003', userName: "Liam O'Brien", userRole: 'election_creator', targetId: 'cand-old', targetType: 'candidate', description: 'Deleted candidate from draft election', ipAddress: '172.16.0.12', userAgent: 'Chrome/119', timestamp: sub(480), isAdminOverride: false },
  { id: 'log-011', action: 'approve', userId: 'admin-002', userName: 'Sarah Jenkins', userRole: 'super_admin', targetId: 'req-002', targetType: 'request', description: 'Approved creator request from Derrick Vance', ipAddress: '192.168.1.2', userAgent: 'Chrome/120', timestamp: sub(720), isAdminOverride: false },
  { id: 'log-012', action: 'logout', userId: 'voter-004', userName: 'Priya Sharma', userRole: 'voter', description: 'User logged out', ipAddress: '10.0.0.48', userAgent: 'Chrome/120', timestamp: sub(900), isAdminOverride: false },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', userId: 'admin-001', type: 'warning', title: 'New Creator Request', message: "Liam O'Brien from Technova Solutions submitted a creator request.", isRead: false, actionUrl: '/admin/elections/requests', createdAt: sub(10) },
  { id: 'notif-002', userId: 'admin-001', type: 'error', title: 'Brute Force Attempt', message: 'IP 45.33.32.156 made 15 failed login attempts. Account auto-blocked.', isRead: false, actionUrl: '/admin/security', createdAt: sub(30) },
  { id: 'notif-003', userId: 'admin-001', type: 'info', title: 'Election Completed', message: 'Global Tech Corp Annual Board Election concluded with 84% turnout.', isRead: true, actionUrl: '/admin/elections/completed', createdAt: sub(60) },
  { id: 'notif-004', userId: 'creator-001', type: 'success', title: 'Election Approved', message: 'Your election "Community Grant Allocation Q4 2024" has been approved.', isRead: false, actionUrl: '/creator/elections', createdAt: sub(15) },
  { id: 'notif-005', userId: 'creator-001', type: 'info', title: 'Voter Limit Reached', message: 'Election "Policy Amendment 2024-B" reached 96% voter capacity.', isRead: true, actionUrl: '/creator/elections/active', createdAt: sub(90) },
  { id: 'notif-006', userId: 'voter-001', type: 'success', title: 'Vote Confirmed', message: 'Your vote in "Annual City Council Board Election 2024" has been recorded.', isRead: false, actionUrl: '/voter/history', createdAt: sub(35) },
  { id: 'notif-007', userId: 'voter-001', type: 'info', title: 'Election Starting Soon', message: 'Policy Amendment 2024-B starts in 2 hours. Your secret ID is ready.', isRead: true, actionUrl: '/voter/secret-ids', createdAt: sub(120) },
  { id: 'notif-008', userId: 'voter-001', type: 'info', title: 'Secret ID Generated', message: 'Your Secret ID for Annual City Council Board Election 2024: POLL-A-****', isRead: true, actionUrl: '/voter/secret-ids', createdAt: sub(1440) },
];

export const MOCK_SECRET_IDS: SecretId[] = [
  { id: 'sid-001', electionId: 'elec-001', electionTitle: 'Annual City Council Board Election 2024', userId: 'voter-001', code: 'POLL-A-0001', masked: 'POLL-A-****', isUsed: true, isRevoked: false, generatedAt: sub(2880), usedAt: sub(35), expiresAt: new Date(now.getTime() + 3 * 86400000).toISOString() },
  { id: 'sid-002', electionId: 'elec-002', electionTitle: 'Policy Amendment 2024-B', userId: 'voter-001', code: 'POLL-B-0042', masked: 'POLL-B-****', isUsed: false, isRevoked: false, generatedAt: sub(1440), expiresAt: new Date(now.getTime() + 86400000).toISOString() },
  { id: 'sid-003', electionId: 'elec-003', electionTitle: 'Global Tech Corp Annual Board Election', userId: 'voter-002', code: 'POLL-C-0178', masked: 'POLL-C-****', isUsed: true, isRevoked: false, generatedAt: sub(14400), usedAt: sub(10080), expiresAt: sub(7200) },
];

export const MOCK_VOTER_REGISTRATIONS: VoterRegistration[] = [
  { id: 'vreg-001', electionId: 'elec-001', userId: 'voter-001', userName: 'Adrian Foster', userEmail: 'voter@votesphere.com', status: 'voted', secretId: 'POLL-A-0001', secretIdMasked: 'POLL-A-****', registeredAt: sub(5760), votedAt: sub(35) },
  { id: 'vreg-002', electionId: 'elec-001', userId: 'voter-002', userName: 'Emma Thompson', userEmail: 'emma.t@email.com', status: 'voted', secretId: 'POLL-A-0002', secretIdMasked: 'POLL-A-****', registeredAt: sub(5700), votedAt: sub(40) },
  { id: 'vreg-003', electionId: 'elec-002', userId: 'voter-001', userName: 'Adrian Foster', userEmail: 'voter@votesphere.com', status: 'registered', secretId: 'POLL-B-0042', secretIdMasked: 'POLL-B-****', registeredAt: sub(1440) },
  { id: 'vreg-004', electionId: 'elec-004', userId: 'voter-004', userName: 'Priya Sharma', userEmail: 'priya.s@email.com', status: 'registered', secretId: 'POLL-D-0091', secretIdMasked: 'POLL-D-****', registeredAt: sub(720) },
  { id: 'vreg-005', electionId: 'elec-001', userId: 'voter-003', userName: 'James Wilson', userEmail: 'jwilson@email.com', status: 'waitlisted', secretId: '', secretIdMasked: '', registeredAt: sub(4320), waitlistPosition: 3 },
];

export const MOCK_ELECTION_REQUESTS: ElectionRequest[] = [
  { id: 'req-001', creatorId: 'creator-001', creatorName: 'Maria Rodriguez', creatorEmail: 'creator@votesphere.com', creatorPhone: '+1 555-001-0001', organization: 'City Council #401', purpose: 'Annual board election for city governance', status: 'approved', submittedAt: sub(20160), reviewedAt: sub(19000), reviewedBy: 'Alex Chen' },
  { id: 'req-002', creatorId: 'creator-002', creatorName: 'Derrick Vance', creatorEmail: 'dvance@heritage.edu', creatorPhone: '+1 555-001-0002', organization: 'Heritage High School', purpose: 'Student council elections for academic year', status: 'approved', submittedAt: sub(17280), reviewedAt: sub(16000), reviewedBy: 'Sarah Jenkins' },
  { id: 'req-003', creatorId: 'creator-003', creatorName: "Liam O'Brien", creatorEmail: 'liam@technova.com', creatorPhone: '+1 555-001-0003', organization: 'Technova Solutions', purpose: 'Corporate board member selection', status: 'pending', submittedAt: sub(120) },
];
