import type { Metadata } from 'next';
import { Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = (process.env.APP_URL || 'https://abmgloballtd.com').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ABM Global Ltd | Trusted IT Training, Support & Solutions in Accra, Ghana',
    template: '%s | ABM Global Ltd',
  },
  description:
    'ABM Global Ltd delivers practical IT training, networking & troubleshooting, hardware & software support, IT auditing, CCTV installation, and computer procurement in Accra, Ghana.',
  keywords: [
    'IT support Accra Ghana',
    'IT training Ghana',
    'Networking and troubleshooting Accra',
    'CCTV installation Accra',
    'IT auditing Ghana',
    'Computer procurement Accra',
    'ABM Global Ltd',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteUrl,
    siteName: 'ABM Global Ltd',
    title: 'ABM Global Ltd | Trusted IT Training, Support & Solutions in Accra, Ghana',
    description:
      'A Trusted and Reliable IT Support and Solutions provider for individuals, groups and organizations in Accra, Ghana.',
    images: [
      {
        url: '/images/hero-abm-it.jpg',
        width: 1200,
        height: 675,
        alt: 'ABM Global Ltd IT engineers collaborating in Accra, Ghana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABM Global Ltd | IT Training & Solutions in Accra, Ghana',
    description:
      'Dependable IT training, networking, hardware support, IT auditing, CCTV surveillance & procurement in Accra, Ghana.',
    images: ['/images/hero-abm-it.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'ABM Global Ltd',
    description:
      'A Trusted and Reliable IT Support and Solutions provider for individuals, groups and organizations in Accra, Ghana.',
    url: siteUrl,
    telephone: '+233594607188',
    email: 'info@abmgloballtd.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Ring Road Central Annex, Asylum Down',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.5665,
      longitude: -0.2055,
    },
    areaServed: {
      '@type': 'City',
      name: 'Accra',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:30',
        closes: '14:00',
      },
    ],
  };

  return (
    <html lang="en" className={`${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-white text-[#0B1F3A] antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
