import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { getAdminOverviewBundle, isSupabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const bundle = await getAdminOverviewBundle();
    return NextResponse.json(
      {
        ...bundle,
        storageMode: isSupabaseConfigured() ? 'supabase' : 'local',
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load admin overview.' }, { status: 500 });
  }
}
