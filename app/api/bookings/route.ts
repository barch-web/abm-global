import { NextResponse } from 'next/server';
import {
  checkAndIncrementRateLimit,
  createBooking,
  markBookingConfirmationSent,
} from '@/lib/db';
import { dispatchBookingEmails } from '@/lib/email';
import { bookingSchema, getClientIp, sanitizeText } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rate = await checkAndIncrementRateLimit(`booking:${ip}`, {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000,
      lockMs: 15 * 60 * 1000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many booking attempts. Please wait ${Math.ceil(
            rate.retryAfterSeconds / 60
          )} minutes or call 059 460 7188.`,
        },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Please check all required fields.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const v = parsed.data;

    // Honeypot check
    if (v.company_fax && v.company_fax.trim().length > 0) {
      return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 });
    }

    const clean = {
      full_name: sanitizeText(v.full_name, 140),
      phone: sanitizeText(v.phone, 30),
      email: sanitizeText(v.email, 160).toLowerCase(),
      preferred_date: v.preferred_date,
      preferred_time: sanitizeText(v.preferred_time, 40),
      visitors_count: v.visitors_count,
      purpose: sanitizeText(v.purpose, 1200),
    };

    const booking = await createBooking(clean);
    const emailResult = await dispatchBookingEmails(booking);

    if (emailResult.sentToClient) {
      await markBookingConfirmationSent(booking.id);
      booking.confirmation_sent = true;
    }

    return NextResponse.json(
      {
        ok: true,
        booking,
        emailResult,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit consultation booking. Please try again or call 059 460 7188.' },
      { status: 400 }
    );
  }
}
