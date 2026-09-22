import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('programmes');

  return createPageMetadata({
    title: 'Programmes',
    description: 'Explore Cornerstone\'s range of programmes designed to support students at every stage of their educational journey.',
    path: '/programmes',
    keywords: ['programmes', 'educational pathways', 'courses'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Programmes</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        Our Programmes
      </h1>
      <p className="mt-4 text-muted-foreground text-lg">
        We offer a range of programmes to support your educational journey, from initial guidance
        through to university placement and beyond.
      </p>
    </Container>
    <Container className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">Pathways</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Our structured pathways help students transition smoothly from school-leaving to
          university studies, with personalised support at every stage.
        </p>
      </div>
    </Container>
  </main>
);

import { fetchPublicJson } from '../../../lib/serverApi';

export default async function ProgrammesPage() {
  const pageData = await fetchPublicJson('/pages/programmes?public=1');
  return <CmsPageRenderer pageData={pageData} slug="programmes" fallback={fallback} />;
}
