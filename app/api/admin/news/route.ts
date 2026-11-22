import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import {
  createAnnouncement,
  createEvent,
  deleteAnnouncement,
  deleteEvent,
  updateAnnouncement,
  updateEvent,
} from '@/lib/db';
import { isSafeUrl, sanitizeText, verifyRequestOrigin } from '@/lib/security';

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
    if (body?.kind === 'announcement') {
      const title = sanitizeText(body.title, 180);
      const summary = sanitizeText(body.summary, 400);
      const fullBody = sanitizeText(body.body, 3000);
      const category = sanitizeText(body.category, 60) || 'Company Update';
      if (title.length < 3 || summary.length < 5) {
        return NextResponse.json({ error: 'Title and summary are required.' }, { status: 400 });
      }
      const item = await createAnnouncement({
        title,
        summary,
        body: fullBody || summary,
        category,
        is_published: body.is_published !== false,
      });
      return NextResponse.json({ ok: true, item }, { status: 201 });
    }

    if (body?.kind === 'event') {
      const title = sanitizeText(body.title, 180);
      const eventDate = sanitizeText(body.event_date, 20);
      const eventTime = sanitizeText(body.event_time, 60) || '09:00 AM';
      const location = sanitizeText(body.location, 200);
      const description = sanitizeText(body.description, 2000);
      const rawLink = typeof body.registration_link === 'string' ? body.registration_link.trim() : '';
      const registrationLink = rawLink && isSafeUrl(rawLink) ? rawLink : '/book-consultation';
      if (title.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || location.length < 2) {
        return NextResponse.json({ error: 'Valid event title, date, and location are required.' }, { status: 400 });
      }
      const item = await createEvent({
        title,
        event_date: eventDate,
        event_time: eventTime,
        location,
        description,
        registration_link: registrationLink,
        is_published: body.is_published !== false,
      });
      return NextResponse.json({ ok: true, item }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported item kind.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to create item.' }, { status: 400 });
  }
}

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
    if (!id) return NextResponse.json({ error: 'Missing ID.' }, { status: 400 });

    if (body?.kind === 'announcement') {
      const patch: Record<string, unknown> = {};
      if (typeof body.title === 'string') patch.title = sanitizeText(body.title, 180);
      if (typeof body.summary === 'string') patch.summary = sanitizeText(body.summary, 400);
      if (typeof body.body === 'string') patch.body = sanitizeText(body.body, 3000);
      if (typeof body.category === 'string') patch.category = sanitizeText(body.category, 60);
      if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
      const updated = await updateAnnouncement(id, patch);
      if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, item: updated });
    }

    if (body?.kind === 'event') {
      const patch: Record<string, unknown> = {};
      if (typeof body.title === 'string') patch.title = sanitizeText(body.title, 180);
      if (typeof body.event_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.event_date)) {
        patch.event_date = body.event_date;
      }
      if (typeof body.event_time === 'string') patch.event_time = sanitizeText(body.event_time, 60);
      if (typeof body.location === 'string') patch.location = sanitizeText(body.location, 200);
      if (typeof body.description === 'string') patch.description = sanitizeText(body.description, 2000);
      if (typeof body.registration_link === 'string' && isSafeUrl(body.registration_link)) {
        patch.registration_link = body.registration_link.trim();
      }
      if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
      const updated = await updateEvent(id, patch);
      if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, item: updated });
    }

    return NextResponse.json({ error: 'Unsupported item kind.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update item.' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind');
  const id = url.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'Missing ID.' }, { status: 400 });

  if (kind === 'announcement') {
    const ok = await deleteAnnouncement(id);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  if (kind === 'event') {
    const ok = await deleteEvent(id);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  return NextResponse.json({ error: 'Unsupported item kind.' }, { status: 400 });
}
