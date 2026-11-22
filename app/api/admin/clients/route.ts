import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import {
  createClientProject,
  deleteClientProject,
  updateClientProject,
} from '@/lib/db';
import { sanitizeText, verifyRequestOrigin } from '@/lib/security';

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
    const clientName = sanitizeText(body?.client_name, 140);
    const sector = sanitizeText(body?.sector, 80);
    const projectTitle = sanitizeText(body?.project_title, 180);
    const summary = sanitizeText(body?.summary, 1000);
    if (clientName.length < 2 || projectTitle.length < 3 || summary.length < 5) {
      return NextResponse.json({ error: 'Client name, project title, and summary are required.' }, { status: 400 });
    }
    const item = await createClientProject({
      client_name: clientName,
      sector: sector || 'Enterprise',
      project_title: projectTitle,
      summary,
      outcome_metric: sanitizeText(body?.outcome_metric, 140),
      testimonial_quote: sanitizeText(body?.testimonial_quote, 600),
      testimonial_author: sanitizeText(body?.testimonial_author, 100),
      testimonial_role: sanitizeText(body?.testimonial_role, 120),
      completed_year: Number(body?.completed_year) || new Date().getFullYear(),
      is_published: body?.is_published !== false,
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create client project.' }, { status: 400 });
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

    const patch: Record<string, unknown> = {};
    if (typeof body.client_name === 'string') patch.client_name = sanitizeText(body.client_name, 140);
    if (typeof body.sector === 'string') patch.sector = sanitizeText(body.sector, 80);
    if (typeof body.project_title === 'string') patch.project_title = sanitizeText(body.project_title, 180);
    if (typeof body.summary === 'string') patch.summary = sanitizeText(body.summary, 1000);
    if (typeof body.outcome_metric === 'string') patch.outcome_metric = sanitizeText(body.outcome_metric, 140);
    if (typeof body.testimonial_quote === 'string') patch.testimonial_quote = sanitizeText(body.testimonial_quote, 600);
    if (typeof body.testimonial_author === 'string') patch.testimonial_author = sanitizeText(body.testimonial_author, 100);
    if (typeof body.testimonial_role === 'string') patch.testimonial_role = sanitizeText(body.testimonial_role, 120);
    if (body.completed_year !== undefined) patch.completed_year = Number(body.completed_year) || 2026;
    if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;

    const updated = await updateClientProject(id, patch);
    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item: updated });
  } catch {
    return NextResponse.json({ error: 'Unable to update client project.' }, { status: 400 });
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
  const id = url.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'Missing ID.' }, { status: 400 });
  const ok = await deleteClientProject(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
}
