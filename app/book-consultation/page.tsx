import type { Metadata } from 'next';
import { Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';
import BookingForm from '@/components/BookingForm';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Book a Consultation | ABM Global Ltd Accra',
  description:
    'Schedule an IT consultation with ABM Global Ltd in Accra for networking, IT training, hardware support, IT auditing, CCTV installation, or equipment procurement.',
};

export default async function BookConsultationPage() {
  const { siteContent, socialLinks } = await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-medium text-[#F2B705]">Book a Consultation</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            {siteContent.consultingHeadline}
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            {siteContent.consultingDescription}
          </p>
        </div>
      </section>

      <section className="py-14 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8">
            <BookingForm />
          </div>

          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1F3A]">
                Consultation Details
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#0B1F3A] shrink-0 mt-1" />
                  <span>{siteContent.consultingHours}</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#0B1F3A] shrink-0 mt-1" />
                  <span>{siteContent.officeAddress}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#0B1F3A] shrink-0" />
                  <a
                    href={`tel:${siteContent.contactPhoneTel}`}
                    className="font-medium text-[#0B1F3A] hover:underline font-mono tabular-nums"
                  >
                    {siteContent.contactPhoneDisplay}
                  </a>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1E9E5A]" />
                <h2 className="text-base font-semibold text-[#0B1F3A]">
                  What to Expect
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>1. Dedicated time with a lead ABM Global engineer.</li>
                <li>2. Honest technical assessment with no pushy upsells.</li>
                <li>3. Written scope & budget estimate following your visit.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
