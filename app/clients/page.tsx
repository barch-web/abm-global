import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import PublicShell from '@/components/PublicShell';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Clients & Completed Projects | ABM Global Ltd',
  description:
    'See how ABM Global Ltd supports schools, logistics firms, clinics, and financial institutions across Accra and Tema with measurable IT outcomes.',
};

export default async function ClientsPage() {
  const { siteContent, clientsProjects, socialLinks } = await getPublicBundle();

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      <section className="bg-[#0B1F3A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#F2B705]">Our Clients & Projects</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Proven Delivery & Client Accountability
            </h1>
            <p className="text-base text-slate-200 leading-relaxed">
              Every project listed below was engineered, documented, and supported by our Accra technical team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/enquiry"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium transition-colors"
            >
              Start Your Project
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {clientsProjects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-[#F4F6F8] p-12 text-center">
              <p className="text-base font-medium text-[#0B1F3A]">
                Client case studies are currently being updated.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {clientsProjects.map((proj) => (
                <article
                  key={proj.id}
                  className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#0B1F3A]">{proj.sector}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Completed {proj.completed_year}
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold text-[#0B1F3A]">
                      {proj.client_name}
                    </h2>
                    <p className="text-base font-medium text-slate-800">{proj.project_title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{proj.summary}</p>

                    {proj.outcome_metric && (
                      <div className="pt-1 flex items-center gap-2 text-sm font-medium text-[#1E9E5A]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{proj.outcome_metric}</span>
                      </div>
                    )}
                  </div>

                  {proj.testimonial_quote && (
                    <div className="pt-5 border-t border-slate-100 space-y-2">
                      <blockquote className="text-sm text-slate-700 italic leading-relaxed">
                        “{proj.testimonial_quote}”
                      </blockquote>
                      {proj.testimonial_author && (
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-[#0B1F3A]">
                            {proj.testimonial_author}
                          </span>
                          {proj.testimonial_role ? ` · ${proj.testimonial_role}` : ''}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
