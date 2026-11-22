import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.APP_URL || 'https://abmgloballtd.com').replace(/\/$/, '');
  const now = new Date();
  const routes = [
    '',
    '/about',
    '/services',
    '/gallery',
    '/clients',
    '/book-consultation',
    '/enquiry',
    '/news',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/news' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route === '/services' || route === '/enquiry' ? 0.9 : 0.8,
  }));
}
