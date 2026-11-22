import Link from 'next/link';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import type { SiteContentData } from '@/lib/types';
import { buildWhatsAppUrl } from '@/lib/security';

export default function CtaBanner({
  siteContent,
  heading = 'Ready for Dependable IT Support & Solutions in Accra?',
  subheading = 'Speak directly with an ABM Global Ltd engineer today for training, networking, hardware support, IT auditing, CCTV, or equipment procurement.',
}: {
  siteContent: SiteContentData;
  heading?: string;
  subheading?: string;
}) {
  const whatsappUrl = buildWhatsAppUrl(
    'Hello ABM Global Ltd, I would like to discuss an IT requirement for my home, school, or organization.',
    siteContent.whatsappNumberIntl
  );

  return (
    <section className="bg-[#0B1F3A] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#132C4E] border border-white/10 p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {heading}
            </h2>
            <p className="text-slate-200 leading-relaxed">{subheading}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/enquiry"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-[15px] font-medium transition-colors whitespace-nowrap"
            >
              Request a Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${siteContent.contactPhoneTel}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[15px] font-medium transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-[#F2B705]" />
              Call {siteContent.contactPhoneDisplay}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1E9E5A] hover:bg-[#19874c] text-white text-[15px] font-medium transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
