import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import {
  updateServiceItem,
  updateSiteContent,
  upsertSocialLinks,
} from '@/lib/db';
import { DEFAULT_SITE_CONTENT } from '@/lib/seed';
import { isSafeUrl, sanitizeText, verifyRequestOrigin } from '@/lib/security';
import type { SiteContentData, SocialLinkItem } from '@/lib/types';

export async function PUT(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body?.type === 'site_content' && body.data) {
      const d = body.data as Partial<SiteContentData>;
      const clean: SiteContentData = {
        ...DEFAULT_SITE_CONTENT,
        companyName: sanitizeText(d.companyName, 120) || DEFAULT_SITE_CONTENT.companyName,
        positioning: sanitizeText(d.positioning, 400) || DEFAULT_SITE_CONTENT.positioning,
        heroHeadline: sanitizeText(d.heroHeadline, 200) || DEFAULT_SITE_CONTENT.heroHeadline,
        heroSubheadline: sanitizeText(d.heroSubheadline, 400) || DEFAULT_SITE_CONTENT.heroSubheadline,
        heroImageUrl:
          typeof d.heroImageUrl === 'string' && isSafeUrl(d.heroImageUrl)
            ? d.heroImageUrl.trim()
            : DEFAULT_SITE_CONTENT.heroImageUrl,
        trustStats: Array.isArray(d.trustStats)
          ? d.trustStats.slice(0, 6).map((s, idx) => ({
              id: sanitizeText(s.id, 40) || `stat-${idx}`,
              label: sanitizeText(s.label, 80),
              value: sanitizeText(s.value, 30),
              context: sanitizeText(s.context, 80),
            }))
          : DEFAULT_SITE_CONTENT.trustStats,
        aboutSummary: sanitizeText(d.aboutSummary, 1600) || DEFAULT_SITE_CONTENT.aboutSummary,
        mission: sanitizeText(d.mission, 800) || DEFAULT_SITE_CONTENT.mission,
        vision: sanitizeText(d.vision, 800) || DEFAULT_SITE_CONTENT.vision,
        values: Array.isArray(d.values)
          ? d.values.slice(0, 8).map((v) => ({
              title: sanitizeText(v.title, 100),
              description: sanitizeText(v.description, 400),
            }))
          : DEFAULT_SITE_CONTENT.values,
        technicalApproach: Array.isArray(d.technicalApproach)
          ? d.technicalApproach.slice(0, 6).map((t, idx) => ({
              step: sanitizeText(t.step, 10) || `0${idx + 1}`,
              title: sanitizeText(t.title, 80),
              description: sanitizeText(t.description, 400),
            }))
          : DEFAULT_SITE_CONTENT.technicalApproach,
        consultingHeadline:
          sanitizeText(d.consultingHeadline, 200) || DEFAULT_SITE_CONTENT.consultingHeadline,
        consultingDescription:
          sanitizeText(d.consultingDescription, 600) || DEFAULT_SITE_CONTENT.consultingDescription,
        consultingHours:
          sanitizeText(d.consultingHours, 200) || DEFAULT_SITE_CONTENT.consultingHours,
        contactPhoneDisplay:
          sanitizeText(d.contactPhoneDisplay, 40) || DEFAULT_SITE_CONTENT.contactPhoneDisplay,
        contactPhoneTel:
          sanitizeText(d.contactPhoneTel, 30) || DEFAULT_SITE_CONTENT.contactPhoneTel,
        whatsappNumberIntl:
          sanitizeText(d.whatsappNumberIntl, 30) || DEFAULT_SITE_CONTENT.whatsappNumberIntl,
        contactEmail: sanitizeText(d.contactEmail, 160) || DEFAULT_SITE_CONTENT.contactEmail,
        officeAddress: sanitizeText(d.officeAddress, 240) || DEFAULT_SITE_CONTENT.officeAddress,
        cityRegion: sanitizeText(d.cityRegion, 120) || DEFAULT_SITE_CONTENT.cityRegion,
        googleMapsQuery:
          sanitizeText(d.googleMapsQuery, 200) || DEFAULT_SITE_CONTENT.googleMapsQuery,
        officeCoordinates:
          sanitizeText(d.officeCoordinates, 80) || DEFAULT_SITE_CONTENT.officeCoordinates,
      };
      const saved = await updateSiteContent(clean);
      return NextResponse.json({ ok: true, siteContent: saved });
    }

    if (body?.type === 'service' && body.data?.id) {
      const s = body.data;
      const updated = await updateServiceItem(String(s.id), {
        title: sanitizeText(s.title, 140),
        short_summary: sanitizeText(s.short_summary, 320),
        description: sanitizeText(s.description, 1600),
        target_audience: sanitizeText(s.target_audience, 200),
        deliverables: Array.isArray(s.deliverables)
          ? s.deliverables.map((d: unknown) => sanitizeText(d, 200)).filter(Boolean)
          : [],
        is_published: typeof s.is_published === 'boolean' ? s.is_published : true,
      });
      if (!updated) {
        return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, service: updated });
    }

    if (body?.type === 'social_links' && Array.isArray(body.data)) {
      const cleanLinks: SocialLinkItem[] = (body.data as SocialLinkItem[])
        .slice(0, 12)
        .filter((l) => typeof l.url === 'string' && isSafeUrl(l.url))
        .map((l, idx) => ({
          id: sanitizeText(l.id, 60) || `soc-${idx}`,
          platform: sanitizeText(l.platform, 40),
          label: sanitizeText(l.label, 100),
          url: l.url.trim(),
          is_active: Boolean(l.is_active),
          display_order: idx + 1,
        }));
      const saved = await upsertSocialLinks(cleanLinks);
      return NextResponse.json({ ok: true, socialLinks: saved });
    }

    return NextResponse.json({ error: 'Invalid content update payload.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update content.' }, { status: 400 });
  }
}
