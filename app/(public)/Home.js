"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import { ArrowRight, Sparkles, BookOpen, UserCheck, ShieldAlert } from 'lucide-react';

const Home = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await api.get('/pages/home');
        setPageData(res.data);
      } catch (err) {
        console.error('Error fetching home content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeContent();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Fallback data structure if API fails
  const sections = pageData?.sections || [];
  const getSection = (id) => sections.find(s => s.sectionId === id) || { title: '', subtitle: '', content: '', items: [] };

  const hero = getSection('hero');
  const proposition = getSection('proposition');
  const honestLook = getSection('honest-look');
  const whyPathway = getSection('why-pathway');
  const recognition = getSection('recognition');
  const rollingAdmissions = getSection('rolling-admissions');

  const ladderSteps = [
    { title: 'UK Certificate', location: 'India', duration: '8–12 months', body: 'Begin your internationally recognised qualification at home. Adjust to a UK academic style without leaving India.', awarding: 'Pearson / ATHE' },
    { title: 'UK Diploma / Higher Diploma', location: 'India', duration: '8–12 months', body: 'Progress to year-2 equivalent content. Prepare for transfer options abroad.', awarding: 'Pearson / ATHE' },
    { title: 'Transfer into Bachelor\'s', location: 'India → Abroad', duration: '1–2 years', body: 'Progress into Year 2 or 3 of a partner university degree overseas, once you meet requirements.', awarding: 'Partner Universities' },
    { title: 'Graduate from Partner', location: 'Abroad', duration: 'Degree award', body: 'Finish with a globally recognised degree and start of a global career.', awarding: 'University degree' },
    { title: 'Master\'s Pathway', location: 'Abroad', duration: 'Optional post-grad', body: 'Dynamic options for postgraduate ladder qualifications.', awarding: 'Partner universities' }
  ];

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Hero Section */}
      <section className="container-prose py-16 lg:py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
          {hero.content || 'In partnership with recognised UK awarding organisations'}
        </p>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl max-w-4xl mx-auto">
          {hero.title || 'Begin a UK-recognised degree pathway in India.'}
        </h1>
        <p className="mt-6 font-display text-2xl text-primary max-w-2xl mx-auto">
          {hero.subtitle || 'Transfer to a partner university abroad. Graduate internationally.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/find-your-pathway"
            className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-medium shadow-md transition-all hover:bg-primary-hover hover:-translate-y-px"
          >
            Find Your Pathway <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/for-parents"
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium transition-all hover:bg-surface-2"
          >
            For Parents
          </Link>
        </div>
      </section>

      {/* The Proposition */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="container-prose">
          <h2 className="text-center font-display text-3xl mb-12">
            {proposition.title || 'The proposition'}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {(proposition.items && proposition.items.length > 0 ? proposition.items : [
              { title: 'Start at home', content: 'Begin on a UK-recognised qualification in India — lower risk, lower cost, recognised from year one.' },
              { title: 'Transfer abroad', content: 'Progress into Year 2 or 3 of a partner university degree overseas once you are ready.' },
              { title: 'Graduate internationally', content: 'Finish with a globally recognised degree — and start a global career.' }
            ]).map((item, idx) => (
              <div key={idx} className="glass-card rounded-xl p-6 hover:shadow-[0_20px_40px_-12px_rgba(232,181,67,0.12)]">
                <h3 className="font-display text-xl mb-3 text-primary">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* An Honest Look */}
      <section className="border-t border-border py-16">
        <div className="container-prose">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">An honest look</p>
            <h2 className="font-display text-3xl sm:text-4xl leading-tight">
              {honestLook.subtitle || 'Studying abroad can be the right choice — but the direct route is rarely as straightforward as it looks.'}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {(honestLook.items && honestLook.items.length > 0 ? honestLook.items : [
              { title: 'The full cost, all at once', subtitle: '01', content: 'Three to four years entirely abroad means committing the entire fee, living and travel cost upfront — before knowing whether the fit is right.' },
              { title: 'One big leap, one big bet', subtitle: '02', content: 'Going straight overseas concentrates every decision into a single moment. There is little room to adjust without losing time or money.' },
              { title: 'Moving abroad alone at 18', subtitle: '03', content: 'A new country, a new academic system, and a new way of living far from family. For many capabilities, that transition is the hard part.' }
            ]).map((item, idx) => (
              <div key={idx} className="border border-border bg-surface/50 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.1)]">
                <div>
                  <span className="text-5xl font-display text-primary/20 block mb-4">{item.subtitle || `0${idx + 1}`}</span>
                  <h3 className="font-display text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pathway comparisons */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="container-prose">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">{whyPathway.subtitle || 'Why pathway education'}</p>
            <h2 className="font-display text-3xl sm:text-4xl">{whyPathway.title || 'Two routes to the same degree. One is smarter.'}</h2>
            <p className="mt-4 text-muted-foreground">{whyPathway.content || 'A pathway lets you stage the journey — prove yourself on a UK-recognised qualification at home, then transfer abroad once you\'re ready.'}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Direct Route */}
            <div className="rounded-xl border border-border p-6 bg-surface transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]">
              <h3 className="font-display text-xl mb-4 text-muted-foreground border-b border-border pb-2">Direct route</h3>
              <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-6">Straight overseas at 18</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm">Cost exposure</h4>
                  <p className="text-sm text-muted-foreground">Full overseas fees and living costs from year one.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Risk profile</h4>
                  <p className="text-sm text-muted-foreground">One large, irreversible commitment made before you've tested the fit.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Readiness</h4>
                  <p className="text-sm text-muted-foreground">A new country, system and independence — all at 18, all at once.</p>
                </div>
              </div>
            </div>

            {/* Pathway Route */}
            <div className="rounded-xl border border-primary/30 p-6 bg-primary/5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-[0_8px_28px_-8px_rgba(232,181,67,0.15)]">
              <h3 className="font-display text-xl mb-4 text-primary border-b border-primary/10 pb-2">Cornerstone pathway</h3>
              <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-6">Start in India, finish abroad</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-primary">Cost exposure</h4>
                  <p className="text-sm text-muted-foreground">Begin in India at a fraction of the overseas cost; commit more only as you progress.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-primary">Risk profile</h4>
                  <p className="text-sm text-muted-foreground">A staged route — you prove the fit academically and personally before moving abroad.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-primary">Readiness</h4>
                  <p className="text-sm text-muted-foreground">Settle into an internationally benchmarked academic style at home, then transfer with confidence.</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground text-center">
            Transfer and advanced entry depend on academic performance and receiving university admission requirements.
          </p>
        </div>
      </section>

      {/* The Global Pathway Steps widget */}
      <section className="border-t border-border py-16">
        <div className="container-prose">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">The global pathway</p>
            <h2 className="font-display text-3xl sm:text-4xl">A staged ladder, built rung by rung.</h2>
            <p className="mt-3 text-muted-foreground">Each rung is an internationally recognised qualification. You move up when you're ready.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_2.5fr]">
            {/* Step Selection List */}
            <div className="space-y-3">
              {ladderSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between ${activeStep === idx ? 'border-primary bg-primary/5 text-primary shadow-[0_4px_12px_-4px_rgba(232,181,67,0.15)]' : 'border-border bg-surface text-foreground/80 hover:bg-surface-2 hover:border-primary/30 hover:-translate-y-0.5'}`}
                >
                  <span className="text-sm font-semibold">0{idx + 1}. {step.title}</span>
                  <span className="text-xs text-muted-foreground">{step.location}</span>
                </button>
              ))}
            </div>

            {/* Step Detail Display */}
            <div className="rounded-xl border border-border bg-surface p-8 flex flex-col justify-between h-full min-h-[300px]">
              <div>
                <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
                  <div>
                    <h3 className="font-display text-2xl text-primary">{ladderSteps[activeStep].title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Location: {ladderSteps[activeStep].location}</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {ladderSteps[activeStep].duration}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  {ladderSteps[activeStep].body}
                </p>
              </div>
              <div className="border-t border-border pt-4 text-xs text-muted-foreground flex justify-between">
                <span>Awarded by: {ladderSteps[activeStep].awarding}</span>
                <span>Stage 0{activeStep + 1} of 05</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pathway Finder widget preview */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="container-prose text-center max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Global Pathway Finder™</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4">Five questions. One personalised international plan.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Tell us where you are and where you'd like to graduate. We'll map a staged route — qualifications, destinations, timeline and an honest cost range.
          </p>
          <div className="flex flex-col items-center justify-center gap-3">
            <Link
              href="/find-your-pathway"
              className="inline-flex items-center justify-center rounded-md bg-primary text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all hover:bg-primary-hover hover:-translate-y-px"
            >
              Find Your Pathway
            </Link>
            <span className="text-xs text-muted-foreground">Takes ~2 minutes · No sign-up required</span>
          </div>
        </div>
      </section>

      {/* Cost Calculator Section */}
      <section className="border-t border-border py-16">
        <div className="container-prose max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">What it costs</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4">The same degree, staged differently.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            The pathway lowers your exposure in the first two years — when the financial weight of going direct is heaviest. Compare savings and compute EMI plans.
          </p>
          <div className="flex flex-col items-center justify-center gap-3">
            <Link
              href="/admissions/fees"
              className="inline-flex items-center justify-center rounded-md bg-primary text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all hover:bg-primary-hover hover:-translate-y-px"
            >
              Open the Cost Calculator
            </Link>
            <span className="text-xs text-muted-foreground">Adjust subject, destination and lifestyle to see your own estimate.</span>
          </div>
        </div>
      </section>

      {/* Recognition & Awarding Details */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="container-prose">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">{recognition.subtitle || 'Recognition'}</p>
            <h2 className="font-display text-3xl sm:text-4xl">{recognition.title || 'Awarded by recognised UK organisations.'}</h2>
            <p className="mt-4 text-sm text-muted-foreground">{recognition.content || 'Cornerstone pathway qualifications are awarded by established UK awarding organisations Pearson and ATHE.'}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {(recognition.items && recognition.items.length > 0 ? recognition.items : [
              { title: 'Pearson BTEC', content: 'The UK\'s largest awarding organisation. Pearson BTEC and Higher National qualifications are recognised by universities and employers across more than 70 countries.' },
              { title: 'ATHE', content: 'ATHE is a UK Ofqual-regulated awarding organisation, offering qualifications widely accepted for entry and progression into universities in the UK and overseas.' }
            ]).map((item, idx) => (
              <div key={idx} className="glass-card rounded-xl p-6 bg-surface hover:shadow-[0_20px_40px_-12px_rgba(232,181,67,0.12)]">
                <h3 className="font-display text-xl text-primary mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions intakes */}
      <section className="border-t border-border py-16">
        <div className="container-prose text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">{rollingAdmissions.subtitle || 'Rolling admissions'}</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-12">{rollingAdmissions.title || 'Start your pathway at a time that suits you.'}</h2>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-4 max-w-4xl mx-auto">
            {(rollingAdmissions.items && rollingAdmissions.items.length > 0 ? rollingAdmissions.items : [
              { title: 'January', content: 'Spring intake' },
              { title: 'April', content: 'Mid-year intake' },
              { title: 'July', content: 'Main intake' },
              { title: 'October', content: 'Autumn intake' }
            ]).map((item, idx) => (
              <div key={idx} className="border border-border bg-surface p-6 rounded-lg text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_24px_-8px_rgba(232,181,67,0.12)]">
                <h3 className="text-lg font-bold text-primary">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-2">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;