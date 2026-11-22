import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res, req);
  return res;
}
