import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container-prose py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_3fr]">
          {/* Logo & Intro */}
          <div>
            <Link aria-label="Cornerstone — Home" href="/" className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background font-display text-xl font-semibold text-primary">
                C
              </span>
              <span className="font-display text-xl font-medium tracking-tight text-foreground">
                Cornerstone
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              India's specialist international pathway college. Begin a UK-recognised degree at home, transfer to a partner university abroad, graduate internationally.
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium transition-all hover:bg-primary-hover"
              >
                Book a Consultation
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Footer">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pathways</p>
              <ul className="space-y-2.5">
                <li><Link href="/pathways/school-leavers" className="text-sm text-foreground/80 transition-colors hover:text-primary">For School Leavers</Link></li>
                <li><Link href="/pathways/university-students" className="text-sm text-foreground/80 transition-colors hover:text-primary">For University Students</Link></li>
                <li><Link href="/pathways/graduates" className="text-sm text-foreground/80 transition-colors hover:text-primary">For Graduates</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-foreground/80 transition-colors hover:text-primary">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Universities</p>
              <ul className="space-y-2.5">
                <li><Link href="/universities" className="text-sm text-foreground/80 transition-colors hover:text-primary">University Explorer</Link></li>
                <li><Link href="/destinations" className="text-sm text-foreground/80 transition-colors hover:text-primary">Destinations</Link></li>
                <li><Link href="/success" className="text-sm text-foreground/80 transition-colors hover:text-primary">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Academics</p>
              <ul className="space-y-2.5">
                <li><Link href="/academics/recognition" className="text-sm text-foreground/80 transition-colors hover:text-primary">Recognition & Awarding Bodies</Link></li>
                <li><Link href="/academics/transfer" className="text-sm text-foreground/80 transition-colors hover:text-primary">Credit Transfer</Link></li>
                <li><Link href="/for-parents" className="text-sm text-foreground/80 transition-colors hover:text-primary">For Parents</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Admissions</p>
              <ul className="space-y-2.5">
                <li><Link href="/admissions" className="text-sm text-foreground/80 transition-colors hover:text-primary">Admissions Overview</Link></li>
                <li><Link href="/admissions/eligibility" className="text-sm text-foreground/80 transition-colors hover:text-primary">Eligibility Checker</Link></li>
                <li><Link href="/admissions/fees" className="text-sm text-foreground/80 transition-colors hover:text-primary">Fees & Cost Calculator</Link></li>
                <li><Link href="/contact" className="text-sm text-foreground/80 transition-colors hover:text-primary">Book a Consultation</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Awarding Bodies logos */}
        <div className="mt-14 border-t border-border pt-10">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">In partnership with recognised UK awarding organisations</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="inline-flex h-11 items-center rounded-md bg-white px-4 py-2 ring-1 ring-border/60">
              <span className="font-semibold text-lg text-[#003B46]">Pearso</span>
            </div>
            <div className="inline-flex h-11 items-center rounded-md bg-white px-4 py-2 ring-1 ring-border/60">
              <span className="font-semibold text-lg text-[#0F2A4A]">ATHE</span>
            </div>
          </div>
        </div>

        {/* Contact info and disclaimer */}
        <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cornerstone College</p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-foreground/80">
              International Campus<br />
              Bengaluru, India<br />
              <a href="mailto:hello@cornerstone.edu" className="hover:text-primary">hello@cornerstone.edu</a><br />
              <a href="tel:+910000000000" className="hover:text-primary">+91 98765 43210</a>
            </address>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recognition statement</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pathway qualifications referenced on this site are awarded by recognised UK awarding organisations. Progression to a partner university, credit transfer and advanced standing depend on academic performance and the receiving university's admission requirements. Indicative costs are clearly labelled estimates. Cornerstone is not a study-abroad consultancy or visa service.
            </p>
          </div>
        </div>

        {/* Footer legal */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 Cornerstone. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="#" className="hover:text-primary">Accessibility statement</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;