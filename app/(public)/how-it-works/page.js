import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('how-it-works');

  return createPageMetadata({
    title: 'How It Works',
    description: 'Understand how the staged Cornerstone pathway maps local study to international credit.',
    path: '/how-it-works',
    keywords: ['how it works', 'pathway model', 'credit transfer'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">The Model</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        A staged ladder of qualifications.
      </h1>
      <p className="mt-4 text-muted-foreground text-lg">
        How Cornerstone maps local qualifications to international credit entry matrices.
      </p>
    </Container>
    <Container className="border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
      <h2 className="font-display text-2xl text-primary">Staged Transfer Architecture</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The Cornerstone pathway comprises two major phases:
      </p>
      <div className="space-y-4">
        <div className="flex gap-4">
          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
          <div>
            <h4 className="font-semibold text-sm">Phase 1: Regulated Credits in India</h4>
            <p className="text-xs text-muted-foreground mt-1">Study Pearson BTEC HND Level 4 &amp; 5 or ATHE Level 4 &amp; 5 modules over 16-24 months on campus in India.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
          <div>
            <h4 className="font-semibold text-sm">Phase 2: Transfer &amp; Top-up Abroad</h4>
            <p className="text-xs text-muted-foreground mt-1">Transfer accumulated Ofqual credits to partner universities overseas. Complete the final top-up modules to graduate with the university&apos;s full degree.</p>
          </div>
        </div>
      </div>
    </Container>
  </main>
);

export default function HowItWorksPage() {
  return <CmsPageRenderer slug="how-it-works" fallback={fallback} />;
}
