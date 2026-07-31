import { fetchPublicJson } from './serverApi';

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'http://localhost:3000';

export const siteConfig = {
  name: 'Cornerstone',
  shortName: 'Cornerstone',
  description:
    "India's specialist international pathway college. Begin a UK-recognised degree at home, transfer to a partner university abroad, graduate internationally.",
  url: rawSiteUrl.replace(/\/+$/, ''),
  ogImage: '/assets/hero.png',
  twitterCard: 'summary_large_image',
};

const normalizePath = (path = '/') => {
  if (!path) return '/';
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

export const resolveSiteUrl = (path = '/') =>
  new URL(normalizePath(path), siteConfig.url).toString();

const parseRobots = (value, defaultIndex = true) => {
  const text = String(value || '').toLowerCase();

  const index = text.includes('noindex')
    ? false
    : text.includes('index')
      ? true
      : defaultIndex;
  const follow = text.includes('nofollow')
    ? false
    : text.includes('follow')
      ? true
      : defaultIndex;

  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
};

const buildVerification = () => {
  const verification = {};

  const google =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  const yandex = process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION;

  if (google) verification.google = google;
  if (bing) verification.bing = bing;
  if (yandex) verification.yandex = yandex;

  return verification;
};

const toKeywordList = (keywords = []) =>
  Array.isArray(keywords)
    ? keywords.filter(Boolean)
    : String(keywords || '')
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);

export const createPageMetadata = ({
  title,
  description,
  path = '/',
  keywords = [],
  image = siteConfig.ogImage,
  type = 'website',
  robots,
  seoPage = null,
}) => {
  const canonicalUrl = seoPage?.canonicalUrl || resolveSiteUrl(path);
  const metaTitle = seoPage?.metaTitle || title;
  const metaDescription = seoPage?.metaDescription || description;
  const metaKeywords = toKeywordList(seoPage?.metaKeywords?.length ? seoPage.metaKeywords : keywords);
  const ogTitle = seoPage?.openGraphTitle || metaTitle;
  const ogDescription = seoPage?.openGraphDescription || metaDescription;
  const ogImage = seoPage?.ogImage || image;
  const twitterCard = seoPage?.twitterCard || siteConfig.twitterCard;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: parseRobots(seoPage?.robots || robots),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
};

export const getSeoPageOverrides = async (slug) => {
  if (!slug) return null;
  return fetchPublicJson(`/seo-pages/${slug}`, null);
};

export const createOrganizationSchema = ({
  name = siteConfig.name,
  url = siteConfig.url,
  logo = resolveSiteUrl(siteConfig.ogImage),
  sameAs = [],
} = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name,
  url,
  logo,
  sameAs,
});

export const createWebsiteSchema = ({
  name = siteConfig.name,
  url = siteConfig.url,
  searchUrl,
} = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  url,
  ...(searchUrl
    ? {
        potentialAction: {
          '@type': 'SearchAction',
          target: `${searchUrl}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }
    : {}),
});

export const createBreadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: item.href ? resolveSiteUrl(item.href) : undefined,
  })),
});

export const publicRoutes = [
  '/',
  '/how-it-works',
  '/pathways',
  '/find-your-pathway',
  '/contact',
  '/success',
  '/destinations',
  '/universities',
  '/for-parents',
  '/academics',
  '/admissions',
  '/admissions/eligibility',
  '/admissions/fees',
  '/pathways/school-leavers',
  '/pathways/university-students',
  '/pathways/graduates',
  '/academics/recognition',
  '/academics/transfer',
  '/privacy',
  '/terms',
  '/accessibility',
];
