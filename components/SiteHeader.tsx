'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, X } from 'lucide-react';
import { PHONE_LOCAL_DISPLAY, PHONE_TEL_LINK } from '@/lib/security';

const PRIMARY_NAV = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/clients', label: 'Clients' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News' },
];

const MOBILE_ALL_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/clients', label: 'Clients & Projects' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'Announcements & Events' },
  { href: '/book-consultation', label: 'Book a Consultation' },
  { href: '/enquiry', label: 'Request a Quote' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader({ companyName = 'ABM Global Ltd' }: { companyName?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Clean single-line brand wordmark */}
        <Link
          href="/"
          className="text-lg sm:text-xl font-semibold tracking-tight text-[#0B1F3A] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          {companyName}
        </Link>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700"
        >
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  active
                    ? 'text-[#0B1F3A] border-[#F2B705]'
                    : 'border-transparent hover:text-[#0B1F3A] hover:border-slate-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/enquiry"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-[15px] font-medium bg-[#F2B705] text-[#0B1F3A] rounded-lg hover:bg-[#F7C733] transition-colors whitespace-nowrap shrink-0"
          >
            Request Quote
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-[#0B1F3A] hover:bg-slate-50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <nav
            aria-label="Mobile navigation"
            className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 gap-1"
          >
            {MOBILE_ALL_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                    active
                      ? 'bg-[#0B1F3A] text-white'
                      : 'text-[#0B1F3A] hover:bg-[#F4F6F8]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={PHONE_TEL_LINK}
              className="mt-2 px-3 py-2.5 rounded-lg border border-slate-200 text-[#0B1F3A] font-medium text-[15px] flex items-center gap-2 hover:bg-[#F4F6F8]"
            >
              <Phone className="w-4 h-4 text-[#0B1F3A]" />
              Call {PHONE_LOCAL_DISPLAY}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
