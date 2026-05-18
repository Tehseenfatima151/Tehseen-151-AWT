import type { User, UserRole } from '../types';

// ============================================================
// Mock Users Dataset
// ============================================================

export const MOCK_CREDENTIALS = [
  { email: 'admin@votesphere.com', password: 'password123', role: 'super_admin' as UserRole },
  { email: 'creator@votesphere.com', password: 'password123', role: 'election_creator' as UserRole },
  { email: 'voter@votesphere.com', password: 'password123', role: 'voter' as UserRole },
];

export const MOCK_USERS: User[] = [
  // Super Admins
  {
    id: 'admin-001',
    name: 'Alex Chen',
    email: 'admin@votesphere.com',
    phone: '+1 (555) 000-0001',
    role: 'super_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isVerified: true,
    is2FAEnabled: true,
    isBlocked: false,
    organization: 'VoteSphere Inc.',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-10-30T09:00:00Z',
  },
  {
    id: 'admin-002',
    name: 'Sarah Jenkins',
    email: 'sarah@votesphere.com',
    phone: '+1 (555) 000-0002',
    role: 'super_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isVerified: true,
    is2FAEnabled: true,
    isBlocked: false,
    organization: 'VoteSphere Inc.',
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-10-29T14:30:00Z',
  },

  // Election Creators
  {
    id: 'creator-001',
    name: 'Maria Rodriguez',
    email: 'creator@votesphere.com',
    phone: '+1 (555) 001-0001',
    role: 'election_creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    isVerified: true,
    is2FAEnabled: false,
    isBlocked: false,
    organization: 'City Council #401',
    createdAt: '2024-02-10T00:00:00Z',
    lastLogin: '2024-10-30T08:00:00Z',
  },
  {
    id: 'creator-002',
    name: 'Derrick Vance',
    email: 'dvance@heritage.edu',
    phone: '+1 (555) 001-0002',
    role: 'election_creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Derrick',
    isVerified: true,
    is2FAEnabled: false,
    isBlocked: false,
    organization: 'Heritage High School',
    createdAt: '2024-03-05T00:00:00Z',
    lastLogin: '2024-10-28T11:00:00Z',
  },
  {
    id: 'creator-003',
    name: "Liam O'Brien",
    email: 'liam@technova.com',
    phone: '+1 (555) 001-0003',
    role: 'election_creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
    isVerified: false,
    is2FAEnabled: false,
    isBlocked: false,
    organization: 'Technova Solutions',
    createdAt: '2024-04-20T00:00:00Z',
    lastLogin: '2024-10-25T16:00:00Z',
  },

  // Voters
  {
    id: 'voter-001',
    name: 'Adrian Foster',
    email: 'voter@votesphere.com',
    phone: '+1 (555) 002-0001',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adrian',
    isVerified: true,
    is2FAEnabled: false,
    isBlocked: false,
    createdAt: '2024-05-01T00:00:00Z',
    lastLogin: '2024-10-30T07:30:00Z',
  },
  {
    id: 'voter-002',
    name: 'Emma Thompson',
    email: 'emma.t@email.com',
    phone: '+1 (555) 002-0002',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    isVerified: true,
    is2FAEnabled: false,
    isBlocked: false,
    createdAt: '2024-05-10T00:00:00Z',
    lastLogin: '2024-10-29T20:00:00Z',
  },
  {
    id: 'voter-003',
    name: 'James Wilson',
    email: 'jwilson@email.com',
    phone: '+1 (555) 002-0003',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    isVerified: true,
    is2FAEnabled: false,
    isBlocked: true,
    createdAt: '2024-05-15T00:00:00Z',
    lastLogin: '2024-10-20T10:00:00Z',
  },
  {
    id: 'voter-004',
    name: 'Priya Sharma',
    email: 'priya.s@email.com',
    phone: '+1 (555) 002-0004',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    isVerified: true,
    is2FAEnabled: true,
    isBlocked: false,
    createdAt: '2024-06-01T00:00:00Z',
    lastLogin: '2024-10-30T06:00:00Z',
  },
];

export const getMockUserByCredentials = (email: string, password: string) => {
  const cred = MOCK_CREDENTIALS.find(c => c.email === email && c.password === password);
  if (!cred) return null;
  return MOCK_USERS.find(u => u.email === email) ?? null;
};
