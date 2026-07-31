import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Admissions', href: '/admissions' }];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('admissions');

  return createPageMetadata({
    title: 'Admissions',
    description: 'Review the admissions journey, eligibility checks, and pathway fees before you apply.',
    path: '/admissions',
    keywords: ['admissions', 'eligibility', 'fees', 'application'],
    seoPage,
  });
}

export default function AdmissionsLayout({ children }) {
  return (
    <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
      {children}
    </SectionShell>
  );
}

