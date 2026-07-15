import { ArrowRight, Info, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const Recognition = () => {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Recognition</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Regulated by Ofqual, Recognized Globally.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Academic credibility is defined by regulated qualifications, not flashy marketing.
        </p>
      </section>
      <section className="container-prose max-w-3xl border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="font-display text-2xl text-primary">Regulated Awarding Bodies</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The UK system places qualifications on the Regulated Qualifications Framework (RQF). Our courses are awarded by Pearson BTEC and ATHE, which are audited and regulated directly by Ofqual (The Office of Qualifications and Examinations Regulation in England). Because these qualifications sit on the official UK framework, universities overseas recognize their credit equivalency when offering advanced entry.
        </p>
        <div className="p-4 bg-surface-2 rounded-lg border border-border flex gap-3 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
          <p>
            Ofqual regulation ensures that assessments are standardized, secure, and globally benchmarked.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Recognition;