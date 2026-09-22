import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import CmsPageRenderer from '../../../components/CmsPageRenderer';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('terms');

  return createPageMetadata({
    title: 'Terms & Conditions',
    description: 'Terms governing use of the Cornerstone website and services.',
    path: '/terms',
    keywords: ['terms and conditions', 'website terms', 'service terms', 'Cornerstone'],
    seoPage,
  });
}

const fallback = (
  <main className="flex-1 bg-background text-foreground pb-24">
    <Container className="pt-16 pb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Terms &amp; Conditions</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
        Terms &amp; Conditions
      </h1>
      <p className="mt-4 text-muted-foreground text-lg">
        These terms explain how the Cornerstone website and related enquiry services should be used.
        They are written for clarity and general understanding, not as a substitute for tailored legal advice.
      </p>
    </Container>
    <Container className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">Key points</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Cornerstone exists to help students and families understand higher education pathways,
          admissions routes, and destination options. Any official decision always depends on the relevant
          academic, financial, and partner-institution review process.
        </p>
      </div>
      <div className="space-y-4">
        {[
          { title: '1. About Cornerstone', body: 'Cornerstone is a higher education consultancy platform that provides information about pathway study options, university progression, admissions support, and related enquiry services.' },
          { title: '2. Use of the website', body: 'You may use this website for personal, non-commercial browsing and to submit legitimate enquiries. You agree not to misuse the site, attempt to disrupt it, or use it in a way that could damage Cornerstone, our users, or our systems.' },
          { title: '3. Information on the site', body: 'The content on this website is provided for general information only. Course pathways, transfer options, fees, entry requirements, and destination outcomes can change and are always subject to review by Cornerstone, partner institutions, and awarding bodies.' },
          { title: '4. Enquiries and applications', body: 'When you submit a form, you confirm that the information you provide is accurate and up to date. We may contact you using the details you share so we can respond to your enquiry or continue the admissions process.' },
          { title: '5. Fees, offers, and outcomes', body: 'Any fee estimate, progression note, or destination example on the website is indicative only. Final offers, credit decisions, scholarship decisions, and transfer outcomes are made according to the relevant partner institution and academic requirements.' },
          { title: '6. Intellectual property', body: 'Unless otherwise stated, the website design, copy, graphics, logos, and other materials belong to Cornerstone or our licensors. You may not copy, republish, or redistribute our content without permission, except where allowed by law.' },
          { title: '7. Third-party links and services', body: 'The website may link to third-party sites, application forms, maps, or embedded services. Cornerstone does not control those external services and is not responsible for their availability, content, or privacy practices.' },
          { title: '8. Limitation of liability', body: 'To the fullest extent permitted by law, Cornerstone is not liable for losses arising from reliance on website content, interrupted access, third-party services, or decisions made by external institutions or authorities.' },
          { title: '9. Changes to these terms', body: 'We may update these terms from time to time to reflect changes in our services, operations, or legal requirements. Continued use of the site after changes are published means you accept the updated terms.' },
          { title: '10. Contact', body: 'If you have a question about these terms or need clarification about a service, please contact Cornerstone through the website contact page and our team will respond as soon as practical.' },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-xl text-foreground">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="font-display text-2xl text-primary">Company norm</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          At Cornerstone, we aim to be transparent, respectful, and accurate in the way we describe our
          services. If a page conflicts with an official partner document, the official partner document
          takes priority.
        </p>
      </div>
    </Container>
  </main>
);

import { fetchPublicJson } from '../../../lib/serverApi';

export default async function TermsPage() {
  const pageData = await fetchPublicJson('/pages/terms?public=1');
  return <CmsPageRenderer pageData={pageData} slug="terms" fallback={fallback} />;
}
