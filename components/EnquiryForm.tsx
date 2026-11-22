'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, MessageCircle, Loader2, ArrowUpRight } from 'lucide-react';
import { buildWhatsAppUrl, enquirySchema, getTodayIsoDate } from '@/lib/security';
import type { ServiceItem } from '@/lib/types';

interface EnquiryFormProps {
  services: ServiceItem[];
  defaultService?: string;
  whatsappIntl?: string;
}

export default function EnquiryForm({
  services,
  defaultService = '',
  whatsappIntl = '233594607188',
}: EnquiryFormProps) {
  const today = getTodayIsoDate();
  const [form, setForm] = useState({
    organization_name: '',
    service_or_product: '',
    expected_start_date: today,
    expected_end_date: today,
    specific_service: defaultService || (services[0]?.title ?? 'IT Training (Basic & General Knowledge)'),
    phone: '',
    email: '',
    location: '',
    message: '',
    website_url: '', // Honeypot
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    savedToDb: boolean;
    whatsappUrl: string;
    notice?: string;
  } | null>(null);

  function buildClientWhatsAppFallback() {
    const summary = [
      'Hello ABM Global Ltd, I would like to submit a business enquiry:',
      `Name / Organization: ${form.organization_name}`,
      `Service Category: ${form.specific_service}`,
      `Solution / Product Needed: ${form.service_or_product}`,
      `Timeline: ${form.expected_start_date} to ${form.expected_end_date}`,
      `Location: ${form.location}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      form.message ? `Notes: ${form.message}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    return buildWhatsAppUrl(summary, whatsappIntl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const parsed = enquirySchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Please check the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.dbError && data?.whatsappUrl) {
          setResult({
            savedToDb: false,
            whatsappUrl: data.whatsappUrl,
            notice:
              data.error ||
              'Our database is momentarily busy, but your enquiry details are ready on WhatsApp.',
          });
          window.location.assign(data.whatsappUrl);
          return;
        }
        setError(data?.error || 'Unable to submit enquiry. Please review your details.');
        return;
      }

      const targetUrl = data.whatsappUrl || buildClientWhatsAppFallback();
      setResult({
        savedToDb: true,
        whatsappUrl: targetUrl,
      });
      window.location.assign(targetUrl);
    } catch {
      const fallbackUrl = buildClientWhatsAppFallback();
      setResult({
        savedToDb: false,
        whatsappUrl: fallbackUrl,
        notice:
          'We could not reach our server to log the enquiry, so we are opening WhatsApp directly with your details.',
      });
      window.location.assign(fallbackUrl);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* Honeypot field hidden from human visitors */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website_url}
          onChange={(e) => setForm({ ...form, website_url: e.target.value })}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-4 text-sm space-y-3 ${
            result.savedToDb
              ? 'border-[#1E9E5A]/30 bg-[#1E9E5A]/10 text-[#0B1F3A]'
              : 'border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {result.savedToDb ? (
              <CheckCircle2 className="w-5 h-5 text-[#1E9E5A] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">
                {result.savedToDb
                  ? 'Enquiry saved! Redirecting you to WhatsApp…'
                  : 'Proceeding directly to WhatsApp'}
              </p>
              <p className="text-slate-700">
                {result.notice ||
                  'Your enquiry has been logged for our Accra team. If WhatsApp did not open automatically, click the button below.'}
              </p>
            </div>
          </div>
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E9E5A] hover:bg-[#19874c] text-white font-medium text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Continue to WhatsApp Now
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label
            htmlFor="organization_name"
            className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
          >
            Individual, Group, or Organization Name *
          </label>
          <input
            id="organization_name"
            type="text"
            required
            placeholder="e.g., Kwame Mensah / Ridgeway Preparatory School"
            value={form.organization_name}
            onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="specific_service"
            className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
          >
            Specific Service Requested *
          </label>
          <select
            id="specific_service"
            required
            value={form.specific_service}
            onChange={(e) => setForm({ ...form, specific_service: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
          >
            {services.map((svc) => (
              <option key={svc.id} value={svc.title}>
                {svc.title}
              </option>
            ))}
            <option value="Custom Multi-Service IT Package">Custom Multi-Service IT Package</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="service_or_product"
            className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
          >
            Service, Solution, or Product Needed *
          </label>
          <input
            id="service_or_product"
            type="text"
            required
            placeholder="e.g., 15 Laptops + Cat6 LAN Setup or CCTV for 8-Room Office"
            value={form.service_or_product}
            onChange={(e) => setForm({ ...form, service_or_product: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="expected_start_date"
            className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
          >
            Expected Start Date *
          </label>
          <input
            id="expected_start_date"
            type="date"
            required
            value={form.expected_start_date}
            onChange={(e) => setForm({ ...form, expected_start_date: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] font-mono tabular-nums focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="expected_end_date"
            className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
          >
            Expected End Date *
          </label>
          <input
            id="expected_end_date"
            type="date"
            required
            min={form.expected_start_date}
            value={form.expected_end_date}
            onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] font-mono tabular-nums focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Contact Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="e.g., 059 460 7188"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@organization.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Site / Training Location *
          </label>
          <input
            id="location"
            type="text"
            required
            placeholder="e.g., East Legon, Accra / Tema Community 11"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Additional Message or Specifications
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Share device quantities, room count, participant numbers, or specific technical requirements..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Your enquiry is saved securely and opens directly in WhatsApp (+233 59 460 7188) with all details pre-filled.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] disabled:opacity-60 text-[#0B1F3A] text-[15px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving & Opening WhatsApp…
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              Submit Enquiry & Open WhatsApp
            </>
          )}
        </button>
      </div>
    </form>
  );
}
