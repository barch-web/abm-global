import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { updateBookingStatus } from '@/lib/db';
import { verifyRequestOrigin } from '@/lib/security';
import type { BookingStatus } from '@/lib/types';

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export async function PATCH(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    const status = body?.status as BookingStatus;
    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid booking ID or status.' }, { status: 400 });
    }
    const updated = await updateBookingStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, booking: updated });
  } catch {
    return NextResponse.json({ error: 'Unable to update booking.' }, { status: 400 });
  }
}
