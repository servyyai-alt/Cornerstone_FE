import { notFound } from 'next/navigation';
import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';

const getBackendBaseUrl = () => {
  const rawUrl =
    process.env.API_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000');
  return rawUrl.replace(/\/+$/, '');
};

async function getPageData(slug) {
  try {
    const res = await fetch(`${getBackendBaseUrl()}/api/pages/${slug}?public=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Error loading page ${slug} data on server:`, error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [pageData, seoPage] = await Promise.all([
    getPageData(slug),
    getSeoPageOverrides(slug),
  ]);

  if (!pageData) {
    return createPageMetadata({
      title: 'Page Not Found',
      description: 'The requested page was not found.',
      path: `/${slug}`,
    });
  }

  return createPageMetadata({
    title: pageData.seoTitle || pageData.metaTitle || pageData.title,
    description: pageData.seoDescription || pageData.metaDescription || pageData.description || 'Cornerstone international pathway college.',
    path: `/${slug}`,
    keywords: pageData.seoKeywords || [],
    seoPage,
  });
}

export default async function DynamicCmsPage({ params }) {
  const { slug } = await params;
  
  // Exclude static routes that might match by checking against list
  // Next.js handles static matches first, but this is a safe guard.
  const pageData = await getPageData(slug);

  if (!pageData) {
    notFound();
  }

  return <CmsPageRenderer pageData={pageData} slug={slug} />;
}
