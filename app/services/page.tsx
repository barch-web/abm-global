import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';
import SafeImage from '@/components/SafeImage';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'IT Services in Accra | Training, Networking, Auditing, CCTV & Procurement',
  description:
    'Explore ABM Global Ltd’s six core IT services in Accra: practical IT training, networking & troubleshooting, hardware & software support, IT auditing, CCTV installation, and procurement.',
};

export default async function ServicesPage() {
  const { siteContent, services, socialLinks } = await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14 lg:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <p className="text-sm font-medium text-[#F2B705]">Our Services</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            Complete IT Training, Infrastructure & Support Solutions
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            Whether you need hands-on training for staff and teachers, a clean network overhaul, an objective IT audit, or verified hardware procurement, every engagement is backed by accountable after-sale care.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/enquiry"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-[15px] font-medium transition-colors"
            >
              Request a Service Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${siteContent.contactPhoneTel}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[15px] font-medium transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F2B705]" />
              Call {siteContent.contactPhoneDisplay}
            </a>
          </div>

          {/* Quick Jump Index */}
          <div className="pt-4 flex flex-wrap gap-2">
            {services.map((svc, idx) => (
              <a
                key={svc.id}
                href={`#${svc.slug}`}
                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-medium text-white transition-colors whitespace-nowrap"
              >
                0{idx + 1}. {svc.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections for Each of the 6 Services */}
      <section className="py-16 bg-white divide-y divide-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((svc, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <article
                key={svc.id}
                id={svc.slug}
                className="scroll-mt-24 pt-12 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : ''}`}>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                    <SafeImage
                      src={svc.image_url}
                      alt={svc.title}
                      fallbackTitle={svc.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className={`lg:col-span-7 space-y-5 ${isEven ? 'lg:order-1' : ''}`}>
                  <div className="space-y-2">
                    <p className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                      0{idx + 1}. Ideal for: {svc.target_audience}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#0B1F3A]">
                      {svc.title}
                    </h2>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed">{svc.description}</p>

                  {svc.deliverables.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <h3 className="text-sm font-semibold text-[#0B1F3A] uppercase tracking-wider">
                        Key Deliverables
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {svc.deliverables.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-slate-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] shrink-0 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/enquiry?service=${encodeURIComponent(svc.title)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
                    >
                      Request Quote for This Service
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/book-consultation"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-[#F4F6F8] text-[#0B1F3A] text-sm font-medium transition-colors"
                    >
                      Book Consultation
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
