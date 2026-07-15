import Link from 'next/link';
import { ArrowRight, Info, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const UniversityStudents = () => {
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">University Students Transfer</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
          Already at university in India?
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Modules and credits you've already earned can count towards a UK-recognised pathway — saving time and money.
        </p>
      </section>
      <section className="container-prose max-w-3xl border border-border bg-surface p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="font-display text-2xl text-primary">Credit Transfer & Bridging Options</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If you feel you've made a misstep in your current college or want to switch to an international degree without restarting from scratch, credit mapping can evaluate your previous semesters. Subject to formal transcript evaluation, we mapping your credits directly onto the UK BTEC HND frameworks.
        </p>
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground flex gap-2.5 transition-all duration-200 hover:border-primary/30 hover:bg-primary/8">
          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p>
            Formal evaluations require official transcripts showing course syllabi, semester credits, and marks sheet.
          </p>
        </div>
        <div className="pt-6 text-center">
          <Link href="/admissions/eligibility" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            Check credit transfer eligibility <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default UniversityStudents;