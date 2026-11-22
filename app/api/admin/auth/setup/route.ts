import { NextResponse } from 'next/server';
import {
  attachSessionCookie,
  initializeAdminPassword,
  signAdminToken,
} from '@/lib/auth';
import { verifyRequestOrigin } from '@/lib/security';

export async function POST(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const password = typeof body?.password === 'string' ? body.password : '';
    const confirmPassword =
      typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const result = await initializeAdminPassword(password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    const token = signAdminToken();
    const res = NextResponse.json({ ok: true, token }, { status: 201 });
    attachSessionCookie(res, token, req);
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
