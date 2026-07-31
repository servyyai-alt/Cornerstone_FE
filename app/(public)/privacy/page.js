import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('privacy');

  return createPageMetadata({
    title: 'Privacy Policy',
    description: 'How Cornerstone collects, uses, and protects personal information.',
    path: '/privacy',
    keywords: ['privacy policy', 'data protection', 'cookies'],
    seoPage,
  });
}

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Privacy Policy</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          This page describes the data we collect, how we use it, and the choices you can make.
        </p>
      </section>
      <section className="container-prose max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="font-display text-2xl text-primary">Overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Cornerstone only uses personal information to respond to enquiries, manage applications,
            and operate the website and CMS. Contact forms are stored securely and accessed by
            authorised staff only.
          </p>
        </div>
      </section>
    </main>
  );
}

