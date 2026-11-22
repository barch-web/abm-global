import { NextResponse } from 'next/server';
import { getPublicBundle } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bundle = await getPublicBundle();
    return NextResponse.json(bundle, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load website content at the moment.' },
      { status: 500 }
    );
  }
}
