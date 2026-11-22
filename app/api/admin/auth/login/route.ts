import { NextResponse } from 'next/server';
import {
  attachSessionCookie,
  getAdminAuthStatus,
  signAdminToken,
  verifyAdminPassword,
} from '@/lib/auth';
import { checkAndIncrementRateLimit, clearRateLimit } from '@/lib/db';
import { getClientIp, verifyRequestOrigin } from '@/lib/security';

export async function POST(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const ip = getClientIp(req.headers);
  const limitKey = `admin_login:${ip}`;

  try {
    const status = await getAdminAuthStatus();
    if (!status.initialized) {
      return NextResponse.json(
        { error: 'Admin password has not been created yet. Complete first-time setup.' },
        { status: 400 }
      );
    }

    const rate = await checkAndIncrementRateLimit(limitKey, {
      maxAttempts: 6,
      windowMs: 15 * 60 * 1000,
      lockMs: 15 * 60 * 1000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account locked for ${Math.ceil(
            rate.retryAfterSeconds / 60
          )} minutes.`,
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const valid = await verifyAdminPassword(password);
    if (!valid) {
      return NextResponse.json(
        {
          error:
            rate.attemptsRemaining > 0
              ? `Incorrect password. ${rate.attemptsRemaining} attempts remaining before temporary lockout.`
              : 'Incorrect password. Temporary lockout activated.',
        },
        { status: 401 }
      );
    }

    await clearRateLimit(limitKey);
    const token = signAdminToken();
    const res = NextResponse.json({ ok: true, token }, { status: 200 });
    attachSessionCookie(res, token, req);
    return res;
  } catch {
    return NextResponse.json({ error: 'Unable to authenticate.' }, { status: 400 });
  }
}
