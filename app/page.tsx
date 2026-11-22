import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { getPublicBundle } from '@/lib/db';
import { buildWhatsAppUrl } from '@/lib/security';
import PublicShell from '@/components/PublicShell';
import SafeImage from '@/components/SafeImage';
import MotionReveal from '@/components/MotionReveal';
import CtaBanner from '@/components/CtaBanner';

export const dynamic = 'force-dynamic';

const PROBLEMS_SOLVED = [
  {
    problem: 'Poor After-Sale IT Service',
    solution:
      'Every project and hardware purchase comes with documented handover notes and responsive post-deployment support in Accra.',
  },
  {
    problem: 'Unaffordable Consultancy',
    solution:
      'Clear, fixed-scope advisory and itemized quotations tailored for Ghanaian SMEs, schools, NGOs, and individual professionals.',
  },
  {
    problem: 'Lack of Practical IT Training',
    solution:
      'Instructor-led, workstation-based labs for students, IT teachers, and corporate teams—focused on daily workplace skills.',
  },
  {
    problem: 'Unprofessional Infrastructure Installation',
    solution:
      'Structured Cat6/fiber cabling, labeled patch panels, neat conduit work, and clean server racks built to last.',
  },
  {
    problem: 'IT Audits With No Value for Money',
    solution:
      'Plain-English security, licensing, and asset audits paired with prioritized 30/60/90-day cost-saving remediation plans.',
  },
  {
    problem: 'Unreliable Sourcing of IT Equipment',
    solution:
      'Pre-tested, genuine laptops, servers, UPS units, and accessories backed by verified serials and local warranty care.',
  },
];

