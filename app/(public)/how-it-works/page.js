import { ArrowRight, Info, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const HowItWorks = () => {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">The Model</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          A staged ladder of qualifications.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          How Cornerstone maps local qualifications to international credit entry matrices.
        </p>
      </section>
      <section className="container-prose max-w-3xl border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="font-display text-2xl text-primary">Staged Transfer Architecture</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Cornerstone pathway comprises two major phases:
        </p>
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
            <div>
              <h4 className="font-semibold text-sm">Phase 1: Regulated Credits in India</h4>
              <p className="text-xs text-muted-foreground mt-1">Study Pearson BTEC HND Level 4 & 5 or ATHE Level 4 & 5 modules over 16-24 months on campus in India.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
            <div>
              <h4 className="font-semibold text-sm">Phase 2: Transfer & Top-up Abroad</h4>
              <p className="text-xs text-muted-foreground mt-1">Transfer accumulated Ofqual credits to partner universities overseas. Complete the final top-up modules to graduate with the university's full degree.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowItWorks;