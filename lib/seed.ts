import type {
  AnnouncementItem,
  BookingItem,
  ClientProjectItem,
  EnquiryItem,
  EventItem,
  GalleryCategory,
  GalleryImage,
  ServiceItem,
  SiteContentData,
  SocialLinkItem,
} from './types';

export const DEFAULT_SITE_CONTENT: SiteContentData = {
  companyName: 'ABM Global Ltd',
  positioning:
    'A Trusted and Reliable IT Support and Solutions provider for individuals, groups and organizations.',
  heroHeadline: 'Dependable IT Engineering, Training & Security for Ghana’s Organizations',
  heroSubheadline:
    'A Trusted and Reliable IT Support and Solutions provider for individuals, groups and organizations.',
  heroImageUrl: '/images/hero-abm-it.jpg',
  trustStats: [
    {
      id: 'years',
      label: 'Years of Field Service',
      value: '10+',
      context: 'Serving Accra & Greater Ghana',
    },
    {
      id: 'clients',
      label: 'Clients & Institutions Served',
      value: '240+',
      context: 'Schools, SMEs, NGOs & Homes',
    },
    {
      id: 'trainings',
      label: 'Practical Trainings Delivered',
      value: '1,450+',
      context: 'Students, Teachers & Staff',
    },
    {
      id: 'projects',
      label: 'Infrastructure Projects Completed',
      value: '380+',
      context: 'Networks, Audits & CCTV Systems',
    },
  ],
  aboutSummary:
    'Based in Accra, ABM Global Ltd bridges the gap between everyday technology needs and disciplined enterprise engineering. Our engineers are dedicated to your operational continuity, digital safety, and long-term profitability—never leaving clients stranded after installation or training.',
  mission:
    'To deliver practical IT training, resilient network engineering, honest IT audits, and dependable hardware support with transparent pricing and unwavering after-sale accountability.',
  vision:
    'To become Ghana’s most trusted technology partner for schools, businesses, professionals, and households seeking safe, cost-effective, and long-lasting IT systems.',
  values: [
    {
      title: 'After-Sale Accountability',
      description:
        'Every installation, repair, and hardware delivery includes structured follow-up support so systems keep performing long after handover.',
    },
    {
      title: 'Honest Technical Stewardship',
      description:
        'Clear documentation, genuine equipment sourcing, and audit findings focused on real risk reduction and value for money.',
    },
    {
      title: 'Practical Skill Transfer',
      description:
        'Hands-on instruction tailored for learners, IT teachers, and corporate teams—focused on real daily workflows rather than abstract theory.',
    },
    {
      title: 'Safety & Discipline',
      description:
        'Neat cable management, ESD-safe hardware diagnostics, encrypted surveillance systems, and strict privacy standards across every site.',
    },
  ],
  technicalApproach: [
    {
      step: '01',
      title: 'Assess',
      description:
        'We inspect your current workspace, network topology, hardware health, security blind spots, or team skill level before recommending any spend.',
    },
    {
      step: '02',
      title: 'Plan',
      description:
        'You receive a clear scope, realistic timeline, itemized quotation, and practical training or deployment roadmap with zero hidden fees.',
    },
    {
      step: '03',
      title: 'Deliver',
      description:
        'Certified technicians execute clean structured cabling, hardware commissioning, CCTV mounting, IT audits, or guided classroom labs on schedule.',
    },
    {
      step: '04',
      title: 'Support',
      description:
        'Ongoing preventive maintenance, remote and on-site troubleshooting, warranty follow-through, and direct WhatsApp/phone access to our engineers.',
    },
  ],
  consultingHeadline: 'Book a One-on-One or Team IT Consultation in Accra',
  consultingDescription:
    'Meet with an ABM Global Ltd lead engineer at our Accra office or schedule a site readiness briefing for your school, office, or organization.',
  consultingHours: 'Monday – Friday: 8:30 AM – 5:00 PM · Saturday: 9:30 AM – 2:00 PM (GMT)',
  contactPhoneDisplay: '059 460 7188',
  contactPhoneTel: '0594607188',
  whatsappNumberIntl: '233594607188',
  contactEmail: 'info@abmgloballtd.com',
  officeAddress: '14 Ring Road Central Annex, Asylum Down, Accra, Ghana',
  cityRegion: 'Accra, Greater Accra Region, Ghana',
  googleMapsQuery: 'Asylum+Down+Ring+Road+Central+Accra+Ghana',
  officeCoordinates: '5.5665° N, 0.2055° W',
};

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'svc-training',
    slug: 'it-training',
    title: 'IT Training (Basic & General Knowledge)',
    short_summary:
      'Hands-on digital literacy, office productivity, and educator capacity building for individuals, students, IT teachers, and staff.',
    description:
      'Practical, instructor-led computer and digital skills training designed around real Ghanaian workplace and classroom needs. Participants learn on live workstations with guided exercises rather than passive slide lectures.',
    deliverables: [
      'Fundamental computing, Windows & file management mastery',
      'Microsoft Office & Google Workspace productivity workflows',
      'Refresher bootcamps for school IT teachers & lab coordinators',
      'Safe internet habits, email security & cloud collaboration',
    ],
    target_audience: 'Individuals, Students, IT Teachers, Corporate Teams & NGOs',
    image_url: '/images/service-training.jpg',
    display_order: 1,
    is_published: true,
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'svc-networking',
    slug: 'networking-troubleshooting',
    title: 'Networking & Troubleshooting',
    short_summary:
      'Structured LAN/Wi-Fi architecture, server rack dressing, router configuration, and rapid fault isolation for uninterrupted operations.',
    description:
      'We eliminate dead zones, unstable internet links, and messy cabling closets. Our network engineers design, label, and test enterprise and campus networks built for stability and easy future expansion.',
    deliverables: [
      'Structured Cat6/Cat6A cabling, patch panels & tidy rack dressing',
      'Multi-floor Wi-Fi access point planning & VLAN segmentation',
      'Dual-WAN failover, firewall rules & bandwidth management',
      'Fast on-site network fault diagnostics and throughput tuning',
    ],
    target_audience: 'Offices, Schools, Clinics, Hotels & Multi-User Workspaces',
    image_url: '/images/service-networking.jpg',
    display_order: 2,
    is_published: true,
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'svc-hardware',
    slug: 'hardware-software-support',
    title: 'Hardware & Software Support',
    short_summary:
      'Diagnostics, component-level repairs, OS deployment, backup recovery, and preventive maintenance contracts with reliable after-sale care.',
    description:
      'Whether reviving a critical workstation or managing a 60-computer school lab, we deliver clean workbench diagnostics, licensed software deployment, and responsive SLA-backed after-sale support.',
    deliverables: [
      'Laptop, desktop, printer & UPS diagnostics and component repair',
      'SSD/RAM upgrades, thermal servicing & clean OS provisioning',
      'Malware removal, endpoint protection & automated backup setup',
      'Scheduled preventive maintenance retainers for organizations',
    ],
    target_audience: 'Businesses, Professionals, Computer Labs & Individual Users',
    image_url: '/images/service-hardware.jpg',
    display_order: 3,
    is_published: true,
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'svc-auditing',
    slug: 'it-auditing',
    title: 'IT Auditing & Systems Assurance',
    short_summary:
      'Independent infrastructure, cybersecurity, licensing, and vendor-spend audits that deliver actionable value for money.',
    description:
      'Many organizations pay for IT audits that sit unread on a shelf. Our audit engagements give leadership clear, prioritized risk ratings, asset verification, cost-saving recommendations, and a practical remediation checklist.',
    deliverables: [
      'Complete IT asset inventory, software licensing & lifecycle review',
      'Network security posture, access control & backup resilience check',
      'Vendor spend & bandwidth efficiency assessment',
      'Executive summary report with prioritized 30/60/90-day remediation plan',
    ],
    target_audience: 'SMEs, Financial Institutions, NGOs, Schools & Boards',
    image_url: '/images/service-auditing.jpg',
    display_order: 4,
    is_published: true,
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'svc-cctv',
    slug: 'cctv-surveillance',
    title: 'CCTV & Surveillance Systems',
    short_summary:
      'Clean IP/HD camera installation, NVR storage sizing, mobile remote viewing, plus hands-on CCTV technician training.',
    description:
      'Protect your premises with weatherproof, neatly conduit-routed surveillance installations—and empower your internal team or aspiring technicians with our practical CCTV installation and configuration training.',
    deliverables: [
      'Site blind-spot survey & camera coverage planning',
      'Clean indoor/outdoor dome & bullet IP camera installation',
      'NVR sizing, UPS power backup & encrypted mobile phone viewing',
      'Practical CCTV installation & troubleshooting training cohorts',
    ],
    target_audience: 'Warehouses, Offices, Residences, Schools & Aspiring Technicians',
    image_url: '/images/service-cctv.jpg',
    display_order: 5,
    is_published: true,
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'svc-procurement',
    slug: 'computer-procurement',
    title: 'Computer & Accessories Procurement',
    short_summary:
      'Verified laptops, desktops, servers, UPS backups, printers, and networking gear sourced with genuine warranties and pre-delivery testing.',
    description:
      'Eliminate counterfeit parts and mismatched specifications. We source authentic enterprise and academic IT equipment, stress-test every unit prior to delivery, and back every purchase with local warranty support in Accra.',
    deliverables: [
      'Business laptops, workstations, monitors & school lab bundles',
      'Cisco/MikroTik/Ubiquiti routers, switches & structured cabling kits',
      'APC/online UPS units, surge protection & multifunction printers',
      'Pre-delivery imaging, asset tagging & verified local warranty coverage',
    ],
    target_audience: 'Procurement Teams, Schools, Startups & Individual Buyers',
    image_url: '/images/service-procurement.jpg',
    display_order: 6,
    is_published: true,
    updated_at: '2026-10-01T09:00:00.000Z',
  },
];

