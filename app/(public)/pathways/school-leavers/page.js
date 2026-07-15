import Link from 'next/link';
import { ArrowRight, Info, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const SchoolLeavers = () => {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">School Leavers Pathway</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Begin an international degree at home.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Start your UK-regulated degree pathway in India, adjust to international academic criteria, then transfer to final years abroad.
        </p>
      </section>
      <section className="container-prose max-w-3xl border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="font-display text-2xl text-primary">Why Stage the Journey?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Leaving for study abroad at 18 is a massive transition. The Cornerstone pathway breaks this change into manageable stages. You complete the Certificate and Diploma stages (equivalent to Year 1 & 2 of a Bachelor's degree) locally, and then transfer to Year 3 of our partner universities in the UK, Australia, Canada, or Ireland.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 pt-4">
          <div className="border border-border bg-surface-2 p-5 rounded-lg">
            <h3 className="font-bold text-sm mb-1 text-foreground">Lower Cost</h3>
            <p className="text-xs text-muted-foreground mt-1">Begin at a fraction of the cost, saving up to ₹35-70 Lakhs on tuition and living fees.</p>
          </div>
          <div className="border border-border bg-surface-2 p-5 rounded-lg">
            <h3 className="font-bold text-sm mb-1 text-foreground">Maturity Bridge</h3>
            <p className="text-xs text-muted-foreground mt-1">Acclimate to overseas independent research writing and assignment style while staying with family.</p>
          </div>
        </div>
        <div className="pt-6 text-center border-t border-border">
          <Link href="/find-your-pathway" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            Find Your School Leaver Pathway <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SchoolLeavers;