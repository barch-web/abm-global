'use client';

import { useState } from 'react';
import { Plus, Save, Trash2, Loader2 } from 'lucide-react';
import type {
  AnnouncementItem,
  ClientProjectItem,
  EventItem,
  ServiceItem,
  SiteContentData,
  SocialLinkItem,
} from '@/lib/types';

interface AdminContentPanelProps {
  mode: 'content' | 'news' | 'clients';
  siteContent: SiteContentData;
  services: ServiceItem[];
  socialLinks: SocialLinkItem[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  clientsProjects: ClientProjectItem[];
  onRefresh: () => Promise<void>;
  onNotice: (msg: string, isError?: boolean) => void;
}

export default function AdminContentPanel({
  mode,
  siteContent,
  services,
  socialLinks,
  announcements,
  events,
  clientsProjects,
  onRefresh,
  onNotice,
}: AdminContentPanelProps) {
  const [contentForm, setContentForm] = useState<SiteContentData>(siteContent);
  const [socialForm, setSocialForm] = useState<SocialLinkItem[]>(socialLinks);
  const [serviceDrafts, setServiceDrafts] = useState<ServiceItem[]>(services);
  const [saving, setSaving] = useState(false);

  // News/Events state
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Company Update');
  const [annSummary, setAnnSummary] = useState('');
  const [annBody, setAnnBody] = useState('');

  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('2026-12-15');
  const [evtTime, setEvtTime] = useState('09:00 AM – 02:00 PM');
  const [evtLocation, setEvtLocation] = useState('ABM Global Training Lab, Asylum Down, Accra');
  const [evtDesc, setEvtDesc] = useState('');

  // Clients/Projects state
  const [clientName, setClientName] = useState('');
  const [clientSector, setClientSector] = useState('Education');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [outcomeMetric, setOutcomeMetric] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteRole, setQuoteRole] = useState('');
  const [completedYear, setCompletedYear] = useState(2026);

