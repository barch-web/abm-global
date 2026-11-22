import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { getAdminOverviewBundle, updateEnquiryStatus } from '@/lib/db';
import { csvCell, verifyRequestOrigin } from '@/lib/security';
import type { EnquiryStatus } from '@/lib/types';

const VALID_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'closed'];

export async function GET(req: Request) {
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const { enquiries } = await getAdminOverviewBundle();

  if (url.searchParams.get('format') === 'csv') {
    const headers = [
      'ID',
      'Created At',
      'Status',
      'Organization / Name',
      'Specific Service',
      'Solution / Product',
      'Expected Start',
      'Expected End',
      'Phone',
      'Email',
      'Location',
      'Message',
    ];
    const rows = enquiries.map((e) =>
      [
        csvCell(e.id),
        csvCell(e.created_at),
        csvCell(e.status),
        csvCell(e.organization_name),
        csvCell(e.specific_service),
        csvCell(e.service_or_product),
        csvCell(e.expected_start_date),
        csvCell(e.expected_end_date),
        csvCell(e.phone),
        csvCell(e.email),
        csvCell(e.location),
        csvCell(e.message),
      ].join(',')
    );
    const csvContent = [headers.map(csvCell).join(','), ...rows].join('\n');
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="abm-enquiries-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({ enquiries });
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
    const status = body?.status as EnquiryStatus;
    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid enquiry ID or status.' }, { status: 400 });
    }
    const updated = await updateEnquiryStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, enquiry: updated });
  } catch {
    return NextResponse.json({ error: 'Unable to update enquiry.' }, { status: 400 });
  }
}
