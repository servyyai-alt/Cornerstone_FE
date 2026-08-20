import Home from './Home';
import { createPageMetadata, getSeoPageOverrides, siteConfig } from '../../lib/seo';

export const revalidate = 60;

const getBackendBaseUrl = () => {
  const rawUrl =
    process.env.API_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000');
  return rawUrl.replace(/\/+$/, '');
};

async function getHomepageData() {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/homepage?public=1`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error loading homepage data on the server:', error);
    return null;
  }
}

export async function generateMetadata() {
  const [homepageData, seoPage] = await Promise.all([
    getHomepageData(),
    getSeoPageOverrides('home'),
  ]);

  const pageData = homepageData?.pageData || null;
  const heroSection = Array.isArray(pageData?.sections)
    ? pageData.sections.find((section) => section.sectionId === 'hero')
    : null;

  return createPageMetadata({
    title: pageData?.seoTitle || pageData?.metaTitle || pageData?.title || siteConfig.name,
    description:
      seoPage?.seoDescription ||
      seoPage?.metaDescription ||
      pageData?.seoDescription ||
      pageData?.metaDescription ||
      pageData?.description ||
      heroSection?.subtitle ||
      siteConfig.description,
    path: '/',
    keywords: ['international pathway college', 'study abroad', 'credit transfer', 'UK degree'],
    seoPage,
  });
}

export default async function Page() {
  const initialData = await getHomepageData();
  return <Home initialData={initialData} />;
}
