export type EnquiryStatus = 'new' | 'contacted' | 'closed';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface TrustStat {
  id: string;
  label: string;
  value: string;
  context: string;
}

export interface SiteContentData {
  companyName: string;
  positioning: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  trustStats: TrustStat[];
  aboutSummary: string;
  mission: string;
  vision: string;
  values: { title: string; description: string }[];
  technicalApproach: { step: string; title: string; description: string }[];
  consultingHeadline: string;
  consultingDescription: string;
  consultingHours: string;
  contactPhoneDisplay: string;
  contactPhoneTel: string;
  whatsappNumberIntl: string;
  contactEmail: string;
  officeAddress: string;
  cityRegion: string;
  googleMapsQuery: string;
  officeCoordinates: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  short_summary: string;
  description: string;
  deliverables: string[];
  target_audience: string;
  image_url: string;
  display_order: number;
  is_published: boolean;
  updated_at: string;
}

export interface EnquiryItem {
  id: string;
  organization_name: string;
  service_or_product: string;
  expected_start_date: string;
  expected_end_date: string;
  specific_service: string;
  phone: string;
  email: string;
  location: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface BookingItem {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  preferred_date: string;
  preferred_time: string;
  visitors_count: number;
  purpose: string;
  status: BookingStatus;
  confirmation_sent: boolean;
  created_at: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  category_id: string;
  title: string;
  caption: string;
  image_url: string;
  storage_path: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description: string;
  registration_link: string;
  is_published: boolean;
  created_at: string;
}

export interface ClientProjectItem {
  id: string;
  client_name: string;
  sector: string;
  project_title: string;
  summary: string;
  outcome_metric: string;
  testimonial_quote: string;
  testimonial_author: string;
  testimonial_role: string;
  completed_year: number;
  is_published: boolean;
  created_at: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  is_active: boolean;
  display_order: number;
}

export interface PublicBundle {
  siteContent: SiteContentData;
  services: ServiceItem[];
  galleryCategories: GalleryCategory[];
  galleryImages: GalleryImage[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  clientsProjects: ClientProjectItem[];
  socialLinks: SocialLinkItem[];
}
