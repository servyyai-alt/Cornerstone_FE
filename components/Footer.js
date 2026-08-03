import Image from 'next/image';
import Link from 'next/link';

const normalizeLogoList = (logos = []) =>
  logos.filter((logo) => logo && logo.status === 'active' && logo.logoImage).slice(0, 6);

const Footer = ({ logos = [], siteSettings = {} }) => {
  const activeLogos = normalizeLogoList(logos);
  const siteName = siteSettings.siteName || 'Cornerstone';
  const siteDescription =
    siteSettings.siteDescription ||
    "India's specialist international pathway college. Begin a UK-recognised degree at home, transfer to a partner university abroad, graduate internationally.";
  const supportEmail = siteSettings.supportEmail || 'hello@cornerstone.edu';
  const supportPhone = siteSettings.supportPhone || '+91 98765 43210';
  const supportPhoneHref = `tel:${String(supportPhone).replace(/[\s()-]+/g, '')}`;
  const siteLogo = String(siteSettings.siteLogo || '').trim();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-prose py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Link aria-label={`${siteName} home`} href="/" className="flex items-center gap-2">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-10 max-w-[140px] object-contain" />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background font-display text-xl font-semibold text-primary"
                >
                  C
                </span>
              )}
              <span className="font-display text-xl font-medium tracking-tight text-foreground">
                {siteName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteDescription}
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-hover"
              >
                Book a Consultation
              </Link>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Footer">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pathways
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/pathways/school-leavers" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    For School Leavers
                  </Link>
                </li>
                <li>
                  <Link href="/pathways/university-students" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    For University Students
                  </Link>
                </li>
                <li>
                  <Link href="/pathways/graduates" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    For Graduates
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Universities
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/universities" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    University Explorer
                  </Link>
                </li>
                <li>
                  <Link href="/destinations" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link href="/success" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Academics
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/academics/recognition" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Recognition &amp; Awarding Bodies
                  </Link>
                </li>
                <li>
                  <Link href="/academics/transfer" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Credit Transfer
                  </Link>
                </li>
                <li>
                  <Link href="/for-parents" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    For Parents
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Admissions
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/admissions" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Admissions Overview
                  </Link>
                </li>
                <li>
                  <Link href="/admissions/eligibility" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Eligibility Checker
                  </Link>
                </li>
                <li>
                  <Link href="/admissions/fees" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Fees &amp; Cost Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Book a Consultation
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-14 border-t border-border pt-10">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            In partnership with recognised UK awarding organisations
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {activeLogos.length > 0 ? (
              activeLogos.map((logo) => {
                const logoNode = (
                  <span className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 py-2 ring-1 ring-border/60 transition-transform duration-200 hover:-translate-y-0.5">
                    <Image
                      src={logo.logoImage}
                      alt={logo.altText || logo.companyName || 'Awarding body logo'}
                      width={140}
                      height={44}
                      className="h-7 w-auto object-contain"
                      sizes="140px"
                    />
                  </span>
                );

                if (logo.websiteUrl) {
                  return (
                    <Link
                      key={logo._id || logo.logoImage}
                      href={logo.websiteUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={logo.companyName || 'Awarding body'}
                    >
                      {logoNode}
                    </Link>
                  );
                }

                return <div key={logo._id || logo.logoImage}>{logoNode}</div>;
              })
            ) : (
              <>
                <div className="inline-flex h-11 items-center rounded-md bg-white px-4 py-2 ring-1 ring-border/60">
                  <span className="text-lg font-semibold text-[#003B46]">Pearson</span>
                </div>
                <div className="inline-flex h-11 items-center rounded-md bg-white px-4 py-2 ring-1 ring-border/60">
                  <span className="text-lg font-semibold text-[#0F2A4A]">ATHE</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {siteName}
            </p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-foreground/80">
              International Campus
              <br />
              Bengaluru, India
              <br />
              <a href={`mailto:${supportEmail}`} className="hover:text-primary">
                {supportEmail}
              </a>
              <br />
              <a href={supportPhoneHref} className="hover:text-primary">
                {supportPhone}
              </a>
            </address>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recognition statement
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pathway qualifications referenced on this site are awarded by recognised UK awarding
              organisations. Progression to a partner university, credit transfer and advanced standing
              depend on academic performance and the receiving university&apos;s admission requirements.
              Indicative costs are clearly labelled estimates. Cornerstone is not a study-abroad
              consultancy or visa service.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>&copy; 2026 {siteName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/accessibility" className="hover:text-primary">
              Accessibility statement
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
