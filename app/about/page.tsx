import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';
import SafeImage from '@/components/SafeImage';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About ABM Global Ltd | IT Engineering & Training in Accra',
  description:
    'Learn about ABM Global Ltd’s mission, vision, core values, and 4-step technical approach serving individuals, schools, and organizations in Accra, Ghana.',
};

export default async function AboutPage() {
  const { siteContent, socialLinks } = await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-sm font-medium text-[#F2B705]">
              About ABM Global Ltd · Accra, Ghana
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
              Dedicated to Your Technical Success, Safety & Profitability
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              {siteContent.aboutSummary}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-[15px] font-medium transition-colors"
              >
                Book a Consultation
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
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-white/15 aspect-[4/3]">
              <SafeImage
                src={siteContent.heroImageUrl}
                alt="ABM Global Ltd engineering team in Accra"
                priority
                fallbackTitle="ABM Global Ltd — Accra"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-[#F4F6F8] p-8 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Our Mission
            </p>
            <h2 className="text-2xl font-semibold text-[#0B1F3A]">
              Practical Technology That Keeps Working
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">{siteContent.mission}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F4F6F8] p-8 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Our Vision
            </p>
            <h2 className="text-2xl font-semibold text-[#0B1F3A]">
              Ghana’s Benchmark for Honest IT Partnership
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">{siteContent.vision}</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-[#F4F6F8] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-medium text-slate-500">What Guides Every Engineer</p>
            <h2 className="text-3xl font-semibold text-[#0B1F3A]">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {siteContent.values.map((val) => (
              <div
                key={val.title}
                className="rounded-xl bg-white border border-slate-200 p-6 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#1E9E5A] shrink-0" />
                  <h3 className="text-xl font-medium text-[#0B1F3A]">{val.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-medium text-slate-500">Technical Approach</p>
            <h2 className="text-3xl font-semibold text-[#0B1F3A]">
              How We Engineer, Train & Support
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteContent.technicalApproach.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-white p-6 space-y-3"
              >
                <span className="inline-block text-sm font-mono font-semibold text-[#0B1F3A] bg-[#F2B705] px-2.5 py-1 rounded-md tabular-nums">
                  {item.step}
                </span>
                <h3 className="text-xl font-medium text-[#0B1F3A]">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
