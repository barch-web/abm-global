import Link from 'next/link';
import { ArrowRight, Home, Layers, PhoneCall } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';

export default async function NotFoundPage() {
  const { siteContent, socialLinks } = await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="py-20 lg:py-28 bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="text-sm font-mono font-semibold text-[#0B1F3A] bg-[#F2B705] inline-block px-3 py-1 rounded-md tabular-nums">
            404 · Page Not Found
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#0B1F3A] tracking-tight">
            We Could Not Find That Page
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            The link you followed may have moved or does not exist. Use the links below to return to ABM Global Ltd’s main pages or contact our Accra team directly.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium transition-colors"
            >
              <Home className="w-4 h-4 text-[#F2B705]" />
              Back to Home
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
            >
              <Layers className="w-4 h-4" />
              View Services
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[#0B1F3A] text-sm font-medium transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
