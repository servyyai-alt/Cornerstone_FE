import { ArrowRight, Info, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const Transfer = () => {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Credit Transfer</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          How Credit Transfer Works
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          What carries across, what doesn't, and who decides.
        </p>
      </section>
      <section className="container-prose max-w-3xl border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="font-display text-2xl text-primary">Progression Metrics</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When transferring credits:
        </p>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <div className="flex gap-2.5 items-start">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
            <p><span className="font-semibold text-foreground">120 RQF Credits:</span> Equivalent to Year 1 of a UK Bachelor's degree (Level 4).</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
            <p><span className="font-semibold text-foreground">240 RQF Credits:</span> Equivalent to Year 2 of a UK Bachelor's degree (Level 5 Diploma / HND).</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
            <p><span className="font-semibold text-foreground">Receiving Decision:</span> The final credit mapping and advanced standing decision rests solely with the admissions team of the receiving university.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Transfer;