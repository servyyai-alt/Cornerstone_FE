import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('about');

  return createPageMetadata({
    title: 'About Cornerstone',
    description: 'Learn about Cornerstone\'s mission to connect students with the right educational pathways and support.',
    path: '/about',
    keywords: ['about cornerstone', 'our mission', 'student success'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">About</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        About Cornerstone
      </h1>
      <p className="mt-4 text-muted-foreground text-lg">
        We help students navigate educational pathways from school-leaving to university graduation,
        providing personalised guidance and support.
      </p>
    </Container>
    <Container className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">Our mission</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Our mission is to ensure every student finds the right pathway to success, regardless of
          their starting point.
        </p>
      </div>
    </Container>
  </main>
);

export default function AboutPage() {
  return <CmsPageRenderer slug="about" fallback={fallback} />;
}
