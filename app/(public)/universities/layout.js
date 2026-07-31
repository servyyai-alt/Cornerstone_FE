import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';
import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

export const revalidate = 60;

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Universities', href: '/universities' },
];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('universities');

  return createPageMetadata({
    title: 'University Explorer',
    description:
      'See the universities, destinations, and progression partners available through Cornerstone pathways.',
    path: '/universities',
    keywords: ['universities', 'partner universities', 'progression'],
    seoPage,
  });
}

export default async function UniversitiesLayout({ children }) {
  const universities = await fetchPublicJson('/universities?public=1', []);

  return (
    <RouteDataProvider data={{ universities }}>
      <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
        {children}
      </SectionShell>
    </RouteDataProvider>
  );
}
