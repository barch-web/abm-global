import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';
import GalleryClient from '@/components/GalleryClient';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services Gallery | Installations, Labs & Hardware Work',
  description:
    'Browse ABM Global Ltd’s filterable project gallery covering Computer Training, Networking, Hardware Support, IT Auditing, CCTV Surveillance, and Equipment Procurement.',
};

export default async function GalleryPage() {
  const { siteContent, galleryCategories, galleryImages, socialLinks } =
    await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#F2B705]">Services Gallery</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Field Installations & Training Documentation
            </h1>
            <p className="text-base text-slate-200 leading-relaxed">
              Filter by service category and click any photograph to inspect full-size details.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/enquiry"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
            >
              Request a Quote
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
          <GalleryClient categories={galleryCategories} images={galleryImages} />
        </div>
      </section>

      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
