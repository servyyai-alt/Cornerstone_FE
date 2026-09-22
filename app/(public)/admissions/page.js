import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('admissions');

  return createPageMetadata({
    title: 'Admissions Process',
    description: 'See how the Cornerstone admissions journey works from consultation to enrolment.',
    path: '/admissions',
    keywords: ['admissions process', 'eligibility', 'enrolment'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Admissions Process</p>
      <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
        A calm, structured pathway to study abroad.
      </h1>
      <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
        Cornerstone operates rolling intakes four times a year (January, April, July, October). Staged evaluation keeps progress low-risk.
      </p>
    </Container>
    <Container className="space-y-6">
      {[
        { title: '01. The Conversation', desc: 'Speak to an advisor to discuss your goals, academic backgrounds, and target universities. We answer clearly, without urgency theatre.' },
        { title: '02. Eligibility Assessment', desc: 'Submit your grade sheets for a preliminary assessment. We\'ll map your qualifications against regulated awarding body credit criteria.' },
        { title: '03. Application Submission', desc: 'Formal application to the pathway program in Bengaluru. Submit academic credentials, IDs, and language medium proofs.' },
        { title: '04. Offer & Financial Outline', desc: 'Receive your enrollment offer letter alongside structured financial estimates, loan assistance guides, and stage fee splits.' },
        { title: '05. Campus Enrolment', desc: 'Complete enrollment registration, collect academic materials, and join our induction program on campus in India.' },
      ].map((st, i) => (
        <div key={i} className="border border-border bg-surface p-6 rounded-xl flex gap-6 items-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.1)]">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-foreground">{st.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{st.desc}</p>
          </div>
        </div>
      ))}
    </Container>
  </main>
);

import { fetchPublicJson } from '../../../lib/serverApi';

export default async function AdmissionsPage() {
  const pageData = await fetchPublicJson('/pages/admissions?public=1');
  return <CmsPageRenderer pageData={pageData} slug="admissions" fallback={fallback} />;
}
