# ABM Global Ltd — Website & Lead Management Platform

Production-ready web application for **ABM Global Ltd** (Accra, Ghana): IT Training, Networking & Troubleshooting, Hardware & Software Support, IT Auditing, CCTV & Surveillance Systems, and Computer & Accessories Procurement.

## Architecture & Stack Note

This application runs on **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4** rather than Vite + React Router because:
- The workspace runtime is pre-configured on Next.js 15 (`port 3000`).
- App Router provides native SSR/CSR routing so direct refreshes on `/services`, `/gallery`, `/book-consultation`, `/admin`, etc. never produce false 404s.
- Built-in Route Handlers (`app/api/*`) provide serverless backend endpoints compatible with both **Vercel** and **Netlify** (`@netlify/plugin-nextjs`), keeping `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `ADMIN_SESSION_SECRET` strictly server-side.

## Local & Preview Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
   > Without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set, the app runs seamlessly using a seeded server-side JSON datastore (`.data/abm-store.json`) so all forms, CMS edits, gallery uploads, and admin features work immediately.

## Supabase Configuration (Production PostgreSQL & Storage)

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the full script in `supabase/schema.sql`.
   - Creates all 12 tables (`admin_settings`, `enquiries`, `bookings`, `gallery_categories`, `gallery_images`, `site_content`, `services`, `announcements`, `events`, `clients_projects`, `social_links`, `rate_limits`).
   - Applies strict Row Level Security (RLS) policies: public visitors may read published content and insert enquiries/bookings only.
   - Provisions the `gallery` Storage bucket with a **5 MB max** limit and `image/jpeg`, `image/png`, `image/webp` MIME enforcement.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your hosting environment variables (never expose the service role key to client code).

## Transactional Email (Resend)

1. Create an API key in [Resend](https://resend.com) and verify your sending domain.
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `COMPANY_NOTIFICATION_EMAIL`.
3. Consultation bookings automatically email both the visitor (confirmation) and ABM Global Ltd (notification).

## Creating the First Admin Password

1. Visit `/admin/login` (or `/admin`).
2. On first run, a **One-Time First-Run Setup** screen prompts you to create the administrator password (minimum 8 characters).
3. The password is hashed on the server using `bcryptjs` (12 rounds) and stored in `admin_settings`. Once created, the setup screen is permanently locked.
4. You can change the password anytime inside the dashboard under **Password & Security**, or set `ADMIN_PASSWORD_OVERRIDE` in server environment variables for emergency recovery.

## Deployment (Vercel & Netlify)

- **Vercel**: Push repository to GitHub and import into Vercel. `vercel.json` is pre-configured with security headers and `/api/*` no-cache headers. Add all `.env.example` keys in **Project Settings → Environment Variables**.
- **Netlify**: Connect repository to Netlify. `netlify.toml` (with `@netlify/plugin-nextjs`) and `public/_redirects` are included. Add all `.env.example` keys in **Site Configuration → Environment Variables**.

## Pre-Launch Verification Checklist

- [ ] **Routing & Zero-404s**: Hard-refresh `/services`, `/gallery`, `/clients`, `/book-consultation`, `/enquiry`, `/news`, `/contact`, and `/admin` after deployment; verify HTTP 200 and clean rendering. Confirm invalid URLs (e.g. `/does-not-exist`) display the branded Not Found page with links to Home, Services, and Contact.
- [ ] **Enquiry Form & WhatsApp**: Submit a test enquiry at `/enquiry`; confirm it appears in `/admin` → **Enquiries**, exports cleanly via **Export CSV**, and redirects to `https://wa.me/233594607188?text=...` with all details pre-filled.
- [ ] **Floating WhatsApp & Call Bar**: Verify all 6 topic options in the floating WhatsApp menu and confirm `tel:0594607188` works on desktop and mobile sticky bar.
- [ ] **Consultation Booking & Emails**: Submit a booking at `/book-consultation`; confirm past dates are blocked, booking appears in `/admin` → **Bookings**, and both confirmation + notification emails arrive via Resend.
- [ ] **Admin Security**: Complete first-run password setup at `/admin/login`; confirm `/admin/login` no longer shows setup, verify 6 wrong password attempts trigger the 15-minute lockout, and test password change inside `/admin`.
- [ ] **Mobile & SEO**: Test at 375px mobile width, verify `/sitemap.xml` and `/robots.txt`, and run Lighthouse (target 90+ across Performance, Accessibility, Best Practices, and SEO).
