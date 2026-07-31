import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';
import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

export const revalidate = 60;

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('contact');

  return createPageMetadata({
    title: 'Contact',
    description: 'Book a consultation or contact Cornerstone admissions for guidance.',
    path: '/contact',
    keywords: ['contact', 'book consultation', 'admissions'],
    seoPage,
  });
}

export default async function ContactLayout({ children }) {
  const [contactSettings, websiteSettings] = await Promise.all([
    fetchPublicJson('/settings/contact?public=1', null),
    fetchPublicJson('/settings/website?public=1', null),
  ]);

  return (
    <RouteDataProvider data={{ contactSettings, websiteSettings }}>
      <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
        {children}
      </SectionShell>
    </RouteDataProvider>
  );
}
