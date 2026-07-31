import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('accessibility');

  return createPageMetadata({
    title: 'Accessibility Statement',
    description: 'Cornerstone accessibility notes, keyboard support, and guidance for assistive technology.',
    path: '/accessibility',
    keywords: ['accessibility statement', 'WCAG', 'assistive technology'],
    seoPage,
  });
}

export default function AccessibilityPage() {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Accessibility</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Accessibility Statement
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          We aim to make the site usable with keyboard navigation, screen readers, and high contrast
          settings.
        </p>
      </section>
      <section className="container-prose max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="font-display text-2xl text-primary">Current support</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The interface uses semantic landmarks, visible focus states, descriptive link text, and
            form labels. If you find an accessibility issue, contact us and we will help directly.
          </p>
        </div>
      </section>
    </main>
  );
}

