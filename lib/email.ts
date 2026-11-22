import type { BookingItem } from './types';
import { escapeHtml } from './security';

export interface EmailDispatchResult {
  sentToCompany: boolean;
  sentToClient: boolean;
  providerConfigured: boolean;
  notice?: string;
}

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || 'ABM Global Ltd <bookings@abmgloballtd.com>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function dispatchBookingEmails(booking: BookingItem): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const companyEmail =
    process.env.COMPANY_NOTIFICATION_EMAIL?.trim() || 'info@abmgloballtd.com';

  if (!apiKey) {
    return {
      sentToCompany: false,
      sentToClient: false,
      providerConfigured: false,
      notice:
        'Booking recorded in dashboard. Configure RESEND_API_KEY in environment variables to enable live email dispatch.',
    };
  }

  const safeName = escapeHtml(booking.full_name);
  const safeEmail = escapeHtml(booking.email);
  const safePhone = escapeHtml(booking.phone);
  const safeDate = escapeHtml(booking.preferred_date);
  const safeTime = escapeHtml(booking.preferred_time);
  const safePurpose = escapeHtml(booking.purpose);

  const companyHtml = `
    <div style="font-family: Arial, sans-serif; color: #0B1F3A; max-width: 600px; margin: 0 auto;">
      <h2 style="margin-bottom: 12px;">New Consultation Booking — ABM Global Ltd</h2>
      <p style="color: #334155;">A new consultation request has been submitted on the website.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><strong>Client Name</strong></td><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${safeName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><strong>Phone</strong></td><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${safePhone}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><strong>Email</strong></td><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${safeEmail}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><strong>Preferred Date</strong></td><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${safeDate} at ${safeTime}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><strong>Visitors</strong></td><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${booking.visitors_count}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;"><strong>Purpose</strong></td><td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${safePurpose}</td></tr>
      </table>
    </div>
  `;

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; color: #0B1F3A; max-width: 600px; margin: 0 auto;">
      <h2 style="margin-bottom: 12px;">Consultation Request Received — ABM Global Ltd</h2>
      <p>Dear ${safeName},</p>
      <p style="color: #334155; line-height: 1.6;">
        Thank you for booking a consultation with ABM Global Ltd in Accra. Our engineering team has received your request and will confirm availability shortly.
      </p>
      <div style="background: #F4F6F8; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Date:</strong> ${safeDate}</p>
        <p style="margin: 4px 0;"><strong>Time:</strong> ${safeTime}</p>
        <p style="margin: 4px 0;"><strong>Visitors:</strong> ${booking.visitors_count}</p>
        <p style="margin: 4px 0;"><strong>Purpose:</strong> ${safePurpose}</p>
      </div>
      <p style="color: #334155; line-height: 1.6;">
        Need immediate assistance? Call us on <strong>059 460 7188</strong> or chat on WhatsApp at <strong>+233 59 460 7188</strong>.
      </p>
      <p style="margin-top: 20px;">Warm regards,<br/><strong>ABM Global Ltd — Accra, Ghana</strong></p>
    </div>
  `;

  const [sentToCompany, sentToClient] = await Promise.all([
    sendResendEmail({
      to: companyEmail,
      subject: `New Consultation Booking: ${booking.full_name} (${booking.preferred_date})`,
      html: companyHtml,
      replyTo: booking.email,
    }),
    sendResendEmail({
      to: booking.email,
      subject: 'Your Consultation Request with ABM Global Ltd (Accra)',
      html: clientHtml,
      replyTo: companyEmail,
    }),
  ]);

  return {
    sentToCompany,
    sentToClient,
    providerConfigured: true,
  };
}
