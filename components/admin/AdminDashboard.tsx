'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Calendar,
  Download,
  FileEdit,
  Image,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Newspaper,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type {
  AnnouncementItem,
  BookingItem,
  BookingStatus,
  ClientProjectItem,
  EnquiryItem,
  EnquiryStatus,
  EventItem,
  GalleryCategory,
  GalleryImage,
  ServiceItem,
  SiteContentData,
  SocialLinkItem,
} from '@/lib/types';
import AdminGalleryPanel from './AdminGalleryPanel';
import AdminContentPanel from './AdminContentPanel';

type SectionId =
  | 'overview'
  | 'enquiries'
  | 'bookings'
  | 'gallery'
  | 'content'
  | 'news'
  | 'clients'
  | 'security';

interface OverviewPayload {
  storageMode: 'supabase' | 'local';
  enquiries: EnquiryItem[];
  bookings: BookingItem[];
  siteContent: SiteContentData;
  services: ServiceItem[];
  galleryCategories: GalleryCategory[];
  galleryImages: GalleryImage[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  clientsProjects: ClientProjectItem[];
  socialLinks: SocialLinkItem[];
}

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'content', label: 'Website Content', icon: FileEdit },
  { id: 'news', label: 'News & Events', icon: Newspaper },
  { id: 'clients', label: 'Clients & Projects', icon: Briefcase },
  { id: 'security', label: 'Password & Security', icon: KeyRound },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<SectionId>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [notice, setNotice] = useState<{ msg: string; isError: boolean } | null>(null);

  // Filters
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | EnquiryStatus>('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [bookingDateFilter, setBookingDateFilter] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const showNotice = useCallback((msg: string, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => {
      setNotice((prev) => (prev?.msg === msg ? null : prev));
    }, 5000);
  }, []);

  const fetchOverview = useCallback(async () => {
    const res = await fetch('/api/admin/overview', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    if (!res.ok) {
      showNotice('Failed to load dashboard data.', true);
      return;
    }
    const payload = (await res.json()) as OverviewPayload;
    setData(payload);
  }, [router, showNotice]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/overview', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        if (!res.ok) {
          showNotice('Failed to load dashboard data.', true);
          return;
        }
        const payload = (await res.json()) as OverviewPayload;
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) showNotice('Failed to load dashboard data.', true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router, showNotice]);

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.replace('/admin/login');
  }

  async function handleEnquiryStatus(id: string, status: EnquiryStatus) {
    const res = await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ABM-Admin-Client',
      },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      await fetchOverview();
      showNotice(`Enquiry marked as ${status}.`);
    } else {
      showNotice('Could not update enquiry status.', true);
    }
  }

  async function handleBookingStatus(id: string, status: BookingStatus) {
    const res = await fetch('/api/admin/bookings', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ABM-Admin-Client',
      },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      await fetchOverview();
      showNotice(`Booking marked as ${status}.`);
    } else {
      showNotice('Could not update booking status.', true);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotice('New passwords do not match.', true);
      return;
    }
    setChangingPass(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const resData = await res.json();
      if (!res.ok) {
        showNotice(resData?.error || 'Could not change password.', true);
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotice('Admin password updated successfully.');
    } finally {
      setChangingPass(false);
    }
  }

  const filteredEnquiries = useMemo(() => {
    if (!data) return [];
    return data.enquiries.filter((e) => {
      if (enquiryFilter !== 'all' && e.status !== enquiryFilter) return false;
      if (enquirySearch.trim()) {
        const q = enquirySearch.toLowerCase();
        return (
          e.organization_name.toLowerCase().includes(q) ||
          e.specific_service.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, enquiryFilter, enquirySearch]);

  const filteredBookings = useMemo(() => {
    if (!data) return [];
    return data.bookings.filter((b) => {
      if (bookingDateFilter && b.preferred_date !== bookingDateFilter) return false;
      return true;
    });
  }, [data, bookingDateFilter]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#0B1F3A]">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span className="text-sm font-medium">Loading ABM Global Admin Console…</span>
        </div>
      </div>
    );
  }

  const newEnquiriesCount = data.enquiries.filter((e) => e.status === 'new').length;
  const pendingBookingsCount = data.bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#0B1F3A] text-white shrink-0 flex flex-col justify-between">
        <div>
          <div className="px-6 py-5 border-b border-white/10">
            <p className="text-base font-semibold tracking-tight text-white">ABM Global Ltd</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Admin Console · {data.storageMode === 'supabase' ? 'Supabase DB' : 'Local Store'}
            </p>
          </div>
          <nav className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                    active
                      ? 'bg-[#F2B705] text-[#0B1F3A]'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public Website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-white/15 hover:bg-white/10 text-xs font-medium text-slate-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Admin / {NAV_ITEMS.find((n) => n.id === section)?.label}
            </p>
            <h1 className="text-xl font-semibold text-[#0B1F3A]">
              {NAV_ITEMS.find((n) => n.id === section)?.label}
            </h1>
          </div>

          {notice && (
            <div
              role="status"
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                notice.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-[#1E9E5A]/10 text-[#0B1F3A] border border-[#1E9E5A]/30'
              }`}
            >
              {notice.isError ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#1E9E5A]" />
              )}
              <span>{notice.msg}</span>
            </div>
          )}
        </header>

        <main className="p-6 max-w-6xl w-full space-y-6">
          {/* Overview */}
          {section === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white border border-slate-200 p-5">
                  <p className="text-xs text-slate-500">New Enquiries</p>
                  <p className="text-3xl font-semibold text-[#0B1F3A] font-mono tabular-nums mt-1">
                    {newEnquiriesCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.enquiries.length} total recorded
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-5">
                  <p className="text-xs text-slate-500">Pending Consultations</p>
                  <p className="text-3xl font-semibold text-[#0B1F3A] font-mono tabular-nums mt-1">
                    {pendingBookingsCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.bookings.length} total bookings
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-5">
                  <p className="text-xs text-slate-500">Published Gallery Photos</p>
                  <p className="text-3xl font-semibold text-[#0B1F3A] font-mono tabular-nums mt-1">
                    {data.galleryImages.filter((g) => g.is_published).length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.galleryCategories.length} categories
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-5">
                  <p className="text-xs text-slate-500">Clients & Projects</p>
                  <p className="text-3xl font-semibold text-[#0B1F3A] font-mono tabular-nums mt-1">
                    {data.clientsProjects.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.events.length} upcoming events
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#0B1F3A]">Latest Enquiries</h2>
                    <button
                      type="button"
                      onClick={() => setSection('enquiries')}
                      className="text-xs font-medium text-[#0B1F3A] underline cursor-pointer"
                    >
                      Manage all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.enquiries.slice(0, 5).map((e) => (
                      <div key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0B1F3A] truncate">
                            {e.organization_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {e.specific_service} · {e.location}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#0B1F3A] capitalize shrink-0">
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#0B1F3A]">Latest Bookings</h2>
                    <button
                      type="button"
                      onClick={() => setSection('bookings')}
                      className="text-xs font-medium text-[#0B1F3A] underline cursor-pointer"
                    >
                      Manage all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.bookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0B1F3A] truncate">
                            {b.full_name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono tabular-nums">
                            {b.preferred_date} · {b.preferred_time}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#0B1F3A] capitalize shrink-0">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enquiries */}
          {section === 'enquiries' && (
            <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(['all', 'new', 'contacted', 'closed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEnquiryFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                        enquiryFilter === st
                          ? 'bg-[#0B1F3A] text-white'
                          : 'bg-[#F4F6F8] text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <input
                    type="search"
                    placeholder="Search client, service, location..."
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs w-60"
                  />
                </div>

                <a
                  href="/api/admin/enquiries?format=csv"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-medium hover:bg-[#132C4E]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </a>
              </div>

              {filteredEnquiries.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No enquiries match the selected filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2.5 pr-4 font-medium">Organization / Client</th>
                        <th className="py-2.5 pr-4 font-medium">Service & Product</th>
                        <th className="py-2.5 pr-4 font-medium">Timeline</th>
                        <th className="py-2.5 pr-4 font-medium">Contact & Location</th>
                        <th className="py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEnquiries.map((e) => (
                        <tr key={e.id} className="align-top">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-[#0B1F3A]">{e.organization_name}</p>
                            <p className="text-xs text-slate-500 font-mono tabular-nums">
                              {e.created_at.slice(0, 10)}
                            </p>
                          </td>
                          <td className="py-3 pr-4 max-w-xs">
                            <p className="font-medium text-[#0B1F3A] text-xs">{e.specific_service}</p>
                            <p className="text-xs text-slate-600">{e.service_or_product}</p>
                            {e.message && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{e.message}</p>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-xs font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {e.expected_start_date} → {e.expected_end_date}
                          </td>
                          <td className="py-3 pr-4 text-xs text-slate-700">
                            <p className="font-mono tabular-nums">{e.phone}</p>
                            <p>{e.email}</p>
                            <p className="text-slate-500">{e.location}</p>
                          </td>
                          <td className="py-3">
                            <select
                              value={e.status}
                              onChange={(ev) =>
                                handleEnquiryStatus(e.id, ev.target.value as EnquiryStatus)
                              }
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0B1F3A]"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bookings */}
          {section === 'bookings' && (
            <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600">Filter by date:</label>
                  <input
                    type="date"
                    value={bookingDateFilter}
                    onChange={(e) => setBookingDateFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                  {bookingDateFilter && (
                    <button
                      type="button"
                      onClick={() => setBookingDateFilter('')}
                      className="text-xs text-[#0B1F3A] underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  Showing {filteredBookings.length} bookings
                </span>
              </div>

              {filteredBookings.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No consultation bookings found for this filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2.5 pr-4 font-medium">Visitor</th>
                        <th className="py-2.5 pr-4 font-medium">Date & Time</th>
                        <th className="py-2.5 pr-4 font-medium">Visitors</th>
                        <th className="py-2.5 pr-4 font-medium">Purpose</th>
                        <th className="py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="align-top">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-[#0B1F3A]">{b.full_name}</p>
                            <p className="text-xs text-slate-600 font-mono tabular-nums">{b.phone}</p>
                            <p className="text-xs text-slate-500">{b.email}</p>
                          </td>
                          <td className="py-3 pr-4 text-xs font-mono tabular-nums text-[#0B1F3A] whitespace-nowrap">
                            {b.preferred_date} · {b.preferred_time}
                          </td>
                          <td className="py-3 pr-4 text-xs font-mono tabular-nums">
                            {b.visitors_count}
                          </td>
                          <td className="py-3 pr-4 text-xs text-slate-600 max-w-sm">
                            {b.purpose}
                          </td>
                          <td className="py-3">
                            <select
                              value={b.status}
                              onChange={(ev) =>
                                handleBookingStatus(b.id, ev.target.value as BookingStatus)
                              }
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0B1F3A]"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Gallery */}
          {section === 'gallery' && (
            <AdminGalleryPanel
              categories={data.galleryCategories}
              images={data.galleryImages}
              onRefresh={fetchOverview}
              onNotice={showNotice}
            />
          )}

          {/* Website Content & Services */}
          {section === 'content' && (
            <AdminContentPanel
              mode="content"
              siteContent={data.siteContent}
              services={data.services}
              socialLinks={data.socialLinks}
              announcements={data.announcements}
              events={data.events}
              clientsProjects={data.clientsProjects}
              onRefresh={fetchOverview}
              onNotice={showNotice}
            />
          )}

          {/* News & Events */}
          {section === 'news' && (
            <AdminContentPanel
              mode="news"
              siteContent={data.siteContent}
              services={data.services}
              socialLinks={data.socialLinks}
              announcements={data.announcements}
              events={data.events}
              clientsProjects={data.clientsProjects}
              onRefresh={fetchOverview}
              onNotice={showNotice}
            />
          )}

          {/* Clients & Projects */}
          {section === 'clients' && (
            <AdminContentPanel
              mode="clients"
              siteContent={data.siteContent}
              services={data.services}
              socialLinks={data.socialLinks}
              announcements={data.announcements}
              events={data.events}
              clientsProjects={data.clientsProjects}
              onRefresh={fetchOverview}
              onNotice={showNotice}
            />
          )}

          {/* Password & Security */}
          {section === 'security' && (
            <form
              onSubmit={handleChangePassword}
              className="max-w-lg rounded-xl bg-white border border-slate-200 p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-[#0B1F3A]">Change Admin Password</h2>
              <p className="text-xs text-slate-600">
                Passwords are hashed with bcrypt on the server and never stored in plain text.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={changingPass}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium cursor-pointer"
              >
                {changingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Admin Password
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
