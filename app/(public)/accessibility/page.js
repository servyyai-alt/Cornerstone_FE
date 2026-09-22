import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('accessibility');

  return createPageMetadata({
    title: 'Accessibility Statement',
    description: 'Cornerstone accessibility statement, support commitments, and feedback information.',
    path: '/accessibility',
    keywords: ['accessibility statement', 'WCAG', 'assistive technology', 'Cornerstone'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Accessibility</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        Accessibility Statement
      </h1>
      <p className="mt-4 text-muted-foreground text-lg">
        Cornerstone wants this website to be usable, understandable, and dependable for everyone. We
        follow accessibility good practice and we keep improving the site as content and features change.
      </p>
    </Container>
    <Container className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">What this page covers</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This statement explains how the Cornerstone website is designed to support accessibility,
          what standards and practices we aim to follow, and how you can contact us if you need help.
          It applies to the public website and enquiry journeys operated by Cornerstone.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: 'Our commitment', body: 'Cornerstone is committed to making our website and key enquiry journeys accessible to as many people as possible, including users who rely on keyboard navigation, screen readers, magnification, or high-contrast display settings.' },
          { title: 'What we aim to support', body: 'We aim to use clear page structure, descriptive headings, meaningful link text, visible focus states, readable color contrast, and form labels that make it easier to move through the site and submit enquiries.' },
          { title: 'Technical approach', body: 'The site is built with semantic HTML, ARIA where helpful, and responsive layouts. We test the public pages on current desktop and mobile browsers and we review the main journeys regularly as content changes.' },
          { title: 'Known limitations', body: 'Some third-party embeds, external documents, or partner-hosted resources may not always meet the same standard as the Cornerstone website. When this happens, we try to provide a suitable alternative or a contact route for assistance.' },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-xl text-foreground">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">How you can get help</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {[
            'If you need content in a different format, please contact us and we will try to help.',
            'If you spot an accessibility issue, tell us the page and the problem you experienced.',
            'If a form or page is not working well with assistive technology, we will review it and prioritise a fix.',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">Feedback and review</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          If you experience any barriers while using the site, please contact Cornerstone through the
          contact page and tell us which page or task you were trying to complete. We review feedback
          and use it to improve future updates.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Last reviewed: August 2026
        </p>
      </div>
    </Container>
  </main>
);

import { fetchPublicJson } from '../../../lib/serverApi';

export default async function AccessibilityPage() {
  const pageData = await fetchPublicJson('/pages/accessibility?public=1');
  return <CmsPageRenderer pageData={pageData} slug="accessibility" fallback={fallback} />;
}