  async function saveSiteContent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ type: 'site_content', data: contentForm }),
      });
      if (!res.ok) {
        onNotice('Failed to save website content.', true);
        return;
      }
      await onRefresh();
      onNotice('Website content and trust metrics saved live.');
    } finally {
      setSaving(false);
    }
  }

  async function saveService(svc: ServiceItem) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ type: 'service', data: svc }),
      });
      if (!res.ok) {
        onNotice('Failed to save service.', true);
        return;
      }
      await onRefresh();
      onNotice(`Updated service: ${svc.title}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveSocials() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ type: 'social_links', data: socialForm }),
      });
      if (!res.ok) {
        onNotice('Failed to update social links.', true);
        return;
      }
      await onRefresh();
      onNotice('Social media links updated.');
    } finally {
      setSaving(false);
    }
  }

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({
          kind: 'announcement',
          title: annTitle,
          category: annCategory,
          summary: annSummary,
          body: annBody || annSummary,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        onNotice(d?.error || 'Could not create announcement.', true);
        return;
      }
      setAnnTitle('');
      setAnnSummary('');
      setAnnBody('');
      await onRefresh();
      onNotice('Announcement published.');
    } finally {
      setSaving(false);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({
          kind: 'event',
          title: evtTitle,
          event_date: evtDate,
          event_time: evtTime,
          location: evtLocation,
          description: evtDesc,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        onNotice(d?.error || 'Could not create event.', true);
        return;
      }
      setEvtTitle('');
      setEvtDesc('');
      await onRefresh();
      onNotice('Upcoming event published.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleNewsPublish(kind: 'announcement' | 'event', id: string, current: boolean) {
    await fetch('/api/admin/news', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ABM-Admin-Client',
      },
      body: JSON.stringify({ kind, id, is_published: !current }),
    });
    await onRefresh();
    onNotice(current ? 'Unpublished.' : 'Published.');
  }

  async function removeNewsItem(kind: 'announcement' | 'event', id: string) {
    await fetch(`/api/admin/news?kind=${kind}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-Requested-With': 'ABM-Admin-Client' },
    });
    await onRefresh();
    onNotice('Item deleted.');
  }

  async function addClientProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({
          client_name: clientName,
          sector: clientSector,
          project_title: projectTitle,
          summary: projectSummary,
          outcome_metric: outcomeMetric,
          testimonial_quote: quote,
          testimonial_author: quoteAuthor,
          testimonial_role: quoteRole,
          completed_year: completedYear,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        onNotice(d?.error || 'Could not save client project.', true);
        return;
      }
      setClientName('');
      setProjectTitle('');
      setProjectSummary('');
      setOutcomeMetric('');
      setQuote('');
      setQuoteAuthor('');
      setQuoteRole('');
      await onRefresh();
      onNotice('Client project added.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient(id: string) {
    await fetch(`/api/admin/clients?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-Requested-With': 'ABM-Admin-Client' },
    });
    await onRefresh();
    onNotice('Client project removed.');
  }

  if (mode === 'news') {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={createAnnouncement}
            className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#0B1F3A]">New Announcement</h2>
            <input
              type="text"
              required
              placeholder="Announcement Title"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Category (e.g. Service Notice, Procurement Update)"
              value={annCategory}
              onChange={(e) => setAnnCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Short Summary"
              value={annSummary}
              onChange={(e) => setAnnSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              rows={3}
              placeholder="Full announcement body..."
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F2B705] text-[#0B1F3A] text-sm font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish Announcement
            </button>
          </form>

          <form
            onSubmit={createEvent}
            className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#0B1F3A]">New Upcoming Event</h2>
            <input
              type="text"
              required
              placeholder="Event Title"
              value={evtTitle}
              onChange={(e) => setEvtTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
              <input
                type="text"
                required
                placeholder="Time (e.g. 09:00 AM)"
                value={evtTime}
                onChange={(e) => setEvtTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Location"
              value={evtLocation}
              onChange={(e) => setEvtLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              rows={3}
              required
              placeholder="Event description..."
              value={evtDesc}
              onChange={(e) => setEvtDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish Event
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-base font-semibold text-[#0B1F3A]">
              Announcements ({announcements.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500">
                      {a.category} · {a.is_published ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-sm font-semibold text-[#0B1F3A]">{a.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleNewsPublish('announcement', a.id, a.is_published)}
                      className="px-2.5 py-1 rounded border border-slate-200 text-xs font-medium cursor-pointer"
                    >
                      {a.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNewsItem('announcement', a.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-base font-semibold text-[#0B1F3A]">
              Events ({events.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {events.map((e) => (
                <div key={e.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500 font-mono">
                      {e.event_date} · {e.is_published ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-sm font-semibold text-[#0B1F3A]">{e.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleNewsPublish('event', e.id, e.is_published)}
                      className="px-2.5 py-1 rounded border border-slate-200 text-xs font-medium cursor-pointer"
                    >
                      {e.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNewsItem('event', e.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'clients') {
    return (
      <div className="space-y-8">
        <form
          onSubmit={addClientProject}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[#0B1F3A]">
            Add Client & Completed Project
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Client Organization Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Sector (e.g. Education, Healthcare)"
              value={clientSector}
              onChange={(e) => setClientSector(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={2010}
              max={2035}
              value={completedYear}
              onChange={(e) => setCompletedYear(Number(e.target.value) || 2026)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
            <input
              type="text"
              required
              placeholder="Project Title *"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Measured Outcome (e.g. 99.5% uptime)"
              value={outcomeMetric}
              onChange={(e) => setOutcomeMetric(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              required
              placeholder="Project Summary *"
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
              className="sm:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              placeholder="Client Testimonial Quote (optional)"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="sm:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Testimonial Author Name"
              value={quoteAuthor}
              onChange={(e) => setQuoteAuthor(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Author Role"
              value={quoteRole}
              onChange={(e) => setQuoteRole(e.target.value)}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F2B705] text-[#0B1F3A] text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Client Project
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clientsProjects.map((cp) => (
            <div
              key={cp.id}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  {cp.sector} · <span className="font-mono">{cp.completed_year}</span>
                </p>
                <h3 className="text-base font-semibold text-[#0B1F3A]">{cp.client_name}</h3>
                <p className="text-sm font-medium text-slate-700">{cp.project_title}</p>
                <p className="text-xs text-slate-600">{cp.summary}</p>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => deleteClient(cp.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // mode === 'content'
  return (
    <div className="space-y-8">
      <form
        onSubmit={saveSiteContent}
        className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-[#0B1F3A]">
            Website Copy, Trust Strip, Mission/Vision & Contact Info
          </h2>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Website Content
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Company Name</label>
            <input
              type="text"
              value={contentForm.companyName}
              onChange={(e) => setContentForm({ ...contentForm, companyName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Contact Email</label>
            <input
              type="email"
              value={contentForm.contactEmail}
              onChange={(e) => setContentForm({ ...contentForm, contactEmail: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Hero Headline</label>
            <input
              type="text"
              value={contentForm.heroHeadline}
              onChange={(e) => setContentForm({ ...contentForm, heroHeadline: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Hero Subheadline / Positioning
            </label>
            <input
              type="text"
              value={contentForm.heroSubheadline}
              onChange={(e) =>
                setContentForm({
                  ...contentForm,
                  heroSubheadline: e.target.value,
                  positioning: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Trust Strip Metrics */}
          <div className="md:col-span-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Homepage Trust Strip Metrics
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {contentForm.trustStats.map((stat, idx) => (
                <div key={stat.id} className="p-3 rounded-lg border border-slate-200 bg-[#F4F6F8] space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const next = [...contentForm.trustStats];
                      next[idx] = { ...next[idx], value: e.target.value };
                      setContentForm({ ...contentForm, trustStats: next });
                    }}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-mono font-semibold"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const next = [...contentForm.trustStats];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setContentForm({ ...contentForm, trustStats: next });
                    }}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Mission Statement</label>
            <textarea
              rows={3}
              value={contentForm.mission}
              onChange={(e) => setContentForm({ ...contentForm, mission: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vision Statement</label>
            <textarea
              rows={3}
              value={contentForm.vision}
              onChange={(e) => setContentForm({ ...contentForm, vision: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">About Company Summary</label>
            <textarea
              rows={3}
              value={contentForm.aboutSummary}
              onChange={(e) => setContentForm({ ...contentForm, aboutSummary: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Consulting Headline</label>
            <input
              type="text"
              value={contentForm.consultingHeadline}
              onChange={(e) =>
                setContentForm({ ...contentForm, consultingHeadline: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Consulting Hours</label>
            <input
              type="text"
              value={contentForm.consultingHours}
              onChange={(e) => setContentForm({ ...contentForm, consultingHours: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Phone Display</label>
            <input
              type="text"
              value={contentForm.contactPhoneDisplay}
              onChange={(e) =>
                setContentForm({ ...contentForm, contactPhoneDisplay: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Accra Office Address
            </label>
            <input
              type="text"
              value={contentForm.officeAddress}
              onChange={(e) => setContentForm({ ...contentForm, officeAddress: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </form>

      {/* Services Editor */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#0B1F3A]">Edit Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {serviceDrafts.map((svc, idx) => (
            <div key={svc.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <input
                type="text"
                value={svc.title}
                onChange={(e) => {
                  const next = [...serviceDrafts];
                  next[idx] = { ...next[idx], title: e.target.value };
                  setServiceDrafts(next);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold"
              />
              <textarea
                rows={2}
                value={svc.short_summary}
                onChange={(e) => {
                  const next = [...serviceDrafts];
                  next[idx] = { ...next[idx], short_summary: e.target.value };
                  setServiceDrafts(next);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
              <textarea
                rows={3}
                value={svc.description}
                onChange={(e) => {
                  const next = [...serviceDrafts];
                  next[idx] = { ...next[idx], description: e.target.value };
                  setServiceDrafts(next);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => saveService(svc)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-medium cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Service
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Links Editor */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0B1F3A]">Social Media Links</h2>
          <button
            type="button"
            disabled={saving}
            onClick={saveSocials}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-medium cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Social Links
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socialForm.map((link, idx) => (
            <div key={link.id} className="flex items-center gap-2">
              <span className="w-24 text-xs font-medium text-[#0B1F3A]">{link.platform}</span>
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const next = [...socialForm];
                  next[idx] = { ...next[idx], url: e.target.value };
                  setSocialForm(next);
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
