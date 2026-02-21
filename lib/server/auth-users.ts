import 'server-only';

import type { UserRole } from '@/lib/mock-users';

export interface ServerAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface ServerUserRecord extends ServerAuthUser {
  password: string;
}

// Server-only mock credentials. Never import this file in client components.
const SERVER_USERS: ServerUserRecord[] = [
  {
    id: 'admin-001',
    email: 'admin@votingplatform.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Alemu%20Admin',
  },
  {
    id: 'contestant-001',
    email: 'contestant@example.com',
    password: 'Contestant@123456',
    name: 'Dawit Contestant',
    role: 'contestant',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Dawit%20Contestant',
  },
  {
    id: 'media-001',
    email: 'media@example.com',
    password: 'Media@123456',
    name: 'Media Manager',
    role: 'media',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hana%20Tesfaye',
  },
  {
    id: 'voter-001',
    email: 'voter@example.com',
    password: 'Voter@123456',
    name: 'Ruth Kebede',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ruth%20Kebede',
  },
  {
    id: 'sponsor-001',
    email: 'sponsor@example.com',
    password: 'Sponsor@123456',
    name: 'Zenith Sponsor',
    role: 'sponsor',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Zenebe%20Sponsor',
  },
];

export function verifyServerUser(email: string, password: string): ServerAuthUser | null {
  const user = SERVER_USERS.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password
  );

  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}


