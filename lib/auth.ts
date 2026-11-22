import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  getAdminPasswordRecord,
  saveInitialAdminPasswordHash,
  updateAdminPasswordHash,
} from './db';

export const ADMIN_COOKIE_NAME = 'abm_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const BCRYPT_ROUNDS = 12;

// In-memory fallback secret for local preview if ADMIN_SESSION_SECRET is not set
const globalForSecret = globalThis as typeof globalThis & { __abmSessionSecret?: string };
function getSessionSecret(): string {
  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) return envSecret;
  if (!globalForSecret.__abmSessionSecret) {
    globalForSecret.__abmSessionSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalForSecret.__abmSessionSecret;
}

export interface AdminSessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
  jti: string;
}

export function signAdminToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    role: 'admin',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');

  const bufA = Buffer.from(providedSig);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AdminSessionPayload;
    if (parsed.role !== 'admin') return null;
    if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function attachSessionCookie(res: NextResponse, token: string, req: Request): void {
  const isHttps =
    req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
  const parts = [
    `${ADMIN_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.headers.append('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: NextResponse, req: Request): void {
  const isHttps =
    req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
  const parts = [
    `${ADMIN_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
  ];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.headers.append('Set-Cookie', parts.join('; '));
}

export async function getAdminAuthStatus(): Promise<{
  initialized: boolean;
  envOverrideActive: boolean;
}> {
  const envOverride = process.env.ADMIN_PASSWORD_OVERRIDE?.trim();
  if (envOverride && envOverride.length > 0) {
    return { initialized: true, envOverrideActive: true };
  }
  const record = await getAdminPasswordRecord();
  return {
    initialized: Boolean(record?.is_initialized),
    envOverrideActive: false,
  };
}

export async function initializeAdminPassword(password: string): Promise<{ ok: boolean; error?: string }> {
  const status = await getAdminAuthStatus();
  if (status.initialized) {
    return { ok: false, error: 'Admin setup is permanently locked because a password is already configured.' };
  }
  if (password.length < 8 || password.length > 128) {
    return { ok: false, error: 'Password must be between 8 and 128 characters.' };
  }
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const saved = await saveInitialAdminPasswordHash(hash);
  if (!saved) {
    return { ok: false, error: 'Admin password was already initialized.' };
  }
  return { ok: true };
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const envOverride = process.env.ADMIN_PASSWORD_OVERRIDE?.trim();
  if (envOverride && envOverride.length > 0) {
    const bufA = Buffer.from(password);
    const bufB = Buffer.from(envOverride);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  const record = await getAdminPasswordRecord();
  if (!record?.is_initialized || !record.password_hash) return false;
  return bcrypt.compare(password, record.password_hash);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const envOverride = process.env.ADMIN_PASSWORD_OVERRIDE?.trim();
  if (envOverride && envOverride.length > 0) {
    return {
      ok: false,
      error: 'Password is managed via ADMIN_PASSWORD_OVERRIDE environment variable.',
    };
  }
  const valid = await verifyAdminPassword(currentPassword);
  if (!valid) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return { ok: false, error: 'New password must be between 8 and 128 characters.' };
  }
  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await updateAdminPasswordHash(hash);
  return { ok: true };
}

export async function requireAdminSession(req?: Request): Promise<AdminSessionPayload | null> {
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const bearer = authHeader.slice(7).trim();
      const verified = verifyAdminToken(bearer);
      if (verified) return verified;
    }
  }
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}
