import SectionShell from '../../../components/SectionShell';
import {
  createBreadcrumbSchema,
  createPageMetadata,
  getSeoPageOverrides,
} from '../../../lib/seo';

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Find Your Pathway', href: '/find-your-pathway' },
];

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('find-your-pathway');

  return createPageMetadata({
    title: 'Find Your Pathway',
    description:
      'Answer a few questions and get a personalised international pathway plan from Cornerstone.',
    path: '/find-your-pathway',
    keywords: ['pathway finder', 'international degree', 'study abroad'],
    seoPage,
  });
}

export default function FindYourPathwayLayout({ children }) {
  return (
    <SectionShell breadcrumbs={breadcrumbs} schema={createBreadcrumbSchema(breadcrumbs)}>
      {children}
    </SectionShell>
  );
}

