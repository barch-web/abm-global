import { NextResponse } from 'next/server';
import { changeAdminPassword, requireAdminSession } from '@/lib/auth';
import { verifyRequestOrigin } from '@/lib/security';

export async function POST(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
    }

    const result = await changeAdminPassword(currentPassword, newPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
