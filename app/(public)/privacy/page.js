import { createPageMetadata, getSeoPageOverrides } from '../../../lib/seo';
import Container from '../../../components/ui/Container';

export async function generateMetadata() {
  const seoPage = await getSeoPageOverrides('privacy');

  return createPageMetadata({
    title: 'Privacy Policy',
    description: 'How Cornerstone collects, uses, stores, and protects personal information.',
    path: '/privacy',
    keywords: ['privacy policy', 'data protection', 'cookies', 'Cornerstone'],
    seoPage,
  });
}

const sections = [
  {
    title: '1. Information we collect',
    body:
      'We collect information you choose to share with us, such as your name, email address, phone number, educational background, preferred destination, and enquiry details. We may also collect technical information like browser type, pages visited, and device data to help the site work properly.',
  },
  {
    title: '2. How we use your information',
    body:
      'We use personal information to respond to enquiries, schedule consultations, support admissions and counselling services, manage the CMS and website, improve our pages, and meet operational or legal obligations.',
  },
  {
    title: '3. Sharing your information',
    body:
      'We only share information when it is needed to provide a service, comply with law, protect our rights, or work with trusted service providers who help us run the website, email services, analytics, or hosting infrastructure.',
  },
  {
    title: '4. Cookies and analytics',
    body:
      'We may use cookies and similar technologies to remember preferences, measure traffic, and understand how visitors use the website. Where required, we may also use consent tools or provide controls for non-essential cookies.',
  },
  {
    title: '5. Data retention and security',
    body:
      'We keep information only for as long as it is needed for the purpose it was collected, unless a longer retention period is required by law or business necessity. We use reasonable technical and organisational safeguards to protect data from unauthorised access, loss, misuse, or disclosure.',
  },
  {
    title: '6. Your choices',
    body:
      'You can ask us to update or correct your information, request access to your data, or ask us to stop using your details for direct communications where permitted. You can also contact us if you want to know more about how a form or page handles your data.',
  },
  {
    title: '7. Children and young learners',
    body:
      'Cornerstone is a higher education consultancy platform. Our services are intended for students, parents, and guardians. If a younger visitor shares information with us, we expect it to be under the guidance of a parent, guardian, or responsible adult.',
  },
  {
    title: '8. Changes to this policy',
    body:
      'We may update this privacy policy from time to time. The latest version on this page always applies, so we encourage you to review it periodically.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <Container className="pt-16 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Privacy Policy</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Cornerstone respects your privacy. This policy explains what we collect, why we collect it, and
          how we try to keep your information safe when you use the website or contact our team.
        </p>
      </Container>

      <Container className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="font-display text-2xl text-primary">Our privacy approach</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We follow a simple privacy principle: collect only what we need, use it for clear business
            purposes, share it only when necessary, and keep it protected with reasonable controls.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="font-display text-xl text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="font-display text-2xl text-primary">Contact and review</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            If you have a privacy question, want to exercise your choices, or believe something on the
            website is not handling data correctly, please contact Cornerstone through the contact page.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Last reviewed: August 2026
          </p>
        </div>
      </Container>
    </main>
  );
}