export default async function HomePage() {
  const bundle = await getPublicBundle();
  const {
    siteContent,
    services,
    galleryImages,
    galleryCategories,
    clientsProjects,
    announcements,
    events,
    socialLinks,
  } = bundle;

  const categoryMap = new Map(galleryCategories.map((c) => [c.id, c.name]));
  const whatsappHeroUrl = buildWhatsAppUrl(
    'Hello ABM Global Ltd, I would like to discuss IT support or solutions for my organization.',
    siteContent.whatsappNumberIntl
  );

  return (
    <PublicShell siteContent={siteContent} socialLinks={socialLinks}>
      {/* 1. Hero Section */}
      <section className="bg-[#0B1F3A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="text-sm font-medium text-[#F2B705]">
                Accra, Ghana · IT Training, Infrastructure & Support
              </div>

              <h1 className="text-4xl sm:text-[46px] lg:text-[52px] font-semibold leading-[1.15] tracking-tight text-white">
                {siteContent.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                {siteContent.heroSubheadline}
              </p>

              {/* Three required Hero Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/enquiry"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-[15px] font-medium transition-colors whitespace-nowrap"
                >
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg bg-white text-[#0B1F3A] hover:bg-slate-100 text-[15px] font-medium transition-colors whitespace-nowrap"
                >
                  Book a Consultation
                </Link>
                <a
                  href={whatsappHeroUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg bg-[#1E9E5A] hover:bg-[#19874c] text-white text-[15px] font-medium transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Direct visible phone call link */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <a
                  href={`tel:${siteContent.contactPhoneTel}`}
                  className="inline-flex items-center gap-2 text-white hover:text-[#F2B705] font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#F2B705]" />
                  Direct Line: <span className="font-mono tabular-nums">{siteContent.contactPhoneDisplay}</span>
                </a>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>Serving Individuals, Schools & Organizations</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-[#132C4E] shadow-xl aspect-[16/10] lg:aspect-auto">
                <SafeImage
                  src={siteContent.heroImageUrl}
                  alt="ABM Global Ltd engineers collaborating inside modern Accra IT operations hub"
                  priority
                  fallbackTitle="ABM Global Ltd — Accra IT Engineering"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip (Editable by Admin) */}
      <section aria-label="Company track record" className="bg-[#F4F6F8] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {siteContent.trustStats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-1"
              >
                <p className="text-3xl sm:text-4xl font-semibold text-[#0B1F3A] font-mono tabular-nums">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-[#0B1F3A]">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Six Service Cards */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium text-slate-500">Core Capabilities</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
                Six Disciplined IT Services Under One Roof
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0B1F3A] hover:underline underline-offset-4 whitespace-nowrap"
            >
              Explore all service details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, idx) => (
              <MotionReveal key={service.id} delay={idx * 0.04}>
                <article className="h-full rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                    <SafeImage
                      src={service.image_url}
                      alt={service.title}
                      fallbackTitle={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2.5">
                      <p className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                        0{idx + 1}. {service.target_audience}
                      </p>
                      <h3 className="text-xl font-medium text-[#0B1F3A] leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {service.short_summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Link
                        href={`/services#${service.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0B1F3A] hover:text-[#132C4E]"
                      >
                        Service details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/enquiry?service=${encodeURIComponent(service.title)}`}
                        className="text-sm font-medium text-[#0B1F3A] underline decoration-[#F2B705] decoration-2 underline-offset-4 hover:opacity-80"
                      >
                        Request quote
                      </Link>
                    </div>
                  </div>
                </article>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose ABM Global — Problems We Solve */}
      <section className="py-16 lg:py-20 bg-[#F4F6F8] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-2.5">
            <p className="text-sm font-medium text-slate-500">Why Choose ABM Global Ltd</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
              Built to Fix What Clients Dislike About Typical IT Vendors
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Our engineers are dedicated to your operational success, data safety, and long-term profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROBLEMS_SOLVED.map((item) => (
              <div
                key={item.problem}
                className="rounded-xl bg-white border border-slate-200 p-6 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#1E9E5A] shrink-0 mt-0.5" />
                  <h3 className="text-lg font-medium text-[#0B1F3A]">{item.problem}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Our Approach in 4 Steps */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium text-slate-500">How We Work</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
                A Disciplined 4-Step Delivery Model
              </h2>
            </div>
            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              Start with an Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteContent.technicalApproach.map((phase) => (
              <div
                key={phase.step}
                className="rounded-xl border border-slate-200 bg-[#F4F6F8]/60 p-6 space-y-3"
              >
                <span className="inline-block text-sm font-mono font-semibold text-[#0B1F3A] bg-[#F2B705] px-2.5 py-1 rounded-md tabular-nums">
                  {phase.step}
                </span>
                <h3 className="text-xl font-medium text-[#0B1F3A]">{phase.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery Preview */}
      <section className="py-16 lg:py-20 bg-[#F4F6F8] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium text-slate-500">Field Documentation</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
                Inside Our Training Labs & Installations
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0B1F3A] hover:underline underline-offset-4 whitespace-nowrap"
            >
              Open full gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.slice(0, 6).map((img) => (
              <Link
                key={img.id}
                href="/gallery"
                className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <SafeImage
                    src={img.image_url}
                    alt={img.title}
                    fallbackTitle={img.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs text-slate-500">
                    {categoryMap.get(img.category_id) || 'Field Work'}
                  </p>
                  <p className="text-sm font-medium text-[#0B1F3A] line-clamp-1">{img.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Client Proof & Testimonials */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium text-slate-500">Clients & Outcomes</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
                Trusted by Schools, SMEs & Institutions Across Ghana
              </h2>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0B1F3A] hover:underline underline-offset-4 whitespace-nowrap"
            >
              View all client projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {clientsProjects.slice(0, 3).map((proj) => (
              <article
                key={proj.id}
                className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-[#0B1F3A]">{proj.sector}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{proj.completed_year}</span>
                  </div>
                  <h3 className="text-lg font-medium text-[#0B1F3A]">{proj.client_name}</h3>
                  <p className="text-sm font-medium text-slate-700">{proj.project_title}</p>
                  {proj.outcome_metric && (
                    <p className="text-xs font-medium text-[#1E9E5A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {proj.outcome_metric}
                    </p>
                  )}
                  {proj.testimonial_quote && (
                    <blockquote className="pt-2 text-sm text-slate-600 italic leading-relaxed border-t border-slate-100">
                      “{proj.testimonial_quote}”
                    </blockquote>
                  )}
                </div>
                {proj.testimonial_author && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-[#0B1F3A]">{proj.testimonial_author}</span>
                    {proj.testimonial_role ? ` — ${proj.testimonial_role}` : ''}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Latest Announcements & Upcoming Events */}
      <section className="py-16 lg:py-20 bg-[#F4F6F8] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium text-slate-500">News & Training Calendar</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
                Latest Announcements & Upcoming Events
              </h2>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0B1F3A] hover:underline underline-offset-4 whitespace-nowrap"
            >
              See all news & events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#0B1F3A]">Announcements</h3>
              {announcements.slice(0, 2).map((ann) => (
                <article
                  key={ann.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-[#0B1F3A]">{ann.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={ann.published_at} className="font-mono tabular-nums">
                      {ann.published_at.slice(0, 10)}
                    </time>
                  </div>
                  <h4 className="text-base font-semibold text-[#0B1F3A]">{ann.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{ann.summary}</p>
                </article>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#0B1F3A]">Upcoming Events</h3>
              {events.slice(0, 2).map((evt) => (
                <article
                  key={evt.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[#0B1F3A] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#F2B705]" />
                      {evt.event_date}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{evt.event_time}</span>
                  </div>
                  <h4 className="text-base font-semibold text-[#0B1F3A]">{evt.title}</h4>
                  <p className="text-sm text-slate-600">{evt.description}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {evt.location}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final Call-to-Action Banner */}
      <CtaBanner siteContent={siteContent} />
    </PublicShell>
  );
}
