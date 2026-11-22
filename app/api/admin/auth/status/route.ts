import { NextResponse } from 'next/server';
import { getAdminAuthStatus, requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const [status, session] = await Promise.all([
    getAdminAuthStatus(),
    requireAdminSession(req),
  ]);

  return NextResponse.json(
    {
      initialized: status.initialized,
      envOverrideActive: status.envOverrideActive,
      authenticated: Boolean(session),
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
