import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';
import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

export const revalidate = 60;

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'For Parents', href: '/for-parents' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('for-parents');

  return createPageMetadata({
    title: 'For Parents',
    description:
      'A parent-focused overview of recognition, progression, support, and financial planning.',
    path: '/for-parents',
    keywords: ['for parents', 'parent decision centre', 'financial planning'],
    seoPage,
  });
}

export default async function ForParentsLayout({ children }) {
  const pageData = await fetchPublicJson('/pages/for-parents?public=1', null);

  return (
    <RouteDataProvider data={{ pageData }}>
      <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
        {children}
      </SectionShell>
    </RouteDataProvider>
  );
}