export const DEFAULT_GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: 'cat-training', name: 'Computer Training', slug: 'computer-training', display_order: 1, created_at: '2026-10-01T09:00:00.000Z' },
  { id: 'cat-networking', name: 'Networking and Troubleshooting', slug: 'networking-troubleshooting', display_order: 2, created_at: '2026-10-01T09:00:00.000Z' },
  { id: 'cat-hardware', name: 'Hardware and Software Support', slug: 'hardware-software-support', display_order: 3, created_at: '2026-10-01T09:00:00.000Z' },
  { id: 'cat-auditing', name: 'IT Auditing', slug: 'it-auditing', display_order: 4, created_at: '2026-10-01T09:00:00.000Z' },
  { id: 'cat-cctv', name: 'CCTV and Surveillance', slug: 'cctv-surveillance', display_order: 5, created_at: '2026-10-01T09:00:00.000Z' },
  { id: 'cat-procurement', name: 'Computer and Accessories Procurement', slug: 'computer-accessories-procurement', display_order: 6, created_at: '2026-10-01T09:00:00.000Z' },
];

export const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'img-1',
    category_id: 'cat-training',
    title: 'Practical Productivity Workshop — Accra Cohort',
    caption: 'Hands-on computer lab instruction for administrative staff and educators.',
    image_url: '/images/service-training.jpg',
    storage_path: null,
    is_published: true,
    display_order: 1,
    created_at: '2026-10-05T10:00:00.000Z',
  },
  {
    id: 'img-2',
    category_id: 'cat-networking',
    title: '42U Core Switch & Structured Cat6 Rack Dressing',
    caption: 'Labeled patch panels and redundant switching deployed for an Airport Residential office.',
    image_url: '/images/service-networking.jpg',
    storage_path: null,
    is_published: true,
    display_order: 2,
    created_at: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'img-3',
    category_id: 'cat-hardware',
    title: 'ESD-Safe Motherboard & Workstation Diagnostics',
    caption: 'Precision hardware diagnostics and thermal servicing at our Asylum Down workbench.',
    image_url: '/images/service-hardware.jpg',
    storage_path: null,
    is_published: true,
    display_order: 3,
    created_at: '2026-10-07T10:00:00.000Z',
  },
  {
    id: 'img-4',
    category_id: 'cat-auditing',
    title: 'Annual Infrastructure & Security Compliance Audit',
    caption: 'Network topology review and asset verification briefing for executive leadership.',
    image_url: '/images/service-auditing.jpg',
    storage_path: null,
    is_published: true,
    display_order: 4,
    created_at: '2026-10-08T10:00:00.000Z',
  },
  {
    id: 'img-5',
    category_id: 'cat-cctv',
    title: 'Perimeter IP Dome & Bullet Camera Mounting',
    caption: 'Weatherproof conduit-sealed surveillance deployment for a commercial complex in Tema.',
    image_url: '/images/service-cctv.jpg',
    storage_path: null,
    is_published: true,
    display_order: 5,
    created_at: '2026-10-09T10:00:00.000Z',
  },
  {
    id: 'img-6',
    category_id: 'cat-procurement',
    title: 'Verified Corporate Laptop, Monitor & UPS Batch',
    caption: 'Pre-tested business workstations, dual-band routers, and APC backup units ready for dispatch.',
    image_url: '/images/service-procurement.jpg',
    storage_path: null,
    is_published: true,
    display_order: 6,
    created_at: '2026-10-10T10:00:00.000Z',
  },
];

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: '2026–2027 Corporate & School IT Preventive Maintenance Retainers Now Open',
    summary:
      'Organizations across Accra and Tema can now lock in quarterly on-site health checks, priority response SLAs, and discounted hardware diagnostics.',
    body: 'ABM Global Ltd has expanded our Accra field engineering team to offer structured quarterly preventive maintenance plans for schools, medical practices, and SMEs. Retainer partners receive scheduled workstation cleanups, backup verification, network health audits, and same-day priority support.',
    category: 'Service Notice',
    is_published: true,
    published_at: '2026-11-10T09:00:00.000Z',
    created_at: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'ann-2',
    title: 'Genuine Business Laptop & UPS Restock for Educational Institutions',
    summary:
      'New verified shipments of Core i5/i7 business laptops, 24-inch IPS displays, and line-interactive UPS units have arrived with full local warranty.',
    body: 'We have completed quality testing on our latest hardware batch for schools and corporate offices. Every unit ships with a verified serial report, clean OS imaging, and dedicated after-sale warranty handling right here in Accra.',
    category: 'Procurement Update',
    is_published: true,
    published_at: '2026-11-02T09:00:00.000Z',
    created_at: '2026-11-02T09:00:00.000Z',
  },
];

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Practical CCTV & IP Surveillance Installation Bootcamp',
    event_date: '2026-12-05',
    event_time: '09:00 AM – 03:30 PM',
    location: 'ABM Global Training Lab, Asylum Down, Accra',
    description:
      'Hands-on one-day workshop covering camera placement, Cat6 PoE termination, NVR storage calculation, and secure mobile remote viewing.',
    registration_link: '/enquiry?service=CCTV+%26+Surveillance+Systems',
    is_published: true,
    created_at: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'evt-2',
    title: 'IT Teachers & Lab Coordinators Digital Productivity Clinic',
    event_date: '2026-12-12',
    event_time: '10:00 AM – 02:00 PM',
    location: 'ABM Global Training Lab, Accra',
    description:
      'A practical capacity-building session for basic and senior high school IT teachers covering classroom lab maintenance, troubleshooting, and modern office suites.',
    registration_link: '/book-consultation',
    is_published: true,
    created_at: '2026-11-08T09:00:00.000Z',
  },
];

