import 'server-only';

import type { UserRole } from '@/lib/mock-users';
import type { ContestantGender } from '@/lib/contestant-gender';

export interface ServerAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  gender?: ContestantGender;
  avatar?: string;
  emailVerified?: boolean;
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
    emailVerified: true,
  },
  {
    id: 'contestant-001',
    email: 'contestant@example.com',
    password: 'Contestant@123456',
    name: 'Dawit Contestant',
    role: 'contestant',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Dawit%20Contestant',
    emailVerified: true,
  },
  {
    id: 'media-001',
    email: 'media@example.com',
    password: 'Media@123456',
    name: 'Media Manager',
    role: 'media',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hana%20Tesfaye',
    emailVerified: true,
  },
  {
    id: 'voter-001',
    email: 'voter@example.com',
    password: 'Voter@123456',
    name: 'Ruth Kebede',
    role: 'voter',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ruth%20Kebede',
    emailVerified: true,
  },
  {
    id: 'sponsor-001',
    email: 'sponsor@example.com',
    password: 'Sponsor@123456',
    name: 'Zenith Sponsor',
    role: 'sponsor',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Zenebe%20Sponsor',
    emailVerified: true,
  },
];

const RUNTIME_USERS: ServerUserRecord[] = [];
const PASSWORD_RESET_TOKENS = new Map<string, { email: string; expiresAt: number }>();
const EMAIL_CONFIRMATION_TOKENS = new Map<string, { email: string; expiresAt: number }>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function stripPassword(user: ServerUserRecord): ServerAuthUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function findMutableUserByEmail(email: string): ServerUserRecord | null {
  const normalized = normalizeEmail(email);
  const runtimeUser = RUNTIME_USERS.find((candidate) => candidate.email.toLowerCase() === normalized);
  if (runtimeUser) return runtimeUser;
  const seededUser = SERVER_USERS.find((candidate) => candidate.email.toLowerCase() === normalized);
  return seededUser || null;
}

export function verifyServerUser(email: string, password: string): ServerAuthUser | null {
  const normalizedEmail = normalizeEmail(email);
  const allUsers = [...SERVER_USERS, ...RUNTIME_USERS];
  const user = allUsers.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.password === password
  );

  if (!user) return null;
  return stripPassword(user);
}

function registerServerUser(
  role: Extract<UserRole, 'voter' | 'sponsor' | 'contestant'>,
  name: string,
  email: string,
  password: string,
  gender?: ContestantGender
): ServerAuthUser | null {
  const normalizedEmail = normalizeEmail(email);
  const exists = [...SERVER_USERS, ...RUNTIME_USERS].some(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail
  );

  if (exists) return null;

  const safeName = name.trim();
  const user: ServerUserRecord = {
    id: `${role}-runtime-${Date.now()}`,
    email: normalizedEmail,
    password,
    name: safeName || 'New Voter',
    role,
    ...(role === 'contestant' && gender ? { gender } : {}),
    avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(safeName || normalizedEmail)}`,
    emailVerified: false,
  };

  RUNTIME_USERS.push(user);
  return stripPassword(user);
}

export function registerServerVoter(name: string, email: string, password: string): ServerAuthUser | null {
  return registerServerUser('voter', name, email, password);
}

export function registerServerSponsor(name: string, email: string, password: string): ServerAuthUser | null {
  return registerServerUser('sponsor', name, email, password);
}

export function registerServerContestant(
  name: string,
  email: string,
  password: string,
  gender?: ContestantGender
): ServerAuthUser | null {
  return registerServerUser('contestant', name, email, password, gender);
}

export function getServerUserByEmail(email: string): ServerAuthUser | null {
  const user = findMutableUserByEmail(email);
  return user ? stripPassword(user) : null;
}

export function createPasswordResetToken(email: string): string | null {
  const user = findMutableUserByEmail(email);
  if (!user) return null;
  const token = generateToken('rst');
  PASSWORD_RESET_TOKENS.set(token, {
    email: user.email,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });
  return token;
}

export function resetServerUserPassword(email: string, token: string, newPassword: string): boolean {
  const normalizedEmail = normalizeEmail(email);
  const tokenRecord = PASSWORD_RESET_TOKENS.get(token);
  if (!tokenRecord) return false;
  if (tokenRecord.expiresAt < Date.now()) {
    PASSWORD_RESET_TOKENS.delete(token);
    return false;
  }
  if (normalizeEmail(tokenRecord.email) !== normalizedEmail) return false;

  const user = findMutableUserByEmail(normalizedEmail);
  if (!user) return false;
  user.password = newPassword;
  PASSWORD_RESET_TOKENS.delete(token);
  return true;
}

export function createEmailConfirmationToken(email: string): string | null {
  const user = findMutableUserByEmail(email);
  if (!user) return null;
  const token = generateToken('cnf');
  EMAIL_CONFIRMATION_TOKENS.set(token, {
    email: user.email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

export function confirmServerUserEmail(token: string): ServerAuthUser | null {
  const tokenRecord = EMAIL_CONFIRMATION_TOKENS.get(token);
  if (!tokenRecord) return null;
  if (tokenRecord.expiresAt < Date.now()) {
    EMAIL_CONFIRMATION_TOKENS.delete(token);
    return null;
  }
  const user = findMutableUserByEmail(tokenRecord.email);
  if (!user) return null;
  user.emailVerified = true;
  EMAIL_CONFIRMATION_TOKENS.delete(token);
  return stripPassword(user);
}


