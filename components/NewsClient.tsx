'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { AnnouncementItem, EventItem } from '@/lib/types';

export default function NewsClient({
  announcements,
  events,
}: {
  announcements: AnnouncementItem[];
  events: EventItem[];
}) {
  const [tab, setTab] = useState<'all' | 'announcements' | 'events'>('all');

  return (
    <div className="space-y-10">
      <div
        role="tablist"
        aria-label="Filter announcements and events"
        className="inline-flex flex-wrap items-center gap-2 p-1.5 bg-[#F4F6F8] rounded-xl border border-slate-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === 'all'
              ? 'bg-[#0B1F3A] text-white shadow-sm'
              : 'text-slate-700 hover:text-[#0B1F3A]'
          }`}
        >
          All Updates ({announcements.length + events.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'announcements'}
          onClick={() => setTab('announcements')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === 'announcements'
              ? 'bg-[#0B1F3A] text-white shadow-sm'
              : 'text-slate-700 hover:text-[#0B1F3A]'
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'events'}
          onClick={() => setTab('events')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            tab === 'events'
              ? 'bg-[#0B1F3A] text-white shadow-sm'
              : 'text-slate-700 hover:text-[#0B1F3A]'
          }`}
        >
          Upcoming Events ({events.length})
        </button>
      </div>

      {(tab === 'all' || tab === 'events') && (
        <section aria-labelledby="events-heading" className="space-y-5">
          <h2 id="events-heading" className="text-2xl font-semibold text-[#0B1F3A]">
            Upcoming Training Cohorts & Events
          </h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-600 bg-[#F4F6F8] p-6 rounded-xl border border-slate-200">
              No upcoming events scheduled right now. Contact us to arrange a private group training session.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => (
                <article
                  key={evt.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1.5 text-[#0B1F3A] font-mono tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-[#F2B705]" />
                        {evt.event_date}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{evt.event_time}</span>
                    </div>
                    <h3 className="text-xl font-medium text-[#0B1F3A]">{evt.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{evt.description}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {evt.location}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={evt.registration_link || '/book-consultation'}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium transition-colors"
                    >
                      Reserve Seat or Enquire
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {(tab === 'all' || tab === 'announcements') && (
        <section aria-labelledby="announcements-heading" className="space-y-5">
          <h2 id="announcements-heading" className="text-2xl font-semibold text-[#0B1F3A]">
            Company Announcements
          </h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-slate-600 bg-[#F4F6F8] p-6 rounded-xl border border-slate-200">
              No announcements published yet.
            </p>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <article
                  key={ann.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="text-[#0B1F3A]">{ann.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={ann.published_at} className="font-mono tabular-nums">
                      {ann.published_at.slice(0, 10)}
                    </time>
                  </div>
                  <h3 className="text-xl font-medium text-[#0B1F3A]">{ann.title}</h3>
                  <p className="text-sm font-medium text-slate-700">{ann.summary}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{ann.body}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
