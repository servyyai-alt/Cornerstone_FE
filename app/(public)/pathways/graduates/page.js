import Link from 'next/link';
import { ArrowRight, Info, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const Graduates = () => {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Postgraduate Pathway</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Staged Postgrad Pathways
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Progress from an Indian Bachelor's degree to an international Master's degree through regulated UK credit bridges.
        </p>
      </section>
      <section className="container-prose max-w-3xl border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="font-display text-2xl text-primary">Master's Pathway Options</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For students seeking post-grad options but wishing to reduce cost or meet advanced eligibility requirements, we offer pre-Master's credit frameworks (such as Level 7 Diplomas). These are accepted for advanced standing entry into top Master's programs overseas.
        </p>
        <div className="pt-6 text-center">
          <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            Inquire about graduate options <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Graduates;