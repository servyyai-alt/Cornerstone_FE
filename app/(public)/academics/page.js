import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('academics');

  return createPageMetadata({
    title: 'Academics',
    description: 'Explore recognition and credit transfer details for the Cornerstone pathway.',
    path: '/academics',
    keywords: ['academics', 'recognition', 'credit transfer'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
        Academics
      </p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        How the pathway maps to recognised academic standards.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        These pages explain the academic logic behind the model so families can evaluate it with
        confidence.
      </p>
    </Container>
    <Container className="grid gap-6 md:grid-cols-2">
      {[
        { title: 'Recognition & Awarding Bodies', description: 'Understand how Pearson and ATHE underpin the qualification framework.', href: '/academics/recognition' },
        { title: 'Credit Transfer', description: 'See how credits map to advanced standing and what the receiving university decides.', href: '/academics/transfer' },
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

export default async function AcademicsPage() {
  const pageData = await fetchPublicJson('/pages/academics?public=1');
  return <CmsPageRenderer pageData={pageData} slug="academics" fallback={fallback} />;
}
