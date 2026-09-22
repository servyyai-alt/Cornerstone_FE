import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('pathways');

  return createPageMetadata({
    title: 'Pathways',
    description: 'Choose the route that matches your current study stage and ambition.',
    path: '/pathways',
    keywords: ['pathways', 'school leavers', 'university students', 'graduates'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
        Pathways
      </p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        Choose the route that fits your starting point.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Each pathway is designed for a different stage of study, but they all follow the same
        staged model.
      </p>
    </Container>
    <Container className="grid gap-6 md:grid-cols-3">
      {[
        { title: 'School Leavers', description: 'Start in India, build regulated credits, and transfer after a staged academic bridge.', href: '/pathways/school-leavers' },
        { title: 'University Students', description: 'Map existing transcripts into the pathway and explore credit transfer or advanced standing.', href: '/pathways/university-students' },
        { title: 'Graduates', description: 'Use postgraduate credit bridges to progress into an international master\'s route.', href: '/pathways/graduates' },
      ].map((card) => (
        <article
          key={card.href}
          className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
        >
          <h2 className="font-display text-xl text-foreground">{card.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
        </article>
      ))}
    </Container>
  </main>
);

import { fetchPublicJson } from '../../../lib/serverApi';

export default async function PathwaysPage() {
  const pageData = await fetchPublicJson('/pages/pathways?public=1');
  return <CmsPageRenderer pageData={pageData} slug="pathways" fallback={fallback} />;
}
