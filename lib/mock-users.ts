export type UserRole = 'admin' | 'contestant' | 'media' | 'voter' | 'sponsor' | 'public';

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  twoFactorEnabled: boolean;
}

export interface UserProfile {
  bio: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  verified: boolean;
  verificationDate?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  eventId?: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  loginHistory?: LoginRecord[];
  activeSessions?: SessionRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRecord {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
  success: boolean;
}

export interface SessionRecord {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  createdAt: string;
}

// Mock users database for authentication
// In production, this would be replaced with a real database
export const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@votingplatform.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alemu%20Admin',
    profile: {
      bio: 'System Administrator',
      verified: true,
      verificationDate: '2024-01-01',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'en',
      twoFactorEnabled: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin-002',
    email: 'sarah.johnson@votingplatform.com',
    password: 'Admin@123456',
    name: 'Hana Kebede',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hana%20Kebede',
    profile: {
      bio: 'Content Moderator',
      location: 'Addis Ababa, Ethiopia',
      verified: true,
      verificationDate: '2024-01-02',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      theme: 'light',
      language: 'en',
      twoFactorEnabled: false,
    },
    createdAt: '2024-01-02T08:00:00Z',
  },
  {
    id: 'contestant-001',
    email: 'contestant@example.com',
    password: 'Contestant@123456',
    name: 'Dawit Contestant',
    role: 'contestant',
    eventId: 'event-001',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Dawit%20Contestant',
    profile: {
      bio: 'Aspiring performer',
      location: 'Addis Ababa, Ethiopia',
      phone: '+1-555-0101',
      verified: true,
      verificationDate: '2024-02-01',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'en',
      twoFactorEnabled: false,
    },
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'contestant-002',
    email: 'maria.garcia@example.com',
    password: 'Contestant@123456',
    name: 'Selamawit Fikru',
    role: 'contestant',
    eventId: 'event-001',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Selamawit%20Fikru',
    profile: {
      bio: 'Singer & Dancer from Spain',
      location: 'Bahir Dar, Ethiopia',
      verified: true,
      verificationDate: '2024-02-03',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'es',
      twoFactorEnabled: false,
    },
    createdAt: '2024-02-03T15:30:00Z',
  },
  {
    id: 'contestant-003',
    email: 'alex.chen@example.com',
    password: 'Contestant@123456',
    name: 'Nahom Tadesse',
    role: 'contestant',
    eventId: 'event-002',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Nahom%20Tadesse',
    profile: {
      bio: 'Musician & Producer',
      location: 'Hawassa, Ethiopia',
      verified: true,
      verificationDate: '2024-02-05',
    },
    preferences: {
      emailNotifications: false,
      pushNotifications: true,
      theme: 'dark',
      language: 'zh',
      twoFactorEnabled: false,
    },
    createdAt: '2024-02-05T09:00:00Z',
  },
  {
    id: 'media-001',
    email: 'media@example.com',
    password: 'Media@123456',
    name: 'Media Manager',
    role: 'media',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hana%20Tesfaye',
    profile: {
      bio: 'Official Media Coordinator',
      location: 'Addis Ababa, Ethiopia',
      verified: true,
      verificationDate: '2024-01-10',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'en',
      twoFactorEnabled: true,
    },
    createdAt: '2024-01-10T12:00:00Z',
  },
  {
    id: 'media-002',
    email: 'press@example.com',
    password: 'Media@123456',
    name: 'Press Officer',
    role: 'media',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Abel%20Press',
    profile: {
      bio: 'Press & Communications Lead',
      location: 'Addis Ababa, Ethiopia',
      verified: true,
      verificationDate: '2024-01-12',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      theme: 'light',
      language: 'en',
      twoFactorEnabled: false,
    },
    createdAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'voter-001',
    email: 'voter@example.com',
    password: 'Voter@123456',
    name: 'Ruth Kebede',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ruth%20Kebede',
    profile: {
      bio: 'Music enthusiast',
      location: 'Dire Dawa, Ethiopia',
      verified: true,
      verificationDate: '2024-03-01',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'en',
      twoFactorEnabled: false,
    },
    createdAt: '2024-03-01T11:00:00Z',
  },
  {
    id: 'voter-002',
    email: 'james.smith@example.com',
    password: 'Voter@123456',
    name: 'Natnael Bekele',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Natnael%20Bekele',
    profile: {
      bio: 'Artist and Designer',
      location: 'Mekelle, Ethiopia',
      verified: true,
      verificationDate: '2024-03-02',
    },
    preferences: {
      emailNotifications: false,
      pushNotifications: false,
      theme: 'light',
      language: 'en',
      twoFactorEnabled: false,
    },
    createdAt: '2024-03-02T16:00:00Z',
  },
  {
    id: 'voter-003',
    email: 'lisa.anderson@example.com',
    password: 'Voter@123456',
    name: 'Bethel Girma',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Bethel%20Girma',
    profile: {
      bio: 'Creative Director',
      location: 'Adama, Ethiopia',
      verified: true,
      verificationDate: '2024-03-03',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'de',
      twoFactorEnabled: true,
    },
    createdAt: '2024-03-03T08:30:00Z',
  },
  {
    id: 'sponsor-001',
    email: 'sponsor@example.com',
    password: 'Sponsor@123456',
    name: 'Zenith Sponsor',
    role: 'sponsor',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Zenebe%20Sponsor',
    profile: {
      bio: 'Brand Partnerships Manager',
      location: 'Addis Ababa, Ethiopia',
      verified: true,
      verificationDate: '2024-03-10',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'dark',
      language: 'en',
      twoFactorEnabled: false,
    },
    createdAt: '2024-03-10T09:00:00Z',
  },
];

/**
 * Authenticate user with email and password
 * Returns user without password if authentication succeeds
 */
export function authenticateUser(email: string, password: string): User | null {
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as any;
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | null {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as any;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | null {
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as any;
}


