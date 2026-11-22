import Link from 'next/link';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import type { SiteContentData, SocialLinkItem } from '@/lib/types';
import { buildWhatsAppUrl, isSafeUrl } from '@/lib/security';

interface SiteFooterProps {
  siteContent: SiteContentData;
  socialLinks: SocialLinkItem[];
}

export default function SiteFooter({ siteContent, socialLinks }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl(
    'Hello ABM Global Ltd, I visited your website and would like to speak with your IT team.',
    siteContent.whatsappNumberIntl
  );

  return (
    <footer className="bg-[#0B1F3A] text-slate-200 border-t border-white/10 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Company Positioning */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-xl font-semibold tracking-tight text-white"
            >
              {siteContent.companyName}
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              {siteContent.positioning}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href={`tel:${siteContent.contactPhoneTel}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#F2B705]" />
                {siteContent.contactPhoneDisplay}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1E9E5A] hover:bg-[#19874c] text-sm font-medium text-white transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide mb-4">
              Company & Proof
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-[#F2B705] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F2B705] transition-colors">
                  About Us & Approach
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#F2B705] transition-colors">
                  All IT Services
                </Link>
              </li>
              <li>
                <Link href="/clients" className="hover:text-[#F2B705] transition-colors">
                  Our Clients & Projects
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#F2B705] transition-colors">
                  Services Gallery
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#F2B705] transition-colors">
                  Announcements & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Leads & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide mb-4">
              Consultations & Quotes
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/enquiry" className="hover:text-[#F2B705] transition-colors">
                  Request a Quote or Enquiry
                </Link>
              </li>
              <li>
                <Link
                  href="/book-consultation"
                  className="hover:text-[#F2B705] transition-colors"
                >
                  Book a Consultation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F2B705] transition-colors">
                  Contact & Office Map
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#F2B705] transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Accra Office & Socials */}
          <div className="space-y-3 text-sm text-slate-300">
            <h3 className="text-sm font-semibold text-white tracking-wide mb-4">
              Accra Office
            </h3>
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#F2B705] shrink-0 mt-1" />
              <span>{siteContent.officeAddress}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#F2B705] shrink-0" />
              <a
                href={`mailto:${siteContent.contactEmail}`}
                className="hover:text-[#F2B705] transition-colors"
              >
                {siteContent.contactEmail}
              </a>
            </p>
            <p className="text-xs text-slate-400 pt-1">{siteContent.consultingHours}</p>

            {socialLinks.length > 0 && (
              <div className="pt-3 flex flex-wrap gap-3">
                {socialLinks
                  .filter((l) => l.is_active && isSafeUrl(l.url))
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-slate-300 hover:text-[#F2B705] underline underline-offset-4 transition-colors"
                    >
                      {link.platform}
                    </a>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {year} {siteContent.companyName}. All rights reserved. Accra, Ghana.
          </p>
          <p>
            IT Training · Networking · Hardware Support · IT Auditing · CCTV · Procurement
          </p>
        </div>
      </div>
    </footer>
  );
}
