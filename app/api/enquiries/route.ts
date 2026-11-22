import { NextResponse } from 'next/server';
import { checkAndIncrementRateLimit, createEnquiry } from '@/lib/db';
import {
  buildWhatsAppUrl,
  enquirySchema,
  getClientIp,
  sanitizeText,
} from '@/lib/security';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rate = await checkAndIncrementRateLimit(`enquiry:${ip}`, {
      maxAttempts: 12,
      windowMs: 15 * 60 * 1000,
      lockMs: 15 * 60 * 1000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many enquiry submissions. Please try again in ${Math.ceil(
            rate.retryAfterSeconds / 60
          )} minutes or call 059 460 7188 directly.`,
        },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Please check all required fields.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const v = parsed.data;

    // Honeypot check: silently accept without saving to database
    if (v.website_url && v.website_url.trim().length > 0) {
      return NextResponse.json({ ok: true, id: 'ignored' }, { status: 200 });
    }

    const clean = {
      organization_name: sanitizeText(v.organization_name, 160),
      service_or_product: sanitizeText(v.service_or_product, 200),
      expected_start_date: v.expected_start_date,
      expected_end_date: v.expected_end_date,
      specific_service: sanitizeText(v.specific_service, 140),
      phone: sanitizeText(v.phone, 30),
      email: sanitizeText(v.email, 160).toLowerCase(),
      location: sanitizeText(v.location, 160),
      message: sanitizeText(v.message, 2000),
    };

    const whatsappSummary = [
      'Hello ABM Global Ltd, I would like to submit a business enquiry:',
      `Name / Organization: ${clean.organization_name}`,
      `Service Category: ${clean.specific_service}`,
      `Solution / Product Needed: ${clean.service_or_product}`,
      `Timeline: ${clean.expected_start_date} to ${clean.expected_end_date}`,
      `Location: ${clean.location}`,
      `Phone: ${clean.phone}`,
      `Email: ${clean.email}`,
      clean.message ? `Notes: ${clean.message}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = buildWhatsAppUrl(whatsappSummary);

    try {
      const saved = await createEnquiry(clean);
      return NextResponse.json({ ok: true, enquiry: saved, whatsappUrl }, { status: 201 });
    } catch {
      return NextResponse.json(
        {
          ok: false,
          dbError: true,
          whatsappUrl,
          error:
            'We could not record your enquiry in our database right now, but you can continue directly on WhatsApp.',
        },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
