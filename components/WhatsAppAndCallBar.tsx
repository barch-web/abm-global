'use client';

import { useState } from 'react';
import { MessageCircle, Phone, X, ArrowUpRight } from 'lucide-react';
import {
  buildWhatsAppUrl,
  PHONE_LOCAL_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_INTL_NUMBER,
  WHATSAPP_TOPICS,
} from '@/lib/security';

export default function WhatsAppAndCallBar({
  whatsappIntl = WHATSAPP_INTL_NUMBER,
  phoneDisplay = PHONE_LOCAL_DISPLAY,
  phoneTel = PHONE_TEL_LINK,
}: {
  whatsappIntl?: string;
  phoneDisplay?: string;
  phoneTel?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const telHref = phoneTel.startsWith('tel:') ? phoneTel : `tel:${phoneTel}`;

  return (
    <>
      {/* Floating WhatsApp Topic Picker (Desktop & Tablet + Triggerable on Mobile) */}
      <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3">
        {menuOpen && (
          <div
            role="dialog"
            aria-label="Choose a WhatsApp enquiry topic"
            className="w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#0B1F3A] text-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Chat on WhatsApp</p>
                <p className="text-xs text-slate-300">Select a topic to message our team</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close WhatsApp menu"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 divide-y divide-slate-100">
              {WHATSAPP_TOPICS.map((topic) => (
                <a
                  key={topic.id}
                  href={buildWhatsAppUrl(topic.message, whatsappIntl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1F3A] hover:bg-[#F4F6F8] transition-colors"
                >
                  <span>{topic.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#1E9E5A] shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Floating WhatsApp + Call Pill Pair */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href={telHref}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white text-[#0B1F3A] border border-slate-200 shadow-lg hover:bg-[#F4F6F8] text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Phone className="w-4 h-4 text-[#0B1F3A]" />
            Call {phoneDisplay}
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Open WhatsApp topic menu"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#1E9E5A] hover:bg-[#19874c] text-white shadow-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Us
          </button>
        </div>
      </div>

      {/* Fixed Mobile Call & WhatsApp Bar (48px height, strictly under 15% mobile sticky cap) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 h-12 bg-[#0B1F3A] border-t border-white/15 grid grid-cols-2">
        <a
          href={telHref}
          className="flex items-center justify-center gap-2 text-sm font-medium text-white hover:bg-white/10 transition-colors border-r border-white/15"
        >
          <Phone className="w-4 h-4 text-[#F2B705]" />
          Call {phoneDisplay}
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center gap-2 text-sm font-medium bg-[#1E9E5A] text-white hover:bg-[#19874c] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
      </div>
    </>
  );
}
