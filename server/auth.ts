import crypto from 'crypto';

export interface AdminSecurityRecord {
  passwordHash: string;
  salt: string;
  lastUpdated: string;
}

// In-memory rate limiting against brute-force attacks
interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

// Active authenticated sessions: token -> expiry timestamp
const activeSessions = new Map<string, { createdAt: number; expiresAt: number }>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const attemptHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const attemptBuf = Buffer.from(attemptHash, 'hex');
    if (hashBuf.length !== attemptBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuf, attemptBuf);
  } catch {
    return false;
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remainingLockSeconds?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt) {
    return { allowed: true };
  }

  if (attempt.lockedUntil > now) {
    const remainingLockSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { allowed: false, remainingLockSeconds };
  }

  // If lockout expired, reset
  if (attempt.lockedUntil > 0 && attempt.lockedUntil <= now) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  let attempt = loginAttempts.get(ip);

  if (!attempt) {
    attempt = { count: 1, firstAttempt: now, lockedUntil: 0 };
    loginAttempts.set(ip, attempt);
    return { locked: false, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  // Reset count if beyond 15 mins since first attempt
  if (now - attempt.firstAttempt > LOCKOUT_MS) {
    attempt.count = 1;
    attempt.firstAttempt = now;
    attempt.lockedUntil = 0;
    return { locked: false, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  attempt.count += 1;
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_MS;
    return { locked: true, attemptsLeft: 0 };
  }

  return { locked: false, attemptsLeft: MAX_ATTEMPTS - attempt.count };
}

export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}

export function createSessionToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return token;
}

export function validateSessionToken(token?: string): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

export function revokeSessionToken(token?: string): void {
  if (token) {
    activeSessions.delete(token);
  }
}
