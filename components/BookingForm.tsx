'use client';

import { useState } from 'react';
import { CalendarCheck2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { bookingSchema, getTodayIsoDate } from '@/lib/security';

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '03:30 PM',
];

export default function BookingForm() {
  const today = getTodayIsoDate();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    preferred_date: today,
    preferred_time: TIME_SLOTS[0],
    visitors_count: 1,
    purpose: '',
    company_fax: '', // Honeypot
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    full_name: string;
    preferred_date: string;
    preferred_time: string;
    email: string;
    emailNotice?: string;
    sentToClient: boolean;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Please check your booking details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Unable to book consultation. Please check your entries.');
        return;
      }

      setConfirmation({
        id: data.booking.id,
        full_name: data.booking.full_name,
        preferred_date: data.booking.preferred_date,
        preferred_time: data.booking.preferred_time,
        email: data.booking.email,
        sentToClient: Boolean(data.emailResult?.sentToClient),
        emailNotice: data.emailResult?.notice,
      });
    } catch {
      setError('Network error while saving your consultation booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-[#1E9E5A]/30 bg-white p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 text-[#1E9E5A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#1E9E5A] uppercase tracking-wider">
              Booking Confirmed
            </p>
            <h3 className="text-2xl font-semibold text-[#0B1F3A]">
              Thank you, {confirmation.full_name}
            </h3>
            <p className="text-sm text-slate-600">
              Your consultation request has been registered with our Accra engineering desk.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#F4F6F8] border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Preferred Date</p>
            <p className="font-semibold text-[#0B1F3A] font-mono tabular-nums mt-0.5">
              {confirmation.preferred_date}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Preferred Time</p>
            <p className="font-semibold text-[#0B1F3A] mt-0.5">{confirmation.preferred_time}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Confirmation Email</p>
            <p className="font-medium text-[#0B1F3A] truncate mt-0.5">{confirmation.email}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          {confirmation.sentToClient
            ? `A confirmation email has been sent to ${confirmation.email} and our team has been notified.`
            : confirmation.emailNotice ||
              `Our team has received your booking in the admin schedule and will reach out via phone or ${confirmation.email}.`}
        </p>

        <button
          type="button"
          onClick={() => {
            setConfirmation(null);
            setForm({
              full_name: '',
              phone: '',
              email: '',
              preferred_date: today,
              preferred_time: TIME_SLOTS[0],
              visitors_count: 1,
              purpose: '',
              company_fax: '',
            });
          }}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-[#0B1F3A] hover:bg-[#F4F6F8] transition-colors cursor-pointer"
        >
          Book Another Consultation
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_fax">Company Fax</label>
        <input
          id="company_fax"
          name="company_fax"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company_fax}
          onChange={(e) => setForm({ ...form, company_fax: e.target.value })}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label htmlFor="full_name" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Full Name *
          </label>
          <input
            id="full_name"
            type="text"
            required
            placeholder="e.g., Akosua Boateng"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="booking_phone" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Phone Number *
          </label>
          <input
            id="booking_phone"
            type="tel"
            required
            placeholder="e.g., 059 460 7188"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="booking_email" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Email Address (Required for Confirmation) *
          </label>
          <input
            id="booking_email"
            type="email"
            required
            placeholder="you@organization.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="preferred_date" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Preferred Date *
          </label>
          <input
            id="preferred_date"
            type="date"
            required
            min={today}
            value={form.preferred_date}
            onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] font-mono tabular-nums focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="preferred_time" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Preferred Time (GMT) *
          </label>
          <select
            id="preferred_time"
            required
            value={form.preferred_time}
            onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="visitors_count" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Number of Visitors *
          </label>
          <input
            id="visitors_count"
            type="number"
            min={1}
            max={50}
            required
            value={form.visitors_count}
            onChange={(e) =>
              setForm({ ...form, visitors_count: Math.max(1, Number(e.target.value) || 1) })
            }
            className="w-full sm:w-44 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] font-mono tabular-nums focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
            Purpose of Consultation *
          </label>
          <textarea
            id="purpose"
            rows={4}
            required
            placeholder="Tell us what you want to discuss — e.g., office networking review, school computer lab training, IT audit scope, or CCTV planning."
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Past dates are blocked automatically. You will receive an on-screen and email confirmation.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] disabled:opacity-60 text-[#0B1F3A] text-[15px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming Booking…
            </>
          ) : (
            <>
              <CalendarCheck2 className="w-4 h-4" />
              Confirm Consultation Booking
            </>
          )}
        </button>
      </div>
    </form>
  );
}
