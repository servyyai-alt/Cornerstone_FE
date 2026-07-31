import { fetchPublicJson } from '../lib/serverApi';
import { publicRoutes, resolveSiteUrl } from '../lib/seo';

export const revalidate = 3600;

const staticPriorities = new Map([
  ['/', 1],
  ['/pathways', 0.85],
  ['/academics', 0.85],
  ['/contact', 0.9],
  ['/find-your-pathway', 0.9],
  ['/admissions', 0.8],
  ['/universities', 0.8],
  ['/success', 0.8],
]);

const routeToEntry = (route) => ({
  url: resolveSiteUrl(route),
  lastModified: new Date(),
  changeFrequency: route === '/' ? 'weekly' : 'monthly',
  priority: staticPriorities.get(route) || 0.6,
});

const pageSlugToRoute = (slug = '') => {
  if (slug === 'home') return '/';
  return slug ? `/${slug}` : null;
};

export default async function sitemap() {
  const [pages, seoPages] = await Promise.all([
    fetchPublicJson('/pages/public', []),
    fetchPublicJson('/seo-pages/public', []),
  ]);

  const dynamicRoutes = [
    ...(Array.isArray(pages) ? pages : [])
      .map((page) => {
        const route = pageSlugToRoute(page.slug);
        if (!route) return null;

        return {
          url: resolveSiteUrl(route),
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          changeFrequency: 'monthly',
          priority: page.slug === 'home' ? 1 : 0.7,
        };
      })
      .filter(Boolean),
    ...(Array.isArray(seoPages) ? seoPages : [])
      .map((page) => {
        const route = pageSlugToRoute(page.slug);
        const url = page.canonicalUrl || (route ? resolveSiteUrl(route) : null);

        if (!url) return null;

        return {
          url,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.5,
        };
      })
      .filter(Boolean),
  ];

  const staticRoutes = publicRoutes.map(routeToEntry);
  const combined = [...staticRoutes, ...dynamicRoutes];
  const deduped = new Map();

  for (const entry of combined) {
    deduped.set(entry.url, entry);
  }

  return Array.from(deduped.values());
}
