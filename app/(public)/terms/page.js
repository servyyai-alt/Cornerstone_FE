import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('terms');

  return createPageMetadata({
    title: 'Terms & Conditions',
    description: 'The terms that govern use of the Cornerstone website and services.',
    path: '/terms',
    keywords: ['terms and conditions', 'website terms', 'service terms'],
    seoPage,
  });
}

export default function TermsPage() {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Terms & Conditions</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          These terms explain how the site should be used and what you can expect from Cornerstone.
        </p>
      </section>
      <section className="container-prose max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="font-display text-2xl text-primary">Use of the site</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Content is provided for general information only. Admissions decisions, progression, and
            transfer outcomes always depend on formal academic review and partner institution rules.
          </p>
        </div>
      </section>
    </main>
  );
}

