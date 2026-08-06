import { cache } from 'react';
import { fetchPublicJson } from './serverApi';

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const siteUrlFallback = 'http://localhost:3000';

export const siteConfig = {
  name: 'Cornerstone',
  shortName: 'Cornerstone',
  description:
    "India's specialist international pathway college. Begin a UK-recognised degree at home, transfer to a partner university abroad, graduate internationally.",
  url: normalizeBaseUrl(siteUrlFallback),
  ogImage: '/assets/hero.png',
  twitterCard: 'summary_large_image',
};

const trimValue = (value) => String(value ?? '').trim();

const normalizeKeywords = (keywords = []) =>
  Array.isArray(keywords)
    ? keywords.map((keyword) => trimValue(keyword)).filter(Boolean)
    : trimValue(keywords)
        .split(',')
        .map((keyword) => trimValue(keyword))
        .filter(Boolean);

const normalizeAssetUrl = (asset, siteUrl = siteConfig.url) => {
  const raw = trimValue(asset);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return new URL(raw, normalizeBaseUrl(siteUrl) || siteConfig.url).toString();
  return raw;
};

export const resolveSiteUrl = (path = '/', siteUrl = siteConfig.url) => {
  const rawPath = String(path || '/').trim();
  if (/^https?:\/\//i.test(rawPath)) return rawPath;
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return new URL(normalizedPath, normalizeBaseUrl(siteUrl) || siteConfig.url).toString();
};

export const normalizeSiteSettings = (settings = {}) => {
  const siteUrl = normalizeBaseUrl(settings.siteUrl || siteConfig.url) || siteConfig.url;

  return {
    key: settings.key || 'global',
    siteName: trimValue(settings.siteName) || siteConfig.name,
    siteUrl,
    siteDescription: trimValue(settings.siteDescription) || siteConfig.description,
    siteKeywords: normalizeKeywords(settings.siteKeywords),
    siteLogo: trimValue(settings.siteLogo),
    favicon: trimValue(settings.favicon),
    googleSiteVerification: trimValue(settings.googleSiteVerification),
    bingSiteVerification: trimValue(settings.bingSiteVerification),
    yandexSiteVerification: trimValue(settings.yandexSiteVerification),
    googleAnalyticsId: trimValue(settings.googleAnalyticsId),
    googleTagManagerId: trimValue(settings.googleTagManagerId),
    facebookPixelId: trimValue(settings.facebookPixelId),
    microsoftClarityId: trimValue(settings.microsoftClarityId),
    facebookUrl: trimValue(settings.facebookUrl),
    instagramUrl: trimValue(settings.instagramUrl),
    linkedinUrl: trimValue(settings.linkedinUrl),
    twitterUrl: trimValue(settings.twitterUrl),
    youtubeUrl: trimValue(settings.youtubeUrl),
    supportEmail: trimValue(settings.supportEmail).toLowerCase(),
    supportPhone: trimValue(settings.supportPhone),
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
};

export const getSiteSettings = cache(async () => {
  const settings = await fetchPublicJson('/settings?public=1', null, {
    cache: 'no-store',
  });

  return normalizeSiteSettings(settings || {});
});

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

const buildVerification = (siteSettings) => {
  const verification = {};

  if (siteSettings.googleSiteVerification) {
    verification.google = siteSettings.googleSiteVerification;
  }

  if (siteSettings.yandexSiteVerification) {
    verification.yandex = siteSettings.yandexSiteVerification;
  }

  if (siteSettings.bingSiteVerification) {
    verification.other = {
      ...(verification.other || {}),
      'msvalidate.01': siteSettings.bingSiteVerification,
    };
  }

  return verification;
};

export const createPageMetadata = async ({
  title,
  description,
  path = '/',
  keywords = [],
  image = siteConfig.ogImage,
  type = 'website',
  robots,
  seoPage = null,
  siteSettings: providedSiteSettings = null,
} = {}) => {
  const siteSettings = normalizeSiteSettings(providedSiteSettings || (await getSiteSettings()));
  const siteName = siteSettings.siteName || siteConfig.name;
  const siteDescription = siteSettings.siteDescription || siteConfig.description;
  const siteUrl = siteSettings.siteUrl || siteConfig.url;
  const defaultKeywords = siteSettings.siteKeywords.length ? siteSettings.siteKeywords : normalizeKeywords(['Cornerstone', 'international pathway college']);

  const canonicalUrl = seoPage?.canonicalUrl
    ? resolveSiteUrl(seoPage.canonicalUrl, siteUrl)
    : resolveSiteUrl(path, siteUrl);

  const metaTitle = seoPage?.metaTitle || (title && title !== siteConfig.name ? title : siteName);
  const metaDescription =
    seoPage?.metaDescription ||
    (description && description !== siteConfig.description ? description : siteDescription);
  const metaKeywords = normalizeKeywords(
    seoPage?.metaKeywords?.length ? seoPage.metaKeywords : keywords.length ? keywords : defaultKeywords
  );
  const ogTitle = seoPage?.openGraphTitle || metaTitle;
  const ogDescription = seoPage?.openGraphDescription || metaDescription;
  const ogImage = normalizeAssetUrl(seoPage?.ogImage || image || siteSettings.siteLogo || siteConfig.ogImage, siteUrl);
  const favicon = normalizeAssetUrl(siteSettings.favicon, siteUrl);
  const twitterCard = seoPage?.twitterCard || siteConfig.twitterCard;

  const metadata = {
    metadataBase: new URL(siteUrl),
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
      siteName,
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
    verification: buildVerification(siteSettings),
  };

  if (favicon) {
    metadata.icons = {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    };
  }

  return metadata;
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
  email,
  telephone,
} = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name,
  url,
  logo,
  sameAs: sameAs.filter(Boolean),
  ...(email || telephone
    ? {
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          ...(email ? { email } : {}),
          ...(telephone ? { telephone } : {}),
          availableLanguage: ['en'],
        },
      }
    : {}),
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
  '/about',
  '/programmes',
];
