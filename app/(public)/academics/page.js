import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
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

const academicCards = [
  {
    title: 'Recognition & Awarding Bodies',
    description: 'Understand how Pearson and ATHE underpin the qualification framework.',
    href: '/academics/recognition',
  },
  {
    title: 'Credit Transfer',
    description: 'See how credits map to advanced standing and what the receiving university decides.',
    href: '/academics/transfer',
  },
];

export default function AcademicsHubPage() {
  return (
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
        {academicCards.map((card) => (
          <article
            key={card.href}
            className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]"
          >
            <h2 className="font-display text-xl text-foreground">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
            <Link
              href={card.href}
              className="mt-5 inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Explore <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </article>
        ))}
      </Container>
    </main>
  );
}

