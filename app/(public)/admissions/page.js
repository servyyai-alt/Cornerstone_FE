import Link from 'next/link';
import { ArrowRight, MessageSquare, Award, ClipboardCheck, Wallet, DoorOpen } from 'lucide-react';

const Admissions = () => {
  const steps = [
    {
      title: '01. The Conversation',
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      desc: 'Speak to an advisor to discuss your goals, academic backgrounds, and target universities. We answer clearly, without urgency theatre.'
    },
    {
      title: '02. Eligibility Assessment',
      icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
      desc: 'Submit your grade sheets for a preliminary assessment. We\'ll map your qualifications against regulated awarding body credit criteria.'
    },
    {
      title: '03. Application Submission',
      icon: <Award className="h-6 w-6 text-primary" />,
      desc: 'Formal application to the pathway program in Bengaluru. Submit academic credentials, IDs, and language medium proofs.'
    },
    {
      title: '04. Offer & Financial Outline',
      icon: <Wallet className="h-6 w-6 text-primary" />,
      desc: 'Receive your enrollment offer letter alongside structured financial estimates, loan assistance guides, and stage fee splits.'
    },
    {
      title: '05. Campus Enrolment',
      icon: <DoorOpen className="h-6 w-6 text-primary" />,
      desc: 'Complete enrollment registration, collect academic materials, and join our induction program on campus in India.'
    }
  ];

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      {/* Header */}
      <section className="container-prose pt-16 pb-12 text-center max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Admissions Process</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
          A calm, structured pathway to study abroad.
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
          Cornerstone operates rolling intakes four times a year (January, April, July, October). Staged evaluation keeps progress low-risk.
        </p>
      </section>

      {/* Steps List */}
      <section className="container-prose max-w-3xl space-y-6">
        {steps.map((st, i) => (
          <div key={i} className="border border-border bg-surface p-6 rounded-xl flex gap-6 items-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.1)]">
            <span className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex-shrink-0">
              {st.icon}
            </span>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-foreground">{st.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{st.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Call to action */}
      <section className="container-prose mt-12 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/admissions/eligibility" 
            className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
          >
            Check My Eligibility <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium transition-all hover:bg-surface-2"
          >
            Book Consultation
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Admissions;