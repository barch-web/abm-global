import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import { buildWhatsAppUrl, isSafeUrl } from '@/lib/security';
import PublicShell from '@/components/PublicShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us in Accra | ABM Global Ltd',
  description:
    'Contact ABM Global Ltd in Accra, Ghana. Call 059 460 7188, chat on WhatsApp, email our engineering team, or visit our Asylum Down office.',
};

export default async function ContactPage() {
  const { siteContent, socialLinks } = await getPublicBundle();
  const whatsappUrl = buildWhatsAppUrl(
    'Hello ABM Global Ltd, I would like to reach your Accra office.',
    siteContent.whatsappNumberIntl
  );
  const mapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteContent.officeAddress
  )}`;

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-medium text-[#F2B705]">Contact ABM Global Ltd</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            Speak Directly With Our Accra Team
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            Reach us by phone, WhatsApp, email, or visit our office in Asylum Down, Accra.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-[#F4F6F8] p-7 space-y-5">
              <h2 className="text-2xl font-semibold text-[#0B1F3A]">Direct Contact</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#0B1F3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Phone Line</p>
                    <a
                      href={`tel:${siteContent.contactPhoneTel}`}
                      className="text-base font-semibold text-[#0B1F3A] hover:underline font-mono tabular-nums"
                    >
                      {siteContent.contactPhoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#1E9E5A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp Business</p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-[#1E9E5A] hover:underline font-mono tabular-nums"
                    >
                      +{siteContent.whatsappNumberIntl}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#0B1F3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <a
                      href={`mailto:${siteContent.contactEmail}`}
                      className="text-base font-medium text-[#0B1F3A] hover:underline"
                    >
                      {siteContent.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0B1F3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Office Location</p>
                    <p className="text-sm font-medium text-[#0B1F3A]">
                      {siteContent.officeAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#0B1F3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Working Hours</p>
                    <p className="text-sm text-slate-700">{siteContent.consultingHours}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2.5">
                <Link
                  href="/enquiry"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
                >
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium transition-colors"
                >
                  Book Consultation
                </Link>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
                <h3 className="text-base font-semibold text-[#0B1F3A]">Social Channels</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {socialLinks
                    .filter((s) => s.is_active && isSafeUrl(s.url))
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 hover:bg-[#F4F6F8] text-sm font-medium text-[#0B1F3A] transition-colors"
                      >
                        <span>{link.platform}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Accra Map Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-[#0B1F3A] text-white overflow-hidden flex flex-col justify-between min-h-[420px]">
              <div className="p-8 space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-[#F2B705]">
                  Accra Service Hub · {siteContent.officeCoordinates}
                </p>
                <h2 className="text-2xl font-semibold">Visit Our Asylum Down Office</h2>
                <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                  Centrally located off Ring Road Central in Accra for rapid dispatch across Airport Residential, Osu, East Legon, Cantonments, Tema, and Spintex.
                </p>
              </div>

              {/* Clean architectural coordinate grid visual */}
              <div className="mx-8 rounded-xl bg-[#132C4E] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-3">
                  <span>{siteContent.cityRegion}</span>
                  <span className="font-mono tabular-nums">{siteContent.officeCoordinates}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F2B705] text-[#0B1F3A] flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{siteContent.companyName}</p>
                    <p className="text-sm text-slate-300">{siteContent.officeAddress}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-wrap items-center justify-between gap-4">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
                >
                  Open Directions in Google Maps
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={`tel:${siteContent.contactPhoneTel}`}
                  className="text-sm font-medium text-slate-200 hover:text-white"
                >
                  Need directions? Call {siteContent.contactPhoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
