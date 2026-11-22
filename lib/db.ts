import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_BOOKINGS,
  DEFAULT_CLIENTS_PROJECTS,
  DEFAULT_ENQUIRIES,
  DEFAULT_EVENTS,
  DEFAULT_GALLERY_CATEGORIES,
  DEFAULT_GALLERY_IMAGES,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SOCIAL_LINKS,
} from './seed';
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
  PublicBundle,
  ServiceItem,
  SiteContentData,
  SocialLinkItem,
} from './types';

interface RateLimitRecord {
  key: string;
  attempts: number;
  locked_until: string | null;
  window_start: string;
  updated_at: string;
}

interface LocalStoreData {
  admin_settings: {
    id: string;
    password_hash: string;
    is_initialized: boolean;
    updated_at: string;
  } | null;
  enquiries: EnquiryItem[];
  bookings: BookingItem[];
  gallery_categories: GalleryCategory[];
  gallery_images: GalleryImage[];
  site_content: SiteContentData;
  services: ServiceItem[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  clients_projects: ClientProjectItem[];
  social_links: SocialLinkItem[];
  rate_limits: Record<string, RateLimitRecord>;
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function buildInitialStore(): LocalStoreData {
  return {
    admin_settings: null,
    enquiries: [...DEFAULT_ENQUIRIES],
    bookings: [...DEFAULT_BOOKINGS],
    gallery_categories: [...DEFAULT_GALLERY_CATEGORIES],
    gallery_images: [...DEFAULT_GALLERY_IMAGES],
    site_content: structuredClone(DEFAULT_SITE_CONTENT),
    services: [...DEFAULT_SERVICES],
    announcements: [...DEFAULT_ANNOUNCEMENTS],
    events: [...DEFAULT_EVENTS],
    clients_projects: [...DEFAULT_CLIENTS_PROJECTS],
    social_links: [...DEFAULT_SOCIAL_LINKS],
    rate_limits: {},
  };
}

let cachedStorePath: string | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function resolveStorePath(): Promise<string> {
  if (cachedStorePath) return cachedStorePath;
  const projectDataDir = path.join(process.cwd(), '.data');
  try {
    await fs.mkdir(projectDataDir, { recursive: true });
    const testFile = path.join(projectDataDir, '.write-check');
    await fs.writeFile(testFile, 'ok');
    await fs.unlink(testFile);
    cachedStorePath = path.join(projectDataDir, 'abm-store.json');
    return cachedStorePath;
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'abm-global-data');
    await fs.mkdir(tmpDir, { recursive: true });
    cachedStorePath = path.join(tmpDir, 'abm-store.json');
    return cachedStorePath;
  }
}

async function readLocalStore(): Promise<LocalStoreData> {
  const filePath = await resolveStorePath();
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
    const initial = buildInitialStore();
    return {
      ...initial,
      ...parsed,
      site_content: { ...initial.site_content, ...(parsed.site_content || {}) },
      rate_limits: parsed.rate_limits || {},
    };
  } catch {
    const initial = buildInitialStore();
    await fs.writeFile(filePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

async function mutateLocalStore<T>(fn: (store: LocalStoreData) => T | Promise<T>): Promise<T> {
  let result!: T;
  const run = async () => {
    const store = await readLocalStore();
    result = await fn(store);
    const filePath = await resolveStorePath();
    await fs.writeFile(filePath, JSON.stringify(store, null, 2), 'utf8');
  };
  writeQueue = writeQueue.then(run, run);
  await writeQueue;
  return result;
}

async function ensureSupabaseSeeded(sb: SupabaseClient): Promise<void> {
  const { data: existingServices } = await sb.from('services').select('id').limit(1);
  if (!existingServices || existingServices.length === 0) {
    await sb.from('services').upsert(
      DEFAULT_SERVICES.map((s) => ({
        slug: s.slug,
        title: s.title,
        short_summary: s.short_summary,
        description: s.description,
        deliverables: s.deliverables,
        target_audience: s.target_audience,
        image_url: s.image_url,
        display_order: s.display_order,
        is_published: s.is_published,
      })),
      { onConflict: 'slug' }
    );
  }

  const { data: existingSite } = await sb.from('site_content').select('key').limit(1);
  if (!existingSite || existingSite.length === 0) {
    await sb.from('site_content').upsert({
      key: 'main',
      value: DEFAULT_SITE_CONTENT,
    });
  }

  const { data: existingCats } = await sb.from('gallery_categories').select('id, slug');
  if (!existingCats || existingCats.length === 0) {
    const { data: insertedCats } = await sb
      .from('gallery_categories')
      .upsert(
        DEFAULT_GALLERY_CATEGORIES.map((c) => ({
          name: c.name,
          slug: c.slug,
          display_order: c.display_order,
        })),
        { onConflict: 'slug' }
      )
      .select('id, slug');

    if (insertedCats && insertedCats.length > 0) {
      const slugToId = new Map(insertedCats.map((c) => [c.slug, c.id]));
      const catIdLookup = new Map(DEFAULT_GALLERY_CATEGORIES.map((c) => [c.id, slugToId.get(c.slug)]));
      await sb.from('gallery_images').insert(
        DEFAULT_GALLERY_IMAGES.map((img) => ({
          category_id: catIdLookup.get(img.category_id) || insertedCats[0].id,
          title: img.title,
          caption: img.caption,
          image_url: img.image_url,
          storage_path: img.storage_path,
          is_published: img.is_published,
          display_order: img.display_order,
        }))
      );
    }
  }

  const { data: existingAnn } = await sb.from('announcements').select('id').limit(1);
  if (!existingAnn || existingAnn.length === 0) {
    await sb.from('announcements').insert(
      DEFAULT_ANNOUNCEMENTS.map((a) => ({
        title: a.title,
        summary: a.summary,
        body: a.body,
        category: a.category,
        is_published: a.is_published,
        published_at: a.published_at,
      }))
    );
  }

  const { data: existingEvt } = await sb.from('events').select('id').limit(1);
  if (!existingEvt || existingEvt.length === 0) {
    await sb.from('events').insert(
      DEFAULT_EVENTS.map((e) => ({
        title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        location: e.location,
        description: e.description,
        registration_link: e.registration_link,
        is_published: e.is_published,
      }))
    );
  }

  const { data: existingClients } = await sb.from('clients_projects').select('id').limit(1);
  if (!existingClients || existingClients.length === 0) {
    await sb.from('clients_projects').insert(
      DEFAULT_CLIENTS_PROJECTS.map((c) => ({
        client_name: c.client_name,
        sector: c.sector,
        project_title: c.project_title,
        summary: c.summary,
        outcome_metric: c.outcome_metric,
        testimonial_quote: c.testimonial_quote,
        testimonial_author: c.testimonial_author,
        testimonial_role: c.testimonial_role,
        completed_year: c.completed_year,
        is_published: c.is_published,
      }))
    );
  }

  const { data: existingSocial } = await sb.from('social_links').select('id').limit(1);
  if (!existingSocial || existingSocial.length === 0) {
    await sb.from('social_links').insert(
      DEFAULT_SOCIAL_LINKS.map((s) => ({
        platform: s.platform,
        label: s.label,
        url: s.url,
        is_active: s.is_active,
        display_order: s.display_order,
      }))
    );
  }
}

export async function getPublicBundle(): Promise<PublicBundle> {
  const sb = getSupabaseAdmin();
  if (sb) {
    await ensureSupabaseSeeded(sb);
    const [
      siteRes,
      servicesRes,
      catsRes,
      imgsRes,
      annRes,
      evtRes,
      cpRes,
      socRes,
    ] = await Promise.all([
      sb.from('site_content').select('value').eq('key', 'main').maybeSingle(),
      sb.from('services').select('*').eq('is_published', true).order('display_order', { ascending: true }),
      sb.from('gallery_categories').select('*').order('display_order', { ascending: true }),
      sb.from('gallery_images').select('*').eq('is_published', true).order('display_order', { ascending: true }),
      sb.from('announcements').select('*').eq('is_published', true).order('published_at', { ascending: false }),
      sb.from('events').select('*').eq('is_published', true).order('event_date', { ascending: true }),
      sb.from('clients_projects').select('*').eq('is_published', true).order('completed_year', { ascending: false }),
      sb.from('social_links').select('*').eq('is_active', true).order('display_order', { ascending: true }),
    ]);

    return {
      siteContent: {
        ...DEFAULT_SITE_CONTENT,
        ...((siteRes.data?.value as Partial<SiteContentData>) || {}),
      },
      services: (servicesRes.data as ServiceItem[]) || DEFAULT_SERVICES,
      galleryCategories: (catsRes.data as GalleryCategory[]) || DEFAULT_GALLERY_CATEGORIES,
      galleryImages: (imgsRes.data as GalleryImage[]) || DEFAULT_GALLERY_IMAGES,
      announcements: (annRes.data as AnnouncementItem[]) || DEFAULT_ANNOUNCEMENTS,
      events: (evtRes.data as EventItem[]) || DEFAULT_EVENTS,
      clientsProjects: (cpRes.data as ClientProjectItem[]) || DEFAULT_CLIENTS_PROJECTS,
      socialLinks: (socRes.data as SocialLinkItem[]) || DEFAULT_SOCIAL_LINKS,
    };
  }

  const store = await readLocalStore();
  return {
    siteContent: store.site_content,
    services: store.services
      .filter((s) => s.is_published)
      .sort((a, b) => a.display_order - b.display_order),
    galleryCategories: [...store.gallery_categories].sort(
      (a, b) => a.display_order - b.display_order
    ),
    galleryImages: store.gallery_images
      .filter((i) => i.is_published)
      .sort((a, b) => a.display_order - b.display_order),
    announcements: store.announcements
      .filter((a) => a.is_published)
      .sort((a, b) => b.published_at.localeCompare(a.published_at)),
    events: store.events
      .filter((e) => e.is_published)
      .sort((a, b) => a.event_date.localeCompare(b.event_date)),
    clientsProjects: store.clients_projects
      .filter((c) => c.is_published)
      .sort((a, b) => b.completed_year - a.completed_year),
    socialLinks: store.social_links
      .filter((s) => s.is_active)
      .sort((a, b) => a.display_order - b.display_order),
  };
}

export async function getAdminOverviewBundle() {
  const sb = getSupabaseAdmin();
  if (sb) {
    await ensureSupabaseSeeded(sb);
    const [
      enqRes,
      bkgRes,
      siteRes,
      servicesRes,
      catsRes,
      imgsRes,
      annRes,
      evtRes,
      cpRes,
      socRes,
    ] = await Promise.all([
      sb.from('enquiries').select('*').order('created_at', { ascending: false }),
      sb.from('bookings').select('*').order('created_at', { ascending: false }),
      sb.from('site_content').select('value').eq('key', 'main').maybeSingle(),
      sb.from('services').select('*').order('display_order', { ascending: true }),
      sb.from('gallery_categories').select('*').order('display_order', { ascending: true }),
      sb.from('gallery_images').select('*').order('display_order', { ascending: true }),
      sb.from('announcements').select('*').order('published_at', { ascending: false }),
      sb.from('events').select('*').order('event_date', { ascending: true }),
      sb.from('clients_projects').select('*').order('completed_year', { ascending: false }),
      sb.from('social_links').select('*').order('display_order', { ascending: true }),
    ]);

    return {
      enquiries: (enqRes.data as EnquiryItem[]) || [],
      bookings: (bkgRes.data as BookingItem[]) || [],
      siteContent: {
        ...DEFAULT_SITE_CONTENT,
        ...((siteRes.data?.value as Partial<SiteContentData>) || {}),
      },
      services: (servicesRes.data as ServiceItem[]) || [],
      galleryCategories: (catsRes.data as GalleryCategory[]) || [],
      galleryImages: (imgsRes.data as GalleryImage[]) || [],
      announcements: (annRes.data as AnnouncementItem[]) || [],
      events: (evtRes.data as EventItem[]) || [],
      clientsProjects: (cpRes.data as ClientProjectItem[]) || [],
      socialLinks: (socRes.data as SocialLinkItem[]) || [],
    };
  }

  const store = await readLocalStore();
  return {
    enquiries: [...store.enquiries].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    bookings: [...store.bookings].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    siteContent: store.site_content,
    services: [...store.services].sort((a, b) => a.display_order - b.display_order),
    galleryCategories: [...store.gallery_categories].sort(
      (a, b) => a.display_order - b.display_order
    ),
    galleryImages: [...store.gallery_images].sort((a, b) => a.display_order - b.display_order),
    announcements: [...store.announcements].sort((a, b) =>
      b.published_at.localeCompare(a.published_at)
    ),
    events: [...store.events].sort((a, b) => a.event_date.localeCompare(b.event_date)),
    clientsProjects: [...store.clients_projects].sort(
      (a, b) => b.completed_year - a.completed_year
    ),
    socialLinks: [...store.social_links].sort((a, b) => a.display_order - b.display_order),
  };
}

// ---------- Enquiries ----------
export async function createEnquiry(
  input: Omit<EnquiryItem, 'id' | 'status' | 'created_at'>
): Promise<EnquiryItem> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('enquiries')
      .insert({ ...input, status: 'new' })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to save enquiry');
    return data as EnquiryItem;
  }

  return mutateLocalStore((store) => {
    const item: EnquiryItem = {
      id: `enq-${crypto.randomUUID()}`,
      ...input,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    store.enquiries.unshift(item);
    return item;
  });
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<EnquiryItem | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('enquiries')
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as EnquiryItem) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.enquiries.find((e) => e.id === id);
    if (!found) return null;
    found.status = status;
    return found;
  });
}

// ---------- Bookings ----------
export async function createBooking(
  input: Omit<BookingItem, 'id' | 'status' | 'confirmation_sent' | 'created_at'>
): Promise<BookingItem> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('bookings')
      .insert({ ...input, status: 'pending', confirmation_sent: false })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to save booking');
    return data as BookingItem;
  }

  return mutateLocalStore((store) => {
    const item: BookingItem = {
      id: `bkg-${crypto.randomUUID()}`,
      ...input,
      status: 'pending',
      confirmation_sent: false,
      created_at: new Date().toISOString(),
    };
    store.bookings.unshift(item);
    return item;
  });
}

export async function markBookingConfirmationSent(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb) {
    await sb.from('bookings').update({ confirmation_sent: true }).eq('id', id);
    return;
  }
  await mutateLocalStore((store) => {
    const found = store.bookings.find((b) => b.id === id);
    if (found) found.confirmation_sent = true;
  });
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingItem | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as BookingItem) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.bookings.find((b) => b.id === id);
    if (!found) return null;
    found.status = status;
    return found;
  });
}

// ---------- Site Content & Services & Social Links ----------
export async function updateSiteContent(next: SiteContentData): Promise<SiteContentData> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb
      .from('site_content')
      .upsert({ key: 'main', value: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return next;
  }

  return mutateLocalStore((store) => {
    store.site_content = next;
    return store.site_content;
  });
}

export async function updateServiceItem(
  id: string,
  patch: Partial<Pick<ServiceItem, 'title' | 'short_summary' | 'description' | 'deliverables' | 'target_audience' | 'image_url' | 'is_published' | 'display_order'>>
): Promise<ServiceItem | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('services')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as ServiceItem) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.services.find((s) => s.id === id);
    if (!found) return null;
    Object.assign(found, patch, { updated_at: new Date().toISOString() });
    return found;
  });
}

export async function upsertSocialLinks(links: SocialLinkItem[]): Promise<SocialLinkItem[]> {
  const sb = getSupabaseAdmin();
  if (sb) {
    await sb.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (links.length > 0) {
      const { data, error } = await sb
        .from('social_links')
        .insert(
          links.map((l, idx) => ({
            platform: l.platform,
            label: l.label,
            url: l.url,
            is_active: l.is_active,
            display_order: idx + 1,
          }))
        )
        .select('*');
      if (error) throw new Error(error.message);
      return (data as SocialLinkItem[]) || [];
    }
    return [];
  }

  return mutateLocalStore((store) => {
    store.social_links = links.map((l, idx) => ({
      ...l,
      id: l.id || `soc-${crypto.randomUUID()}`,
      display_order: idx + 1,
    }));
    return store.social_links;
  });
}

// ---------- Gallery ----------
export async function createGalleryCategory(name: string): Promise<GalleryCategory> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `category-${Date.now()}`;

  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: existing } = await sb.from('gallery_categories').select('display_order');
    const maxOrder = existing ? Math.max(0, ...existing.map((c) => c.display_order || 0)) : 0;
    const { data, error } = await sb
      .from('gallery_categories')
      .insert({ name, slug, display_order: maxOrder + 1 })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create category');
    return data as GalleryCategory;
  }

  return mutateLocalStore((store) => {
    const dup = store.gallery_categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === slug
    );
    if (dup) throw new Error('Category already exists');
    const maxOrder = Math.max(0, ...store.gallery_categories.map((c) => c.display_order));
    const cat: GalleryCategory = {
      id: `cat-${crypto.randomUUID()}`,
      name,
      slug,
      display_order: maxOrder + 1,
      created_at: new Date().toISOString(),
    };
    store.gallery_categories.push(cat);
    return cat;
  });
}

export async function uploadGalleryBinary(
  buffer: Buffer,
  ext: 'jpg' | 'png' | 'webp',
  mime: string
): Promise<{ imageUrl: string; storagePath: string | null }> {
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const sb = getSupabaseAdmin();
  if (sb) {
    const storagePath = `uploads/${filename}`;
    const { error } = await sb.storage.from('gallery').upload(storagePath, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = sb.storage.from('gallery').getPublicUrl(storagePath);
    return { imageUrl: data.publicUrl, storagePath };
  }

  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const targetPath = path.resolve(uploadDir, filename);
  if (!targetPath.startsWith(uploadDir + path.sep)) {
    throw new Error('Invalid upload destination');
  }
  await fs.writeFile(targetPath, buffer);
  return { imageUrl: `/uploads/${filename}`, storagePath: `/uploads/${filename}` };
}

export async function createGalleryImage(input: {
  category_id: string;
  title: string;
  caption: string;
  image_url: string;
  storage_path: string | null;
  is_published: boolean;
}): Promise<GalleryImage> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: existing } = await sb.from('gallery_images').select('display_order');
    const maxOrder = existing ? Math.max(0, ...existing.map((i) => i.display_order || 0)) : 0;
    const { data, error } = await sb
      .from('gallery_images')
      .insert({ ...input, display_order: maxOrder + 1 })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to save gallery image');
    return data as GalleryImage;
  }

  return mutateLocalStore((store) => {
    const maxOrder = Math.max(0, ...store.gallery_images.map((i) => i.display_order));
    const item: GalleryImage = {
      id: `img-${crypto.randomUUID()}`,
      ...input,
      display_order: maxOrder + 1,
      created_at: new Date().toISOString(),
    };
    store.gallery_images.push(item);
    return item;
  });
}

export async function updateGalleryImage(
  id: string,
  patch: Partial<Pick<GalleryImage, 'category_id' | 'title' | 'caption' | 'image_url' | 'storage_path' | 'is_published'>>
): Promise<GalleryImage | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('gallery_images')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as GalleryImage) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.gallery_images.find((i) => i.id === id);
    if (!found) return null;
    Object.assign(found, patch);
    return found;
  });
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: existing } = await sb
      .from('gallery_images')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();
    if (existing?.storage_path) {
      await sb.storage.from('gallery').remove([existing.storage_path]);
    }
    const { error } = await sb.from('gallery_images').delete().eq('id', id);
    return !error;
  }

  return mutateLocalStore(async (store) => {
    const idx = store.gallery_images.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    const [removed] = store.gallery_images.splice(idx, 1);
    if (removed.storage_path && removed.storage_path.startsWith('/uploads/')) {
      const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
      const target = path.resolve(uploadDir, path.basename(removed.storage_path));
      if (target.startsWith(uploadDir + path.sep)) {
        await fs.unlink(target).catch(() => undefined);
      }
    }
    return true;
  });
}

// ---------- Announcements & Events ----------
export async function createAnnouncement(
  input: Omit<AnnouncementItem, 'id' | 'created_at' | 'published_at'>
): Promise<AnnouncementItem> {
  const now = new Date().toISOString();
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('announcements')
      .insert({ ...input, published_at: now })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create announcement');
    return data as AnnouncementItem;
  }

  return mutateLocalStore((store) => {
    const item: AnnouncementItem = {
      id: `ann-${crypto.randomUUID()}`,
      ...input,
      published_at: now,
      created_at: now,
    };
    store.announcements.unshift(item);
    return item;
  });
}

export async function updateAnnouncement(
  id: string,
  patch: Partial<Omit<AnnouncementItem, 'id' | 'created_at'>>
): Promise<AnnouncementItem | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('announcements')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as AnnouncementItem) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.announcements.find((a) => a.id === id);
    if (!found) return null;
    Object.assign(found, patch);
    return found;
  });
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('announcements').delete().eq('id', id);
    return !error;
  }

  return mutateLocalStore((store) => {
    const before = store.announcements.length;
    store.announcements = store.announcements.filter((a) => a.id !== id);
    return store.announcements.length < before;
  });
}

export async function createEvent(
  input: Omit<EventItem, 'id' | 'created_at'>
): Promise<EventItem> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('events')
      .insert(input)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create event');
    return data as EventItem;
  }

  return mutateLocalStore((store) => {
    const item: EventItem = {
      id: `evt-${crypto.randomUUID()}`,
      ...input,
      created_at: new Date().toISOString(),
    };
    store.events.push(item);
    return item;
  });
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<EventItem, 'id' | 'created_at'>>
): Promise<EventItem | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('events')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as EventItem) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.events.find((e) => e.id === id);
    if (!found) return null;
    Object.assign(found, patch);
    return found;
  });
}

export async function deleteEvent(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('events').delete().eq('id', id);
    return !error;
  }

  return mutateLocalStore((store) => {
    const before = store.events.length;
    store.events = store.events.filter((e) => e.id !== id);
    return store.events.length < before;
  });
}

// ---------- Clients & Projects ----------
export async function createClientProject(
  input: Omit<ClientProjectItem, 'id' | 'created_at'>
): Promise<ClientProjectItem> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('clients_projects')
      .insert(input)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create project');
    return data as ClientProjectItem;
  }

  return mutateLocalStore((store) => {
    const item: ClientProjectItem = {
      id: `cp-${crypto.randomUUID()}`,
      ...input,
      created_at: new Date().toISOString(),
    };
    store.clients_projects.unshift(item);
    return item;
  });
}

export async function updateClientProject(
  id: string,
  patch: Partial<Omit<ClientProjectItem, 'id' | 'created_at'>>
): Promise<ClientProjectItem | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('clients_projects')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as ClientProjectItem) || null;
  }

  return mutateLocalStore((store) => {
    const found = store.clients_projects.find((c) => c.id === id);
    if (!found) return null;
    Object.assign(found, patch);
    return found;
  });
}

export async function deleteClientProject(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('clients_projects').delete().eq('id', id);
    return !error;
  }

  return mutateLocalStore((store) => {
    const before = store.clients_projects.length;
    store.clients_projects = store.clients_projects.filter((c) => c.id !== id);
    return store.clients_projects.length < before;
  });
}

// ---------- Admin Settings & Rate Limits ----------
export async function getAdminPasswordRecord(): Promise<{
  id: string;
  password_hash: string;
  is_initialized: boolean;
} | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data } = await sb
      .from('admin_settings')
      .select('id, password_hash, is_initialized')
      .limit(1)
      .maybeSingle();
    return data || null;
  }

  const store = await readLocalStore();
  return store.admin_settings;
}

export async function saveInitialAdminPasswordHash(passwordHash: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: existing } = await sb
      .from('admin_settings')
      .select('id, is_initialized')
      .limit(1)
      .maybeSingle();
    if (existing?.is_initialized) return false;
    const { error } = await sb.from('admin_settings').insert({
      password_hash: passwordHash,
      is_initialized: true,
    });
    return !error;
  }

  return mutateLocalStore((store) => {
    if (store.admin_settings?.is_initialized) return false;
    store.admin_settings = {
      id: `adm-${crypto.randomUUID()}`,
      password_hash: passwordHash,
      is_initialized: true,
      updated_at: new Date().toISOString(),
    };
    return true;
  });
}

export async function updateAdminPasswordHash(passwordHash: string): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: existing } = await sb.from('admin_settings').select('id').limit(1).maybeSingle();
    if (existing) {
      await sb
        .from('admin_settings')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await sb.from('admin_settings').insert({ password_hash: passwordHash, is_initialized: true });
    }
    return;
  }

  await mutateLocalStore((store) => {
    store.admin_settings = {
      id: store.admin_settings?.id || `adm-${crypto.randomUUID()}`,
      password_hash: passwordHash,
      is_initialized: true,
      updated_at: new Date().toISOString(),
    };
  });
}

export async function checkAndIncrementRateLimit(
  key: string,
  options: { maxAttempts: number; windowMs: number; lockMs: number }
): Promise<{ allowed: boolean; retryAfterSeconds: number; attemptsRemaining: number }> {
  const now = Date.now();
  const sb = getSupabaseAdmin();

  if (sb) {
    const { data: row } = await sb
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (row?.locked_until) {
      const lockedUntilMs = new Date(row.locked_until).getTime();
      if (lockedUntilMs > now) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((lockedUntilMs - now) / 1000),
          attemptsRemaining: 0,
        };
      }
    }

    const windowStartMs = row ? new Date(row.window_start).getTime() : 0;
    const withinWindow = row && now - windowStartMs < options.windowMs;
    const nextAttempts = withinWindow ? (row.attempts || 0) + 1 : 1;
    const shouldLock = nextAttempts >= options.maxAttempts;
    const lockedUntil = shouldLock ? new Date(now + options.lockMs).toISOString() : null;

    await sb.from('rate_limits').upsert({
      key,
      attempts: nextAttempts,
      locked_until: lockedUntil,
      window_start: withinWindow ? row.window_start : new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    });

    if (shouldLock) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(options.lockMs / 1000),
        attemptsRemaining: 0,
      };
    }
    return {
      allowed: true,
      retryAfterSeconds: 0,
      attemptsRemaining: Math.max(0, options.maxAttempts - nextAttempts),
    };
  }

  return mutateLocalStore((store) => {
    const row = store.rate_limits[key];
    if (row?.locked_until) {
      const lockedUntilMs = new Date(row.locked_until).getTime();
      if (lockedUntilMs > now) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((lockedUntilMs - now) / 1000),
          attemptsRemaining: 0,
        };
      }
    }

    const windowStartMs = row ? new Date(row.window_start).getTime() : 0;
    const withinWindow = row && now - windowStartMs < options.windowMs;
    const nextAttempts = withinWindow ? row.attempts + 1 : 1;
    const shouldLock = nextAttempts >= options.maxAttempts;
    const lockedUntil = shouldLock ? new Date(now + options.lockMs).toISOString() : null;

    store.rate_limits[key] = {
      key,
      attempts: nextAttempts,
      locked_until: lockedUntil,
      window_start: withinWindow ? row.window_start : new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    };

    if (shouldLock) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(options.lockMs / 1000),
        attemptsRemaining: 0,
      };
    }
    return {
      allowed: true,
      retryAfterSeconds: 0,
      attemptsRemaining: Math.max(0, options.maxAttempts - nextAttempts),
    };
  });
}

export async function clearRateLimit(key: string): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb) {
    await sb.from('rate_limits').delete().eq('key', key);
    return;
  }
  await mutateLocalStore((store) => {
    delete store.rate_limits[key];
  });
}
