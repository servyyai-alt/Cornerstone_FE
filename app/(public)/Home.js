"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../services/api';
import { ArrowLeftRight, ArrowRight, Award, BadgeDollarSign, BookOpen, Check, Clock3, Globe, MapPin, Users } from 'lucide-react';

const normalizeHomepageData = (payload) => ({
  pageData: payload?.pageData || null,
  banners: Array.isArray(payload?.banners) ? payload.banners : [],
  logos: Array.isArray(payload?.logos) ? payload.logos : [],
  universities: Array.isArray(payload?.universities) ? payload.universities : [],
  destinations: Array.isArray(payload?.destinations) ? payload.destinations : [],
  successStories: Array.isArray(payload?.successStories) ? payload.successStories : [],
});

const Home = ({ initialData = null }) => {
  const homepageData = normalizeHomepageData(initialData);
  const [pageData, setPageData] = useState(homepageData.pageData);
  const [banners, setBanners] = useState(homepageData.banners);
  const [logos, setLogos] = useState(homepageData.logos);
  const [universities, setUniversities] = useState(homepageData.universities);
  const [destinations, setDestinations] = useState(homepageData.destinations);
  const [successStories, setSuccessStories] = useState(homepageData.successStories);
  const [loading, setLoading] = useState(!initialData);
  const [activeStep, setActiveStep] = useState(0);
  const [activeDestination, setActiveDestination] = useState(0);

  useEffect(() => {
    if (initialData) {
      setLoading(false);
      return;
    }

    const fetchHomeContent = async () => {
      try {
        const res = await api.get('/homepage?public=1');
        const normalized = normalizeHomepageData(res.data);

        setPageData(normalized.pageData);
        setBanners(normalized.banners);
        setLogos(normalized.logos);
        setUniversities(normalized.universities);
        setDestinations(normalized.destinations);
        setSuccessStories(normalized.successStories);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeContent();
  }, [initialData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e8b543] border-t-transparent"></div>
      </div>
    );
  }

  const sections = (pageData?.sections || []).filter((section) => section.isVisible !== false);
  const getSection = (id) =>
    sections.find((s) => s.sectionId === id) || { title: '', subtitle: '', description: '', content: '', items: [] };

  const hero = getSection('hero');
  const proposition = getSection('proposition');
  const honestLook = getSection('honest-look');
  const whyPathway = getSection('why-pathway');
  const recognition = getSection('recognition');
  const rollingAdmissions = getSection('rolling-admissions');

  const featuredBanner = banners[0] || null;
  const heroImage = featuredBanner?.desktopImage || featuredBanner?.tabletImage || featuredBanner?.mobileImage || '/assets/hero.png';
  const heroCtaPrimaryText = featuredBanner?.button1Text || 'Find Your Pathway';
  const heroCtaPrimaryUrl = featuredBanner?.button1Url || '/find-your-pathway';
  const heroCtaSecondaryText = featuredBanner?.button2Text || 'How It Works';
  const heroCtaSecondaryUrl = featuredBanner?.button2Url || '/how-it-works';
  const activeLogos = logos.filter((logo) => logo.status === 'active');
  const propositionItems =
    proposition.items && proposition.items.length > 0
      ? proposition.items
      : [
          {
            title: 'Start at home',
            content:
              'Begin on a UK-recognised qualification in India. Progress through recognised stages before transferring abroad.',
          },
          {
            title: 'Transfer abroad',
            content: 'Progress into Year 2 or 3 of a partner university degree overseas once you meet the requirements.',
          },
          {
            title: 'Graduate internationally',
            content: 'Complete your degree with a partner university qualification.',
          },
        ];
  const successStoryItems =
    successStories.length > 0
      ? successStories.slice(0, 4)
      : [
          {
            initials: 'R.J.',
            startPoint: 'Chennai, India',
            pathway: 'Pearson BTEC HND - Year 2 transfer',
            destination: 'University of Greenwich, UK',
            outcome: 'Graduated with BSc (Hons) in Business Management.',
          },
          {
            initials: 'S.K.',
            startPoint: 'Hyderabad, India',
            pathway: 'ATHE Level 5 - Year 2 transfer',
            destination: 'RMIT University, Australia',
            outcome: 'Completed Bachelor of Business and now works at a Melbourne-based analytics firm.',
          },
          {
            initials: 'A.M.',
            startPoint: 'Mumbai, India',
            pathway: 'Pearson BTEC HND - Year 2 transfer',
            destination: 'Birmingham City University, UK',
            outcome: 'Now pursuing MSc in Finance at a Russell Group university.',
          },
          {
            initials: 'P.D.',
            startPoint: 'Kerala, India',
            pathway: 'ATHE Level 5 - Year 3 transfer',
            destination: 'University of South Australia',
            outcome: 'Graduated with BSc in IT and is now based in Adelaide with permanent residency.',
          },
        ];

  const ladderSteps = [
    { title: 'UK Certificate', location: 'India', duration: '8–12 months', body: 'Begin your recognised qualification at home. Adjust to a UK academic style without leaving India.', awarding: 'Pearson / ATHE' },
    { title: 'UK Diploma / Higher Diploma', location: 'India', duration: '8–12 months', body: 'Progress to year-2 equivalent content. Prepare for transfer options abroad.', awarding: 'Pearson / ATHE' },
    { title: "Transfer into Bachelor's", location: 'India → Abroad', duration: '1–2 years', body: 'Progress into Year 2 or 3 of a partner university degree overseas, once you meet requirements.', awarding: 'Partner Universities' },
    { title: 'Graduate from Partner', location: 'Abroad', duration: 'Degree award', body: 'Complete your degree with a partner university qualification.', awarding: 'University degree' },
    { title: "Master's Pathway", location: 'Abroad', duration: 'Optional post-grad', body: 'Postgraduate ladder qualifications available.', awarding: 'Partner universities' }
  ];

  const whyPathwayDefaults = [
    {
      label: 'Cost exposure',
      direct: 'Full overseas fees and living costs from year one.',
      pathway: 'Begin in India at a fraction of the overseas cost; commit more only as you progress.',
    },
    {
      label: 'Risk profile',
      direct: "One large, irreversible commitment made before you've tested the fit.",
      pathway: 'A staged route - you prove the fit academically and personally before moving abroad.',
    },
    {
      label: 'Readiness',
      direct: 'A new country, system and independence - all at 18, all at once.',
      pathway: 'Settle into an internationally benchmarked academic style at home, then transfer with confidence.',
    },
  ];

  const whyPathwayRows = (whyPathway.items?.length > 0 ? whyPathway.items : whyPathwayDefaults).map((item, idx) => ({
    label: item.title || whyPathwayDefaults[idx]?.label || `Point ${idx + 1}`,
    direct: item.subtitle || item.description || item.content || whyPathwayDefaults[idx]?.direct || '',
    pathway: item.content || item.description || item.subtitle || whyPathwayDefaults[idx]?.pathway || '',
  }));

  const destinationMeta = {
    'United Kingdom': {
      code: 'GB',
      notes: 'Largest set of partner universities; strong business, computing, creative pathways.',
    },
    Australia: {
      code: 'AU',
      notes: 'Strong employability outcomes and a wide spread of transfer destinations.',
    },
    Canada: {
      code: 'CA',
      notes: 'Popular for structured pathways and clear post-study work options.',
    },
    Ireland: {
      code: 'IE',
      notes: 'Compact campuses, friendly cities and a strong graduate work environment.',
    },
    'New Zealand': {
      code: 'NZ',
      notes: 'Smaller cohorts, supportive campuses and a calm study experience.',
    },
    Germany: {
      code: 'DE',
      notes: 'Lower tuition options and increasing appeal for technology-led routes.',
    },
  };

  const destinationCards = (destinations.length > 0
    ? destinations.slice(0, 6)
    : [
        { name: 'United Kingdom', livingCost: 'GBP 12,000–18,000 / yr', careerVisa: 'Graduate Route — 2 years post-study work.', lifestyleNotes: destinationMeta['United Kingdom'].notes, details: '' },
        { name: 'Australia', livingCost: 'AUD 20,000–25,000 / yr', careerVisa: 'Temporary Graduate visa (Subclass 485) — 2+ years post-study work.', lifestyleNotes: destinationMeta.Australia.notes, details: '' },
        { name: 'Canada', livingCost: 'CAD 15,000–20,000 / yr', careerVisa: 'Post-Graduation Work Permit (PGWP) — up to 3 years.', lifestyleNotes: destinationMeta.Canada.notes, details: '' },
        { name: 'Ireland', livingCost: 'EUR 10,000–15,000 / yr', careerVisa: 'Third Level Graduate Scheme — 1 to 2 years post-study work.', lifestyleNotes: destinationMeta.Ireland.notes, details: '' },
        { name: 'New Zealand', livingCost: 'NZD 18,000–22,000 / yr', careerVisa: 'Post Study Work Visa — 1 to 3 years.', lifestyleNotes: destinationMeta['New Zealand'].notes, details: '' },
        { name: 'Germany', livingCost: 'EUR 11,000–12,000 / yr', careerVisa: '18-month job seeking visa post-graduation.', lifestyleNotes: destinationMeta.Germany.notes, details: '' },
      ]
  ).map((dest) => {
    const meta = destinationMeta[dest.name] || {};

    return {
      ...dest,
      code: meta.code || dest.code || dest.abbr || dest.countryCode || dest.name?.slice(0, 2).toUpperCase() || '—',
      livingCost: dest.livingCost || 'Contact us for current guidance',
      careerVisa: dest.careerVisa || dest.details || 'Visa and work options vary by destination.',
      lifestyleNotes: dest.lifestyleNotes || meta.notes || dest.details || '',
    };
  });

  const selectedDestination = destinationCards[activeDestination] || destinationCards[0] || null;
  const destinationPanel = selectedDestination || destinationCards[0];

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Hero Section */}
      <section className="border-b border-border" aria-labelledby="homepage-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                {featuredBanner?.subtitle || hero.content || 'In partnership with recognised UK awarding organisations'}
              </p>
              <h1 id="homepage-heading" className="font-['Fraunces'] text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                {featuredBanner?.title || hero.title || 'Begin your degree pathway in India. Complete it with a partner university qualification.'}
              </h1>
              <p className="mt-6 font-['Fraunces'] text-xl text-foreground/80 max-w-2xl">
                {featuredBanner?.description || hero.description || hero.subtitle || 'Begin a UK-recognised degree pathway in India. Transfer to a partner university abroad. Graduate internationally.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={heroCtaPrimaryUrl}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold transition-all hover:bg-primary-hover hover:-translate-y-0.5"
                >
                  {heroCtaPrimaryText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={heroCtaSecondaryUrl}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-surface-2"
                >
                  {heroCtaSecondaryText}
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  In partnership with recognised UK awarding organisations
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {activeLogos.length > 0 ? (
                    activeLogos.map((logo) => (
                      <div
                        key={logo._id}
                        className="flex h-12 w-28 items-center justify-center rounded bg-white px-3"
                      >
                        <Image
                          src={logo.logoImage}
                          alt={logo.altText || logo.companyName}
                          width={100}
                          height={40}
                          loading="lazy"
                          className="max-h-8 w-auto object-contain"
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex h-12 w-28 items-center justify-center rounded bg-white px-3">
                        <p className="text-sm font-bold text-gray-900">Pearson</p>
                      </div>
                      <div className="flex h-12 w-28 items-center justify-center rounded bg-white px-3">
                        <p className="text-sm font-bold text-gray-900">ATHE</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />
                <Image
                  src={heroImage}
                  alt={featuredBanner?.altText || 'Cornerstone hero banner'}
                  width={600}
                  height={600}
                  priority={Boolean(featuredBanner?.imagePriority)}
                  quality={90}
                  className="w-full h-[400px] sm:h-[500px] lg:h-[560px] object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Proposition */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">The Proposition</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">
              {proposition.title || 'A structured route to a partner university degree.'}
            </h2>
            {(proposition.description || proposition.content) && (
              <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
                {proposition.description || proposition.content}
              </p>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {propositionItems.map((item, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 hover:bg-surface-2 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {idx === 0 && <BookOpen className="h-5 w-5 text-primary" />}
                  {idx === 1 && <Globe className="h-5 w-5 text-primary" />}
                  {idx === 2 && <Award className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="font-['Fraunces'] text-xl mb-3 text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* An Honest Look */}
      <section className="border-b border-border py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">An honest look</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl leading-tight text-foreground">
              {honestLook.subtitle || 'Direct overseas study involves considerations worth understanding.'}
            </h2>
            {(honestLook.description || honestLook.content) && (
              <p className="mt-4 text-muted-foreground">
                {honestLook.description || honestLook.content}
              </p>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {(honestLook.items && honestLook.items.length > 0 ? honestLook.items : [
              { title: 'The full cost, all at once', subtitle: '01', content: 'Three to four years entirely abroad means committing the entire fee, living and travel cost upfront — before knowing whether the fit is right.' },
              { title: 'One big leap, one big bet', subtitle: '02', content: 'Going straight overseas concentrates every decision into a single moment. There is little room to adjust without losing time or money.' },
              { title: 'Moving abroad alone at 18', subtitle: '03', content: 'A new country, a new academic system, and a new way of living far from family. For many capabilities, that transition is the hard part.' }
            ]).map((item, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 hover:bg-surface-2 transition-all duration-300">
                <span className="text-5xl font-['Fraunces'] text-primary/20 block mb-4">{item.subtitle || `0${idx + 1}`}</span>
                <h3 className="font-['Fraunces'] text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Why Pathway comparisons */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              {whyPathway.subtitle || 'Why pathway education'}
            </p>
              <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">
              {whyPathway.title || 'Two routes to the same degree. One is staged.'}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {whyPathway.description || whyPathway.content || 'A pathway lets you stage the journey - prove yourself on a UK-recognised qualification at home, then transfer abroad once you are ready. Same destination; a calmer, more considered way to get there.'}
            </p>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-surface lg:block">
            <div className="grid grid-cols-3 bg-surface/80">
              <div className="border-b border-border px-6 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Consideration</p>
              </div>
              <div className="border-b border-border border-l border-border px-6 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Direct route</p>
                <p className="mt-2 font-['Fraunces'] text-lg text-foreground">Straight overseas at 18</p>
              </div>
              <div className="border-b border-border border-l border-border bg-primary/5 px-6 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Cornerstone pathway</p>
                <p className="mt-2 font-['Fraunces'] text-lg text-foreground">Start in India, finish abroad</p>
              </div>
            </div>

            {whyPathwayRows.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="grid grid-cols-3 border-t border-border">
                <div className="px-6 py-8 lg:py-10">
                  <h3 className="font-['Fraunces'] text-lg text-foreground">{item.label}</h3>
                </div>
                <div className="border-l border-border px-6 py-8 lg:py-10">
                  <div className="flex gap-3 text-muted-foreground">
                    <span className="mt-1">-</span>
                    <p className="max-w-md text-sm leading-7">{item.direct}</p>
                  </div>
                </div>
                <div className="border-l border-border bg-primary/5 px-6 py-8 lg:py-10">
                  <div className="flex gap-3 text-foreground">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <p className="max-w-md text-sm font-medium leading-7">{item.pathway}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:hidden">
            {whyPathwayRows.map((item, idx) => (
              <div key={`${item.label}-mobile-${idx}`} className="rounded-xl border border-border bg-surface p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{item.label}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Direct route</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.direct}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Cornerstone pathway</p>
                    <p className="mt-2 text-sm leading-7 text-foreground">{item.pathway}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-6 text-muted-foreground">
            Transfer and advanced entry depend on academic performance and receiving university admission requirements.
          </p>
        </div>
      </section>

            {/* The Global Pathway Steps widget */}
      <section className="border-b border-border bg-surface/40 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              The global pathway
            </p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">
              A staged ladder, built rung by rung.
            </h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              Each rung is an internationally recognised qualification in its own right. You move up when you're ready and only as far as you want to go.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {ladderSteps.map((step, idx) => {
              const isActive = activeStep === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-primary/50 bg-primary/10 shadow-sm'
                      : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {idx === 4 ? 'Optional' : `Stage ${idx + 1}`}
                    </p>
                    <span className="text-sm font-medium text-muted-foreground">0{idx + 1}</span>
                  </div>
                  <h3 className="mt-4 font-['Fraunces'] text-lg leading-[1.15] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">{step.location}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              <div className="border-b border-border px-6 py-8 lg:border-b-0 lg:border-r lg:border-border lg:px-8 lg:py-10">
                <div className="space-y-6">
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </p>
                    <p className="mt-2 text-lg font-medium text-foreground">{ladderSteps[activeStep].location}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                      <Clock3 className="h-3.5 w-3.5" />
                      Duration
                    </p>
                    <p className="mt-2 text-lg font-medium text-foreground">{ladderSteps[activeStep].duration}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                      <Award className="h-3.5 w-3.5" />
                      Awarded by
                    </p>
                    <p className="mt-2 text-base leading-7 text-foreground">{ladderSteps[activeStep].awarding}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-8 lg:px-10 lg:py-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                  {activeStep === 4 ? 'Optional' : `Stage 0${activeStep + 1}`}
                </p>
                <h3 className="font-['Fraunces'] text-2xl sm:text-3xl text-foreground">
                  {ladderSteps[activeStep].title}
                </h3>
                <p className="mt-4 max-w-3xl text-base sm:text-lg leading-8 text-muted-foreground">
                  {ladderSteps[activeStep].body}
                </p>
                <p className="mt-8 max-w-3xl text-sm leading-7 text-muted-foreground">
                  Progression between stages depends on academic performance and, where relevant, the receiving university's admission requirements.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            Tap a rung to see the detail
            <span className="text-lg leading-none">›</span>
          </p>
        </div>
      </section>

      {/* Pathway Finder widget preview */}
      <section className="border-b border-border bg-background py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[#0d315a] px-6 py-14 text-[#f4efe7] shadow-sm dark:bg-[#f4d68f] dark:text-[#1f2937] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-35 dark:opacity-25"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-2xl text-left">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary/70 text-[10px] leading-none">◌</span>
                  Global Pathway Finder
                </p>
                <h2 className="mt-8 max-w-xl font-['Fraunces'] text-4xl leading-[1.08] tracking-tight text-[#f4efe7] dark:text-[#1f2937] sm:text-5xl lg:text-6xl">
                  Five questions. One personalised international plan.
                </h2>
                <p className="mt-8 max-w-2xl text-lg leading-8 text-[#f0dfc6] dark:text-[#2d3b4f]">
                  Tell us where you are and where you'd like to graduate. We'll map a staged route - qualifications, destinations, timeline and an honest cost range.
                </p>
              </div>

              <div className="flex flex-col items-start justify-center gap-4 lg:items-end lg:text-right">
                <Link
                  href="/find-your-pathway"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ebb73f] px-8 py-4 text-base font-medium text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0c55a] hover:shadow-lg hover:shadow-black/10 dark:bg-[#ebb73f] dark:text-[#0f172a]"
                >
                  Find Your Pathway
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
                <span className="text-sm text-[#d3c0a8] dark:text-[#55667f]">
                  Takes ~2 minutes · No sign-up required
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Explorer */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">University explorer</p>
              <h2 className="font-['Fraunces'] text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-foreground">
                See where your pathway can lead.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                A small selection of universities our students have progressed to. Filter the full explorer by country, subject, transfer year and awarding organisation.
              </p>
            </div>

            <Link
              href="/universities"
              className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-surface-2 md:self-auto"
            >
              Explore all universities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(universities.length > 0
              ? universities.slice(0, 6)
              : [
                  { name: 'University of Greenwich', country: 'United Kingdom', subjects: ['Business & Management', 'Computing & Data'], pathway: 'BTEC HND', transferYear: 'Year 2 or 3', awardingBody: 'Pearson', indicativeCost: '₹48–62 lakh total' },
                  { name: 'Ulster University', country: 'United Kingdom', subjects: ['Business & Management', 'Health & Life Sciences', 'Creative & Media'], pathway: 'BTEC HND / ATHE Level 5', transferYear: 'Year 2 or 3', awardingBody: 'ATHE', indicativeCost: '₹46–60 lakh total' },
                  { name: 'Coventry University', country: 'United Kingdom', subjects: ['Engineering', 'Business & Management', 'Computing & Data'], pathway: 'BTEC HND', transferYear: 'Year 2 or 3', awardingBody: 'Pearson', indicativeCost: '₹50–64 lakh total' },
                  { name: 'Birmingham City University', country: 'United Kingdom', subjects: ['Creative & Media', 'Computing & Data', 'Architecture & Design'], pathway: 'BTEC HND', transferYear: 'Year 2 or 3', awardingBody: 'Pearson', indicativeCost: '₹48–60 lakh total' },
                  { name: 'Northumbria University', country: 'United Kingdom', subjects: ['Business & Management', 'Law & Social Sciences', 'Computing & Data'], pathway: 'ATHE Level 5', transferYear: 'Year 2 or 3', awardingBody: 'ATHE', indicativeCost: '₹49–63 lakh total' },
                  { name: 'RMIT University', country: 'Australia', subjects: ['Engineering', 'Computing & Data', 'Architecture & Design'], pathway: 'BTEC HND', transferYear: 'Year 2 or 3', awardingBody: 'Pearson', indicativeCost: '₹52–68 lakh total' },
                ]
            ).map((uni, idx) => {
              const country = uni.country || uni.location || 'United Kingdom';
              const subjects = Array.isArray(uni.subjects)
                ? uni.subjects
                : typeof uni.subjects === 'string' && uni.subjects.trim()
                  ? uni.subjects.split(',').map((subject) => subject.trim()).filter(Boolean)
                  : [];

              return (
                <article
                  key={uni._id || idx}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                    {country}
                  </p>

                  <h3 className="mt-3 font-['Fraunces'] text-2xl leading-[1.15] text-foreground">
                    {uni.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {subjects.length > 0 ? subjects.join(' · ') : 'Business & Management · Computing & Data'}
                  </p>

                  {uni.description && (
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{uni.description}</p>
                  )}

                  <div className="mt-6 border-t border-border pt-5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pathway</span>
                      <span className="text-right font-medium text-foreground">{uni.pathway || 'BTEC HND'}</span>

                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Transfer</span>
                      <span className="text-right font-medium text-foreground">{uni.transferYear || uni.transferring || 'Year 2 or 3'}</span>

                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Awarded by</span>
                      <span className="text-right font-medium text-foreground">{uni.awardingBody || uni.awarding || 'Pearson'}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-foreground">{uni.indicativeCost || 'Indicative ₹48–62 lakh total'}</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">Estimate - assumptions on the cost page.</p>
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </section>

      {/* Destinations */}
      <section className="border-b border-[#ece7df] bg-white py-16 text-[#141414] lg:py-20 dark:border-[#1f2937] dark:bg-[#0f1722] dark:text-[#f4efe7]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-[0.15rem] bg-[#f0d28b]/55 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#a97f1d] dark:bg-[#e0b23f]/15 dark:text-[#e0b23f]">
              Destinations
            </span>

            <h2 className="mt-5 max-w-3xl font-['Fraunces'] text-3xl leading-[1.08] tracking-tight text-[#141414] sm:text-4xl lg:text-5xl dark:text-[#f4efe7]">
              Where you graduate is where the doors open.
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-7 text-[#697786] sm:text-lg sm:leading-8 dark:text-[#ccbca4]">
              Pathways lead to partner universities across the UK and beyond.
              Choose a destination to see indicative cost-of-living, lifestyle
              and post-study work context.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {destinationCards.map((dest, idx) => {
              const active = activeDestination === idx;

              return (
                <button
                  key={dest._id || idx}
                  type="button"
                  onClick={() => setActiveDestination(idx)}
                  className={`flex min-h-[82px] items-center gap-4 rounded-2xl border px-6 py-5 text-left transition-all duration-300 ${
                    active
                      ? 'border-[#e0b23f] bg-[#fffaf0] shadow-[0_0_0_1px_rgba(224,178,63,0.10)] dark:bg-[#151d29]'
                      : 'border-[#ece7df] bg-[#faf7f2] hover:border-[#e0b23f]/70 hover:bg-[#fffdf9] dark:border-[#2a3440] dark:bg-[#111824] dark:hover:bg-[#151d29]'
                  }`}
                >
                  <span
                    className={`text-lg font-semibold tracking-[0.14em] sm:text-xl ${
                      active ? 'text-[#8a6414] dark:text-[#f7e6b0]' : 'text-[#141414] dark:text-[#f4efe7]'
                    }`}
                  >
                    {dest.code}
                  </span>

                  <span className="font-['Fraunces'] text-base leading-tight text-[#141414] sm:text-lg dark:text-[#f4efe7]">
                    {dest.name}
                  </span>
                </button>
              );
            })}
          </div>

          {destinationPanel && (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-[#ece7df] bg-[#fbf8f2] dark:border-[#2a3440] dark:bg-[#0f1620]">
              <div className="grid gap-px bg-[#e7dfd0] lg:grid-cols-3 dark:bg-[#24303d]">
                <div className="bg-[#fbf8f2] px-7 py-8 sm:px-10 sm:py-10 dark:bg-[#0f1620]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a96a3] dark:text-[#b9aa91]">
                    Living cost
                  </p>
                  <p className="mt-3 text-xl font-medium text-[#141414] sm:text-2xl dark:text-[#f4efe7]">
                    {destinationPanel.livingCost}
                  </p>
                </div>

                <div className="bg-[#fbf8f2] px-7 py-8 sm:px-10 sm:py-10 dark:bg-[#0f1620]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a96a3] dark:text-[#b9aa91]">
                    Career & visa
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#141414] sm:text-lg sm:leading-8 dark:text-[#f4efe7]">
                    {destinationPanel.careerVisa}
                  </p>
                </div>

                <div className="bg-[#fbf8f2] px-7 py-8 sm:px-10 sm:py-10 dark:bg-[#0f1620]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a96a3] dark:text-[#b9aa91]">
                    Lifestyle notes
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#141414] sm:text-lg sm:leading-8 dark:text-[#f4efe7]">
                    {destinationPanel.lifestyleNotes}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#ece7df] px-7 py-5 sm:px-10 dark:border-[#2a3440]">
                <p className="text-sm leading-7 text-[#7b8794] dark:text-[#ccbca4]">
                  Figures are indicative and depend on city, lifestyle and
                  exchange rate. Visa and post-study work rights are set by
                  destination governments and change over time.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Universities whereour students have progressed */}
      {/* <section className="border-b border-border py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Universities our students have progressed to</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">Where our students have progressed.</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {universities.length > 0 ? universities.slice(0, 6).map((uni, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <h3 className="font-['Fraunces'] text-lg text-foreground mb-1">{uni.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{uni.country}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {uni.subjects.map((subj, i) => (
                    <span key={i} className="text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">{subj}</span>
                  ))}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Transfer: <span className="text-foreground/90">{uni.transferYear}</span></p>
                  <p>Awarding: <span className="text-foreground/90">{uni.awardingBody}</span></p>
                </div>
                <Link href={`/universities#${uni.name.toLowerCase().replace(/\s+/g, '-')}`} className="inline-block mt-4 text-primary text-xs font-medium hover:underline underline-offset-4">
                  See pathways into {uni.name.split(' ')[0]} →
                </Link>
              </div>
            )) : (
              [
                { name: 'University of Greenwich', country: 'United Kingdom', subjects: ['Finance', 'Business & Management', 'Marketing'], transferYear: 'Year 2 or 3', awardingBody: 'Pearson BTEC HND' },
                { name: 'Birmingham City University', country: 'United Kingdom', subjects: ['Construction', 'Business & Management', 'Law & Social Sciences'], transferYear: 'Year 2 or 3', awardingBody: 'Pearson BTEC HND' },
                { name: 'RMIT University', country: 'Australia', subjects: ['Engineering', 'Business', 'Design'], transferYear: 'Year 2', awardingBody: 'ATHE Level 5' },
                { name: 'University of Technology Sydney', country: 'Australia', subjects: ['Engineering', 'Information Technology', 'Business'], transferYear: 'Year 2', awardingBody: 'ATHE Level 5' },
                { name: 'University of South Australia', country: 'Australia', subjects: ['Business', 'IT', 'Health'], transferYear: 'Year 2', awardingBody: 'ATHE Level 5' },
                { name: 'University of Wolverhampton', country: 'United Kingdom', subjects: ['Business', 'Computing', 'Law'], transferYear: 'Year 2 or 3', awardingBody: 'Pearson BTEC HND' }
              ].map((uni, idx) => (
                <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                  <h3 className="font-['Fraunces'] text-lg text-foreground mb-1">{uni.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{uni.country}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {uni.subjects.map((subj, i) => (
                      <span key={i} className="text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">{subj}</span>
                    ))}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Transfer: <span className="text-foreground/90">{uni.transferYear}</span></p>
                    <p>Awarding: <span className="text-foreground/90">{uni.awardingBody}</span></p>
                  </div>
                  <Link href={`/universities#${uni.name.toLowerCase().replace(/\s+/g, '-')}`} className="inline-block mt-4 text-primary text-xs font-medium hover:underline underline-offset-4">
                    See pathways into {uni.name.split(' ')[0]} →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section> */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Header */}
    <div className="max-w-3xl mb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
        PROGRESSION PARTNERS
      </p>

      <h2 className="font-['Fraunces'] text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-foreground">
        Universities our students have progressed to.
      </h2>

      <p className="mt-4 text-muted-foreground">
        These institutions have accepted Cornerstone students into advanced
        standing on a case-by-case basis. Final transfer decisions rest with
        the receiving university.
      </p>
    </div>

    {/* University Name Grid */}

    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm mb-16">

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

        {[
          "Greenwich",
          "Ulster",
          "RMIT",
          "UTS",
          "Coventry",
          "Birmingham City",
          "Northumbria",
          "Hertfordshire",
          "Plymouth",
          "Roehampton",
          "South Wales",
          "Sunderland",
        ].map((name, index) => (
          <div
            key={index}
            className="border-r border-b border-border last:border-r-0 h-24 lg:h-28 flex items-center justify-center text-center px-4"
          >
            <span className="font-['Fraunces'] text-xl font-normal text-foreground">
              {name}
            </span>
          </div>
        ))}

      </div>

    </div>

    

    <div className="grid lg:grid-cols-3 gap-6 md:gap-8">

      {(universities.length > 0
        ? universities.slice(0, 3)
        : [
            {
              name: "Ulster University",
              country: "United Kingdom",
              description:
                "A long-standing UK research university with strong business, design and computing schools — a frequent transfer destination for our diploma graduates."
            },
            {
              name: "RMIT University",
              country: "Australia",
              description:
                "Global top-15 in art & design; strong engineering and technology faculties in Melbourne, with established advanced-standing routes."
            },
            {
              name: "University of Technology Sydney",
              country: "Australia",
              description:
                "One of Australia's youngest top-tier universities, recognised for industry-linked teaching across design, IT and business."
            }
          ]
      ).map((uni, index) => (

        <div
          key={index}
          className="rounded-2xl border border-border bg-surface p-6 lg:p-8 shadow-sm hover:-translate-y-1 hover:border-primary/40 hover:shadow-md transition-all duration-300"
        >

          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            {uni.country}
          </p>

          <h3 className="font-['Fraunces'] text-2xl text-foreground mb-4">
            {uni.name}
          </h3>

          <p className="text-sm leading-7 text-muted-foreground mb-6">
            {uni.description || 'A partner university that has welcomed Cornerstone students into advanced standing on a case-by-case basis.'}
          </p>

          <Link
            href={`/universities#${uni.name
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            See pathways into {uni.name.split(" ")[0]}
            <span>↗</span>
          </Link>

        </div>

      ))}

    </div>

  </div>
</section>

      {/* Recognition & Awarding Details */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">{recognition.subtitle || 'Recognition'}</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-foreground">{recognition.title || 'Awarded by recognised UK organisations.'}</h2>
            <p className="mt-4 text-muted-foreground">{recognition.description || recognition.content || 'Cornerstone pathway qualifications are awarded by established UK awarding organisations Pearson and ATHE.'}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {(recognition.items && recognition.items.length > 0 ? recognition.items : [
              { title: 'Pearson BTEC', content: "The UK's largest awarding organisation. Pearson BTEC and Higher National qualifications are recognised by universities and employers across more than 70 countries." },
              { title: 'ATHE', content: 'ATHE is a UK Ofqual-regulated awarding organisation, offering qualifications widely accepted for entry and progression into universities in the UK and overseas.' }
            ]).map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-surface p-6 lg:p-8 shadow-sm hover:-translate-y-1 hover:border-primary/40 hover:shadow-md transition-all duration-300">
                <h3 className="font-['Fraunces'] text-2xl text-primary mb-4">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/academics/recognition" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors">
              How recognition works
              <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Already at university? */}
      <section className="border-b border-border py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-bg border border-primary/30 rounded-2xl p-8 lg:p-12">
            <div className="max-w-2xl lg:max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">For current university students</p>
              <h2 className="font-['Fraunces'] text-3xl sm:text-4xl lg:text-5xl leading-[1.08] mb-4 text-foreground">Already at university in India? You may be eligible for credit transfer.</h2>
              <p className="text-muted-foreground mb-8 text-sm leading-7">Modules and credits you've already earned can, in many cases, count towards a UK-recognised qualification — opening up advanced standing into partner universities abroad.</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/admissions/eligibility"
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold transition-all hover:bg-primary-hover hover:-translate-y-0.5"
                >
                  Check your eligibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Parents */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">For parents</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-foreground">The questions a parent asks first.</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 mb-12">
            {[
              { icon: Award, title: 'Recognition', subtitle: 'Our qualifications are recognised by UK awarding organisations — Pearson and ATHE.' },
              { icon: ArrowLeftRight, title: 'Transfer outcomes', subtitle: 'Progression depends on academic performance and receiving university admission requirements.' },
              { icon: BadgeDollarSign, title: 'Financing options', subtitle: 'Flexible options to help manage the cost of study, including instalment plans.' }
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-surface p-6 lg:p-8 shadow-sm hover:-translate-y-1 hover:border-primary/40 hover:shadow-md transition-all duration-300">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-['Fraunces'] text-xl mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/find-your-pathway"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold transition-all hover:bg-primary-hover hover:-translate-y-0.5"
            >
              Find Your Pathway
            </Link>
            <Link
              href="/for-parents"
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-surface-2"
            >
              Visit the Parent Decision Centre
            </Link>
          </div>
        </div>
      </section>

      {/* Student Success */}
      <section className="border-b border-border bg-background py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Student outcomes</p>
              <h2 className="font-['Fraunces'] text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-foreground">Documented student journeys.</h2>
            </div>
            <Link href="/success" className="text-primary text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
              See more stories →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {successStoryItems.map((story, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-surface p-6 lg:p-8 shadow-sm hover:-translate-y-1 hover:border-primary/40 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">{story.initials}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Fraunces'] text-lg text-foreground mb-1">{story.startPoint}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{story.pathway} · {story.destination}</p>
                    <p className="text-sm text-muted-foreground">{story.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link href="/success" className="text-primary text-sm font-medium hover:underline underline-offset-4">
              See more stories →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
      
