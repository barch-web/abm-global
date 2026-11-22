import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';
import NewsClient from '@/components/NewsClient';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Announcements & Events | ABM Global Ltd Accra',
  description:
    'Stay updated on ABM Global Ltd training cohorts, CCTV workshops, hardware restocks, and IT advisory notices in Accra, Ghana.',
};

export default async function NewsPage() {
  const { siteContent, announcements, events, socialLinks } = await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#F2B705]">Announcements & Events</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Company Updates & Training Schedule
            </h1>
            <p className="text-base text-slate-200 leading-relaxed">
              Upcoming practical workshops, school IT teacher clinics, and service announcements from our Accra team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
            >
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${siteContent.contactPhoneTel}`}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F2B705]" />
              {siteContent.contactPhoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsClient announcements={announcements} events={events} />
        </div>
      </section>

      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
