import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Pathways', href: '/pathways' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('pathways');

  return createPageMetadata({
    title: 'Pathways',
    description:
      'Compare the Cornerstone pathways for school leavers, university students, and graduates.',
    path: '/pathways',
    keywords: ['pathways', 'school leavers', 'university students', 'graduates'],
    seoPage,
  });
}

export default function PathwaysLayout({ children }) {
  return (
    <SectionShell
      breadcrumbs={breadcrumbs}
      schema={createBreadcrumbSchema(breadcrumbs)}
    >
      {children}
    </SectionShell>
  );
}
