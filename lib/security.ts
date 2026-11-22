import { z } from 'zod';

export const WHATSAPP_INTL_NUMBER = '233594607188';
export const PHONE_LOCAL_DISPLAY = '059 460 7188';
export const PHONE_TEL_LINK = 'tel:0594607188';

export const WHATSAPP_TOPICS = [
  {
    id: 'training',
    label: 'Computer Training',
    message:
      'Hello ABM Global Ltd, I would like to enquire about your Computer and IT Training programs.',
  },
  {
    id: 'networking',
    label: 'Networking and Troubleshooting',
    message:
      'Hello ABM Global Ltd, I need assistance with Networking and Troubleshooting.',
  },
  {
    id: 'auditing',
    label: 'IT Auditing',
    message:
      'Hello ABM Global Ltd, I would like to request an IT Audit for our organization.',
  },
  {
    id: 'cctv',
    label: 'CCTV Installation and Surveillance',
    message:
      'Hello ABM Global Ltd, I am interested in CCTV Installation and Surveillance systems or training.',
  },
  {
    id: 'procurement',
    label: 'Computer and Accessories Procurement',
    message:
      'Hello ABM Global Ltd, I would like a quotation for Computer and Accessories Procurement.',
  },
  {
    id: 'general',
    label: 'General Enquiries',
    message:
      'Hello ABM Global Ltd, I have a general IT enquiry and would like to speak with your team.',
  },
] as const;

export function buildWhatsAppUrl(message: string, phoneIntl = WHATSAPP_INTL_NUMBER): string {
  const cleanNumber = phoneIntl.replace(/[^\d]/g, '') || WHATSAPP_INTL_NUMBER;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  const formulaSafe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${formulaSafe.replace(/"/g, '""')}"`;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;

export const enquirySchema = z
  .object({
    organization_name: z.string().trim().min(2, 'Please enter an individual, group, or organization name.').max(160),
    service_or_product: z.string().trim().min(2, 'Please specify the service, solution, or product needed.').max(200),
    expected_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid start date.'),
    expected_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid end date.'),
    specific_service: z.string().trim().min(2, 'Please select a specific service.').max(140),
    phone: z.string().trim().regex(phoneRegex, 'Please enter a valid contact phone number.'),
    email: z.string().trim().email('Please enter a valid email address.').max(160),
    location: z.string().trim().min(2, 'Please enter your location (e.g. East Legon, Accra).').max(160),
    message: z.string().trim().max(2000).optional().default(''),
    website_url: z.string().optional().default(''), // Honeypot
  })
  .refine((data) => data.expected_end_date >= data.expected_start_date, {
    message: 'Expected end date cannot be earlier than the start date.',
    path: ['expected_end_date'],
  });

export const bookingSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Please enter your full name.').max(140),
    phone: z.string().trim().regex(phoneRegex, 'Please enter a valid phone number.'),
    email: z.string().trim().email('A valid email is required to send your booking confirmation.').max(160),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a preferred date.'),
    preferred_time: z.string().trim().min(2, 'Please select a preferred time.').max(40),
    visitors_count: z.coerce.number().int().min(1, 'At least 1 visitor required.').max(50, 'Maximum 50 visitors per session.'),
    purpose: z.string().trim().min(5, 'Please briefly describe the purpose of your visit.').max(1200),
    company_fax: z.string().optional().default(''), // Honeypot
  })
  .refine((data) => data.preferred_date >= getTodayIsoDate(), {
    message: 'Preferred consultation date cannot be in the past.',
    path: ['preferred_date'],
  });

export function inspectImageMagicBytes(
  buffer: Uint8Array,
  declaredMime: string
): { valid: boolean; ext: 'jpg' | 'png' | 'webp' | null; mime: string | null } {
  if (buffer.length < 12) {
    return { valid: false, ext: null, mime: null };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    if (declaredMime === 'image/jpeg' || declaredMime === 'image/jpg') {
      return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
    }
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    if (declaredMime === 'image/png') {
      return { valid: true, ext: 'png', mime: 'image/png' };
    }
  }
  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    if (declaredMime === 'image/webp') {
      return { valid: true, ext: 'webp', mime: 'image/webp' };
    }
  }
  return { valid: false, ext: null, mime: null };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim().slice(0, 64) || 'unknown';
  }
  return headers.get('x-real-ip')?.trim().slice(0, 64) || 'local';
}

export function verifyRequestOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const requestedWith = req.headers.get('x-requested-with');

  // If no Origin header (e.g. same-origin curl/server or certain browsers), require custom header or matching host
  if (!origin) {
    return requestedWith === 'ABM-Admin-Client' || Boolean(host);
  }
  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) return true;
  } catch {
    return false;
  }

  const allowedEnv = process.env.ALLOWED_ORIGINS || '';
  if (allowedEnv) {
    const allowlist = allowedEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowlist.includes(origin)) return true;
  }
  return false;
}
