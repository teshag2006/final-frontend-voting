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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    id: 'contestant-001',
    email: 'contestant@example.com',
    password: 'Contestant@123456',
    name: 'John Contestant',
    role: 'contestant',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
  {
    id: 'media-001',
    email: 'media@example.com',
    password: 'Media@123456',
    name: 'Media Manager',
    role: 'media',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=media',
  },
  {
    id: 'voter-001',
    email: 'voter@example.com',
    password: 'Voter@123456',
    name: 'Emma Wilson',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
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

