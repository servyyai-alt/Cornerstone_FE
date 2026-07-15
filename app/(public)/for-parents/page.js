"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../services/api';
import { ShieldCheck, CalendarRange, LineChart, Users } from 'lucide-react';

const ForParents = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/pages/for-parents');
        setPageData(res.data);
      } catch (err) {
        console.error('Error fetching parent center:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const sections = pageData?.sections || [];
  const getSection = (id) => sections.find(s => s.sectionId === id) || { title: '', subtitle: '', content: '', items: [] };

  const hero = getSection('hero');
  const quality = getSection('quality-recognition');
  const ladder = getSection('staged-ladder');
  const finance = getSection('financial-planning');

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Hero */}
      <section className="container-prose py-16 lg:py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
          Parent Decision Centre
        </p>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
          {hero.title || 'Parent Decision Centre'}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
          {hero.subtitle || 'No urgency. No hype. Straight answers about recognition, progression, safety, money and outcomes — so your family can choose with confidence.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-px"
          >
            Book a Consultation
          </Link>
          <Link
            href="/find-your-pathway"
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium transition-all hover:bg-surface-2"
          >
            Find Your Pathway
          </Link>
        </div>
      </section>

      {/* Quality and Recognition */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="container-prose">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Quality & Recognition</p>
            <h2 className="font-display text-3xl sm:text-4xl leading-tight mb-4">
              {quality.title || 'Awarded by UK organisations regulated by Ofqual.'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {quality.content || 'The Certificate and Diploma stages your child completes in India are awarded by Pearson and ATHE — UK awarding organisations regulated by Ofqual. These are recognised by partner universities in the UK, Australia, Canada and Ireland for credit-bearing entry.'}
            </p>
          </div>
        </div>
      </section>

      {/* Staged Ladder */}
      <section className="border-t border-border py-16">
        <div className="container-prose">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">University Progression</p>
            <h2 className="font-display text-3xl sm:text-4xl">{ladder.title || 'A staged ladder — honestly qualified.'}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(ladder.items && ladder.items.length > 0 ? ladder.items : [
              { title: 'Stage 1 · Cornerstone, India', subtitle: 'Certificate (Level 4)', content: 'Year-1 equivalent. Builds academic foundations at home.' },
              { title: 'Stage 2 · Cornerstone, India', subtitle: 'Diploma (Level 5)', content: 'Year-2 equivalent. Eligible for Year 2 or Year 3 overseas transfer.' },
              { title: 'Stage 3 · Partner university overseas', subtitle: 'Final Years', content: 'Full international student experience and degree.' },
              { title: 'Stage 4 · Same or new university overseas', subtitle: 'Graduate Pathways', content: 'Master\'s or PG progression options.' }
            ]).map((step, idx) => (
              <div key={idx} className="border border-border bg-surface p-6 rounded-xl relative shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.1)]">
                <span className="absolute top-4 right-4 text-3xl font-display text-primary/10">0{idx + 1}</span>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-3">{step.subtitle}</p>
                <p className="text-sm text-muted-foreground">{step.content}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-muted-foreground text-center">
            Each rung is a finish line. Onward progression is subject to academic performance and admission decisions by the awarding organisation and receiving university.
          </p>
        </div>
      </section>

      {/* Safety & Pastoral Support */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="container-prose grid gap-8 md:grid-cols-2 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Safety, Support & Maturity</p>
            <h2 className="font-display text-3xl sm:text-4xl">The staged model is the safety story.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Students begin on campus in India — with our academic, pastoral and parent support — before moving overseas at 19 or 20 with a degree-recognised qualification already in hand. That is the single biggest difference between us and direct overseas admission at 18.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Academic bridge at home</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Pre-departure briefing and orientation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Designated family advisor</span>
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-xl border border-border bg-surface flex items-center justify-center p-8 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]">
            <div>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="font-display text-xl mb-2">Wrap-around support</p>
              <p className="text-xs text-muted-foreground">From initial planning in India to graduation overseas, the family always has a named advisor to contact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Planning */}
      <section className="border-t border-border py-16">
        <div className="container-prose">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Financial Planning</p>
            <h2 className="font-display text-3xl sm:text-4xl mb-4">
              {finance.title || 'Roughly half the total outlay.'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {finance.content || 'Total cost typically lands between ₹46–72 lakh through the pathway, compared with ₹1.5–1.9 crore for full direct overseas degrees. Living costs depend on destination and city.'}
            </p>
            <div className="flex justify-center">
              <Link
                href="/admissions/fees"
                className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-primary-hover hover:-translate-y-px"
              >
                Open Cost Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForParents;