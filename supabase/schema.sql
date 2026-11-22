-- ============================================================================
-- ABM Global Ltd — Production Supabase PostgreSQL Schema, RLS & Storage Setup
-- Accra, Ghana | IT Training, Support, Networking, Auditing, CCTV & Procurement
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Admin Settings (single-row password-only auth store)
create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  password_hash text not null,
  is_initialized boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 2. Business Enquiries & Quote Requests
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  service_or_product text not null,
  expected_start_date date not null,
  expected_end_date date not null,
  specific_service text not null,
  phone text not null,
  email text not null,
  location text not null,
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_enquiries_status_created on public.enquiries (status, created_at desc);

-- 3. Consultation Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  preferred_date date not null,
  preferred_time text not null,
  visitors_count integer not null default 1 check (visitors_count >= 1 and visitors_count <= 50),
  purpose text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  confirmation_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_date_status on public.bookings (preferred_date asc, status);

-- 4. Gallery Categories
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Gallery Images
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.gallery_categories(id) on delete cascade,
  title text not null,
  caption text not null default '',
  image_url text not null,
  storage_path text,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_gallery_images_category_pub on public.gallery_images (category_id, is_published, display_order);

-- 6. Website Content (CMS Key-Value Store)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 7. Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_summary text not null,
  description text not null,
  deliverables jsonb not null default '[]'::jsonb,
  target_audience text not null default '',
  image_url text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_order on public.services (display_order asc, is_published);

-- 8. Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  body text not null,
  category text not null default 'Company Update',
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_announcements_pub on public.announcements (is_published, published_at desc);

-- 9. Upcoming & Past Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time text not null default '09:00 AM',
  location text not null,
  description text not null,
  registration_link text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_pub_date on public.events (is_published, event_date asc);

-- 10. Clients & Completed Projects
create table if not exists public.clients_projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  sector text not null,
  project_title text not null,
  summary text not null,
  outcome_metric text not null default '',
  testimonial_quote text not null default '',
  testimonial_author text not null default '',
  testimonial_role text not null default '',
  completed_year integer not null default 2026,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_clients_projects_pub on public.clients_projects (is_published, completed_year desc);

-- 11. Social Links
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  is_active boolean not null default true,
  display_order integer not null default 0
);

-- 12. Rate Limits (Auth Lockout & Form Spam Protection)
create table if not exists public.rate_limits (
  key text primary key,
  attempts integer not null default 0,
  locked_until timestamptz,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. Security Audit Logs (Server-only immutable audit trail)
create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'admin_setup',
      'admin_login_success',
      'admin_login_failed',
      'admin_lockout',
      'admin_password_changed',
      'admin_logout',
      'content_updated',
      'gallery_uploaded',
      'gallery_deleted',
      'enquiry_status_changed',
      'booking_status_changed',
      'rate_limit_triggered'
    )
  ),
  actor text not null default 'system',
  ip_address text not null default '',
  user_agent text not null default '',
  resource_type text not null default '',
  resource_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_security_audit_logs_event_created
  on public.security_audit_logs (event_type, created_at desc);

create index if not exists idx_security_audit_logs_created
  on public.security_audit_logs (created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Public visitors may read published content and insert enquiries/bookings only.
-- All admin reads, updates, deletes, and auth tables use server-side Service Role.
-- ============================================================================

alter table public.admin_settings enable row level security;
alter table public.enquiries enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.site_content enable row level security;
alter table public.services enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.clients_projects enable row level security;
alter table public.social_links enable row level security;
alter table public.rate_limits enable row level security;
alter table public.security_audit_logs enable row level security;

-- Public Insert-Only for Enquiries & Bookings
create policy "Public insert enquiries"
  on public.enquiries for insert
  to anon, authenticated
  with check (status = 'new');

create policy "Public insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (status = 'pending');

-- Public Read-Only for Published Content
create policy "Public read gallery categories"
  on public.gallery_categories for select
  to anon, authenticated
  using (true);

create policy "Public read published gallery images"
  on public.gallery_images for select
  to anon, authenticated
  using (is_published = true);

create policy "Public read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "Public read published services"
  on public.services for select
  to anon, authenticated
  using (is_published = true);

create policy "Public read published announcements"
  on public.announcements for select
  to anon, authenticated
  using (is_published = true);

create policy "Public read published events"
  on public.events for select
  to anon, authenticated
  using (is_published = true);

create policy "Public read published clients projects"
  on public.clients_projects for select
  to anon, authenticated
  using (is_published = true);

create policy "Public read active social links"
  on public.social_links for select
  to anon, authenticated
  using (is_active = true);

-- ============================================================================
-- SUPABASE STORAGE BUCKET FOR GALLERY IMAGES
-- Restricts uploads to JPG, PNG, WebP up to 5 MB (5242880 bytes).
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read gallery bucket objects"
  on storage.objects for select
  to public
  using (bucket_id = 'gallery');
