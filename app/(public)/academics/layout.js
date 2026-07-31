import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('academics');

  return createPageMetadata({
    title: 'Academics',
    description: 'Understand recognition, credit transfer, and how the Cornerstone pathway maps to UK standards.',
    path: '/academics',
    keywords: ['recognition', 'credit transfer', 'academics'],
    seoPage,
  });
}

export default function AcademicsLayout({ children }) {
  return (
    <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
      {children}
    </SectionShell>
  );
}
