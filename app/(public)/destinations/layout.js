import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';
import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

export const revalidate = 60;

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Destinations', href: '/destinations' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('destinations');

  return createPageMetadata({
    title: 'Destinations',
    description:
      'Compare key destination countries and study-abroad considerations for the Cornerstone pathway.',
    path: '/destinations',
    keywords: ['destinations', 'study abroad', 'living cost', 'visa'],
    seoPage,
  });
}

export default async function DestinationsLayout({ children }) {
  const destinations = await fetchPublicJson('/destinations?public=1', []);

  return (
    <RouteDataProvider data={{ destinations }}>
      <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
        {children}
      </SectionShell>
    </RouteDataProvider>
  );
}
