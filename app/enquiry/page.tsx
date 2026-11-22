import type { Metadata } from 'next';
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import { buildWhatsAppUrl } from '@/lib/security';
import PublicShell from '@/components/PublicShell';
import EnquiryForm from '@/components/EnquiryForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request a Quote or Business Enquiry | ABM Global Ltd',
  description:
    'Submit a business enquiry or quotation request to ABM Global Ltd in Accra and continue directly on WhatsApp with pre-filled project details.',
};

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await searchParams;
  const { siteContent, services, socialLinks } = await getPublicBundle();
  const whatsappDirect = buildWhatsAppUrl(
    'Hello ABM Global Ltd, I would like to request a quotation.',
    siteContent.whatsappNumberIntl
  );

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-medium text-[#F2B705]">Request a Quote or Enquiry</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            Tell Us About Your Project, Training, or Hardware Needs
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            Fill out the enquiry form below. Once submitted, your request is logged in our system and opens directly in WhatsApp so an engineer can respond fast.
          </p>
        </div>
      </section>

      <section className="py-14 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8">
            <EnquiryForm
              services={services}
              defaultService={params.service}
              whatsappIntl={siteContent.whatsappNumberIntl}
            />
          </div>

          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1F3A]">
                Prefer to Speak Immediately?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Call our Accra engineering desk or open a direct WhatsApp chat anytime during business hours.
              </p>
              <div className="space-y-2.5">
                <a
                  href={`tel:${siteContent.contactPhoneTel}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#F2B705]" />
                  Call {siteContent.contactPhoneDisplay}
                </a>
                <a
                  href={whatsappDirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#1E9E5A] hover:bg-[#19874c] text-white text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Direct WhatsApp Chat
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1E9E5A]" />
                <h2 className="text-base font-semibold text-[#0B1F3A]">
                  Transparent Quotations
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We break down hardware specifications, labor, training hours, and warranty terms clearly so your team never faces hidden costs.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
