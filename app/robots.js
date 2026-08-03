import { getSiteSettings } from '../lib/seo';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const siteSettings = await getSiteSettings();
  const siteUrl = siteSettings.siteUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