export const DEFAULT_CLIENTS_PROJECTS: ClientProjectItem[] = [
  {
    id: 'cp-1',
    client_name: 'Ridgeway Montessori & Preparatory School',
    sector: 'Education',
    project_title: '40-Seat Computer Lab Deployment, Structured LAN & Teacher Training',
    summary:
      'Designed and cabled a 40-workstation ICT lab with centralized power protection, filtered internet routing, and a 3-day practical bootcamp for all teaching staff.',
    outcome_metric: '99.4% lab uptime across 3 academic terms',
    testimonial_quote:
      'Previously our computers broke down within months with nobody to call. ABM Global wired the lab cleanly, trained our teachers, and still checks in every term.',
    testimonial_author: 'Mrs. Grace Mensah',
    testimonial_role: 'Head of Administration, Ridgeway School',
    completed_year: 2026,
    is_published: true,
    created_at: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'cp-2',
    client_name: 'GoldCoast Freight & Logistics Ltd',
    sector: 'Logistics & Warehousing',
    project_title: '24-Camera IP CCTV Surveillance & Multi-Office Network Overhaul',
    summary:
      'Replaced failing analog cameras and tangled switches across the Tema warehouse and Accra head office with weatherproof 4MP IP cameras and neatly labeled fiber uplinks.',
    outcome_metric: '100% loading-bay coverage & 45% faster ERP sync',
    testimonial_quote:
      'Their engineers walked us through every cable run and handed over clear diagrams. We finally have reliable remote visibility without hidden maintenance surprises.',
    testimonial_author: 'Kwame Boateng',
    testimonial_role: 'Operations Director, GoldCoast Logistics',
    completed_year: 2026,
    is_published: true,
    created_at: '2026-08-20T09:00:00.000Z',
  },
  {
    id: 'cp-3',
    client_name: 'Accra Heritage Microfinance',
    sector: 'Financial Services',
    project_title: 'Comprehensive IT Systems Audit & Hardware Refresh Procurement',
    summary:
      'Conducted an independent IT audit uncovering unlicensed endpoints and single-point backup risks, followed by verified procurement of 18 business laptops and automated NAS backups.',
    outcome_metric: '28% annual IT spend reduction with verified backups',
    testimonial_quote:
      'The audit paid for itself in the first quarter. ABM Global gave our board plain-English answers and sourced authentic hardware on budget.',
    testimonial_author: 'Daniel Osei-Tutu',
    testimonial_role: 'Finance & Risk Lead, Accra Heritage',
    completed_year: 2025,
    is_published: true,
    created_at: '2025-11-12T09:00:00.000Z',
  },
];

