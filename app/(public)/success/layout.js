import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';
import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

export const revalidate = 60;

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Success Stories', href: '/success' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('success');

  return createPageMetadata({
    title: 'Success Stories',
    description: 'Read student journeys and outcomes from the Cornerstone pathway model.',
    path: '/success',
    keywords: ['student success', 'success stories', 'pathway outcomes'],
    seoPage,
  });
}

export default async function SuccessLayout({ children }) {
  const stories = await fetchPublicJson('/success-stories?public=1', []);

  return (
    <RouteDataProvider data={{ stories }}>
      <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
        {children}
      </SectionShell>
    </RouteDataProvider>
  );
}