export const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  { id: 'soc-fb', platform: 'Facebook', label: 'ABM Global Ltd on Facebook', url: 'https://facebook.com/abmgloballtd', is_active: true, display_order: 1 },
  { id: 'soc-li', platform: 'LinkedIn', label: 'ABM Global Ltd on LinkedIn', url: 'https://linkedin.com/company/abm-global-ltd', is_active: true, display_order: 2 },
  { id: 'soc-ig', platform: 'Instagram', label: 'ABM Global Ltd on Instagram', url: 'https://instagram.com/abmgloballtd', is_active: true, display_order: 3 },
  { id: 'soc-x', platform: 'X', label: 'ABM Global Ltd on X', url: 'https://x.com/abmgloballtd', is_active: true, display_order: 4 },
];

export const DEFAULT_ENQUIRIES: EnquiryItem[] = [
  {
    id: 'enq-seed-1',
    organization_name: 'St. Theresa Community Clinic',
    service_or_product: '20-Point Structured LAN Cabling & 2 Business Desktops',
    expected_start_date: '2026-12-01',
    expected_end_date: '2026-12-06',
    specific_service: 'Networking & Troubleshooting',
    phone: '0244123456',
    email: 'admin@sttheresaclinic.example.com',
    location: 'East Legon, Accra',
    message: 'Need clean cabling across reception, lab, and records room with UPS protection.',
    status: 'new',
    created_at: '2026-11-20T14:20:00.000Z',
  },
];

export const DEFAULT_BOOKINGS: BookingItem[] = [
  {
    id: 'bkg-seed-1',
    full_name: 'Abena Kwarteng',
    phone: '0559876543',
    email: 'abena.kwarteng@example.com',
    preferred_date: '2026-12-02',
    preferred_time: '10:30 AM',
    visitors_count: 2,
    purpose: 'Office IT Audit and staff Microsoft 365 training roadmap.',
    status: 'confirmed',
    confirmation_sent: true,
    created_at: '2026-11-19T11:15:00.000Z',
  },
];
