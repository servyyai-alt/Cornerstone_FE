"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../services/api';
import { ArrowRight, Check, BookOpen, Users, Award, Globe } from 'lucide-react';

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
      } catch (err) {
        console.error('Error fetching home content:', err);
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
  const getSection = (id) => sections.find(s => s.sectionId === id) || { title: '', subtitle: '', content: '', items: [] };

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
  const heroCtaSecondaryText = featuredBanner?.button2Text || 'For Parents';
  const heroCtaSecondaryUrl = featuredBanner?.button2Url || '/for-parents';
  const activeLogos = logos.filter((logo) => logo.status === 'active');

  const ladderSteps = [
    { title: 'UK Certificate', location: 'India', duration: '8–12 months', body: 'Begin your internationally recognised qualification at home. Adjust to a UK academic style without leaving India.', awarding: 'Pearson / ATHE' },
    { title: 'UK Diploma / Higher Diploma', location: 'India', duration: '8–12 months', body: 'Progress to year-2 equivalent content. Prepare for transfer options abroad.', awarding: 'Pearson / ATHE' },
    { title: "Transfer into Bachelor's", location: 'India → Abroad', duration: '1–2 years', body: 'Progress into Year 2 or 3 of a partner university degree overseas, once you meet requirements.', awarding: 'Partner Universities' },
    { title: 'Graduate from Partner', location: 'Abroad', duration: 'Degree award', body: 'Finish with a globally recognised degree and start of a global career.', awarding: 'University degree' },
    { title: "Master's Pathway", location: 'Abroad', duration: 'Optional post-grad', body: 'Dynamic options for postgraduate ladder qualifications.', awarding: 'Partner universities' }
  ];

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                {featuredBanner?.subtitle || hero.content || 'In partnership with recognised UK awarding organisations'}
              </p>
              <h1 className="font-['Fraunces'] text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                {featuredBanner?.title || hero.title || 'Your international university journey can begin today.'}
              </h1>
              <p className="mt-6 font-['Fraunces'] text-xl text-foreground/80 max-w-2xl">
                {featuredBanner?.description || hero.subtitle || 'Begin a UK-recognised degree pathway in India. Transfer to a partner university abroad. Graduate internationally.'}
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

              {/* Partner Logos */}
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
                  width={800}
                  height={600}
                  priority={Boolean(featuredBanner?.imagePriority)}
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
              {proposition.title || 'The smarter way to a global degree.'}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {(proposition.items && proposition.items.length > 0 ? proposition.items : [
              { title: 'Start at home', content: 'Begin on a UK-recognised qualification in India — lower risk, lower cost, recognised from year one.' },
              { title: 'Transfer abroad', content: 'Progress into Year 2 or 3 of a partner university degree overseas once you are ready.' },
              { title: 'Graduate internationally', content: 'Finish with a globally recognised degree — and start a global career.' }
            ]).map((item, idx) => (
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
              {honestLook.subtitle || 'Going straight overseas is harder than the brochure suggests.'}
            </h2>
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
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">{whyPathway.subtitle || 'Why pathway education'}</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">Two routes to the same degree. One is smarter.</h2>
            <p className="mt-4 text-muted-foreground">{whyPathway.content || 'A pathway lets you stage the journey — prove yourself on a UK-recognised qualification at home, then transfer abroad once you\'re ready.'}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Direct Route */}
            <div className="rounded-xl border border-border bg-surface p-6 hover:border-primary/30 transition-all duration-300">
              <h3 className="font-['Fraunces'] text-xl mb-4 text-muted-foreground border-b border-border pb-2">Direct route</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-6">Straight overseas at 18</p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Cost exposure</h4>
                  <p className="text-sm text-muted-foreground">Full overseas fees and living costs from year one.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Risk profile</h4>
                  <p className="text-sm text-muted-foreground">One large, irreversible commitment made before you've tested the fit.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Readiness</h4>
                  <p className="text-sm text-muted-foreground">A new country, system and independence — all at 18, all at once.</p>
                </div>
              </div>
            </div>

            {/* Pathway Route */}
            <div className="rounded-xl border border-primary/30 bg-primary-bg p-6 shadow-lg transition-all duration-300 hover:border-primary/50">
              <h3 className="font-['Fraunces'] text-xl mb-4 text-primary border-b border-primary/10 pb-2">Cornerstone pathway</h3>
              <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-6">Start in India, finish abroad</p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Cost exposure</h4>
                  <p className="text-sm text-muted-foreground">Begin in India at a fraction of the overseas cost; commit more only as you progress.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Risk profile</h4>
                  <p className="text-sm text-muted-foreground">A staged route — you prove the fit academically and personally before moving abroad.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Readiness</h4>
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
      <section className="border-b border-border py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">The global pathway</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">A staged ladder, built rung by rung.</h2>
            <p className="mt-3 text-muted-foreground">Each rung is an internationally recognised qualification. You move up when you're ready.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            {/* Step Selection List */}
            <div className="space-y-3">
              {ladderSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between ${activeStep === idx ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-surface text-foreground/80 hover:border-primary/30 hover:bg-surface-2'}`}
                >
                  <span className="text-sm font-semibold">0{idx + 1}. {step.title}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{step.location}</span>
                </button>
              ))}
            </div>

            {/* Step Detail Display */}
            <div className="rounded-xl border border-border bg-surface p-8 flex flex-col justify-between h-full min-h-[300px]">
              <div>
                <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
                  <div>
                    <h3 className="font-['Fraunces'] text-2xl text-primary">{ladderSteps[activeStep].title}</h3>
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
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Global Pathway Finder™</p>
          <h2 className="font-['Fraunces'] text-3xl sm:text-4xl mb-4 text-foreground">Five questions. One personalised international plan.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Tell us where you are and where you'd like to graduate. We'll map a staged route — qualifications, destinations, timeline and an honest cost range.
          </p>
          <div className="flex flex-col items-center justify-center gap-3">
            <Link
              href="/find-your-pathway"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold transition-all hover:bg-primary-hover hover:-translate-y-0.5"
            >
              Find Your Pathway
            </Link>
            <span className="text-xs text-muted-foreground">Takes ~2 minutes · No sign-up required</span>
          </div>
        </div>
      </section>

      {/* University Explorer */}
      <section className="border-b border-border py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">University explorer</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">See where your pathway can lead.</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">A small selection of our university partners have been filtered. To see the full explorer, fill in your preferences.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {universities.length > 0 ? universities.slice(0, 6).map((uni, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-['Fraunces'] text-lg text-foreground mb-1">{uni.name}</h3>
                    <p className="text-xs text-muted-foreground">{uni.city}, {uni.country}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">▸</span>
                    <span>Transfer Year: {uni.transferYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">▸</span>
                    <span>Awarding: {uni.awardingBody}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">▸</span>
                    <span>Pathway: {uni.pathway}</span>
                  </div>
                </div>
              </div>
            )) : (
              [
                { name: 'University of Birmingham', location: 'United Kingdom', pathway: 'UK Transfer', transferring: 'Year 2 or 3', awarding: 'Pearson' },
                { name: 'University of Technology Sydney', location: 'Australia', pathway: 'Australian Transfer', transferring: 'Year 2', awarding: 'ATHE' },
                { name: 'RMIT University', location: 'Australia', pathway: 'Australian Transfer', transferring: 'Year 2 or 3', awarding: 'ATHE' },
                { name: 'Birmingham City University', location: 'United Kingdom', pathway: 'UK Transfer', transferring: 'Year 2 or 3', awarding: 'Pearson' },
                { name: 'University of South Australia', location: 'Australia', pathway: 'Australian Transfer', transferring: 'Year 2', awarding: 'ATHE' },
                { name: 'University of Greenwich', location: 'United Kingdom', pathway: 'UK Transfer', transferring: 'Year 2 or 3', awarding: 'Pearson' }
              ].map((uni, idx) => (
                <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-['Fraunces'] text-lg text-foreground mb-1">{uni.name}</h3>
                      <p className="text-xs text-muted-foreground">{uni.location}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">▸</span>
                      <span>Transfer Year: {uni.transferring}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary">▸</span>
                      <span>Awarding: {uni.awarding}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary">▸</span>
                      <span>Pathway: {uni.pathway}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <Link href="/universities" className="text-primary text-sm font-medium hover:underline underline-offset-4">
              Explore all universities →
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Destinations</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">Where you graduate is where the doors open.</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 mb-6">
            {destinations.length > 0 ? destinations.slice(0, 6).map((dest, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <h3 className="font-['Fraunces'] text-lg text-foreground mb-2">{dest.name}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Living cost: <span className="text-foreground/90">{dest.livingCost}</span></p>
                  <p>Career visa: <span className="text-foreground/90">{dest.careerVisa}</span></p>
                </div>
              </div>
            )) : (
              [
                { name: 'United Kingdom', livingCost: '£9,000 – 12,000 / yr', careerVisa: 'Graduate Route — 2 years post-study work' },
                { name: 'Australia', livingCost: 'AU$18,000 – 24,000 / yr', careerVisa: 'Post-study work stream' },
                { name: 'Canada', livingCost: 'CA$12,000 – 18,000 / yr', careerVisa: 'PGWP — up to 3 years' },
                { name: 'Ireland', livingCost: '€10,000 – 14,000 / yr', careerVisa: 'Third Level Graduate Programme' },
                { name: 'New Zealand', livingCost: 'NZ$15,000 – 20,000 / yr', careerVisa: 'Post-study work visa' },
                { name: 'Germany', livingCost: '€8,000 – 12,000 / yr', careerVisa: '18-month residence permit' }
              ].map((dest, idx) => (
                <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                  <h3 className="font-['Fraunces'] text-lg text-foreground mb-2">{dest.name}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Living cost: <span className="text-foreground/90">{dest.livingCost}</span></p>
                    <p>Career visa: <span className="text-foreground/90">{dest.careerVisa}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">Cost range and indicative study hours</p>
        </div>
      </section>

      {/* Universities whereour students have progressed */}
      <section className="border-b border-border py-16 lg:py-20">
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
      </section>

      {/* Recognition & Awarding Details */}
      <section className="border-b border-border bg-surface/30 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">{recognition.subtitle || 'Recognition'}</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">{recognition.title || 'Awarded by recognised UK organisations.'}</h2>
            <p className="mt-4 text-sm text-muted-foreground">{recognition.content || 'Cornerstone pathway qualifications are awarded by established UK awarding organisations Pearson and ATHE.'}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {(recognition.items && recognition.items.length > 0 ? recognition.items : [
              { title: 'Pearson BTEC', content: "The UK's largest awarding organisation. Pearson BTEC and Higher National qualifications are recognised by universities and employers across more than 70 countries." },
              { title: 'ATHE', content: 'ATHE is a UK Ofqual-regulated awarding organisation, offering qualifications widely accepted for entry and progression into universities in the UK and overseas.' }
            ]).map((item, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex-1">
                  <h3 className="font-['Fraunces'] text-xl text-primary mb-3">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/academics/recognition" className="text-primary text-sm font-medium hover:underline underline-offset-4">
              How recognition works →
            </Link>
          </div>
        </div>
      </section>

      {/* Already at university? */}
      <section className="border-b border-border py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-bg border border-primary/30 rounded-2xl p-8 lg:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">For current university students</p>
              <h2 className="font-['Fraunces'] text-3xl sm:text-4xl mb-4 text-foreground">Already at university in India? You may be eligible for credit transfer.</h2>
              <p className="text-muted-foreground mb-8 text-sm">Modules and credits you've already earned can, in many cases, count towards a UK-recognised qualification — opening up advanced standing into partner universities abroad.</p>
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
          <div className="text-left mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">For parents</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">The questions a parent asks first.</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {[
              { icon: '🏆', title: 'Recognition', subtitle: 'Our qualifications are recognised by UK awarding organisations — Pearson and ATHE.' },
              { icon: '📋', title: 'Transfer outcomes', subtitle: 'Progression depends on academic performance and receiving university admission requirements.' },
              { icon: '💸', title: 'Financing options', subtitle: 'Flexible options to help manage the cost of study, including instalment plans.' }
            ].map((item, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="text-2xl mb-4">{item.icon}</div>
                <h3 className="font-['Fraunces'] text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>
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
      <section className="border-b border-border py-16 lg:py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Student success</p>
              <h2 className="font-['Fraunces'] text-3xl sm:text-4xl text-foreground">Individual journeys, not promises.</h2>
            </div>
            <Link href="/success" className="text-primary text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
              See more stories →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {successStories.length > 0 ? successStories.slice(0, 4).map((story, idx) => (
              <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
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
            )) : (
              [
                { initials: 'R.J.', startPoint: 'Chennai, India', pathway: 'Pearson BTEC HND — Year 2 transfer', destination: 'University of Greenwich, UK', outcome: 'Graduated with BSc (Hons) in Business Management.' },
                { initials: 'S.K.', startPoint: 'Hyderabad, India', pathway: 'ATHE Level 5 — Year 2 transfer', destination: 'RMIT University, Australia', outcome: 'Completed Bachelor of Business and now works at a Melbourne-based analytics firm.' },
                { initials: 'A.M.', startPoint: 'Mumbai, India', pathway: 'Pearson BTEC HND — Year 2 transfer', destination: 'Birmingham City University, UK', outcome: 'Now pursuing MSc in Finance at a Russell Group university.' },
                { initials: 'P.D.', startPoint: 'Kerala, India', pathway: 'ATHE Level 5 — Year 3 transfer', destination: 'University of South Australia', outcome: 'Graduated with BSc in IT and is now based in Adelaide with permanent residency.' }
              ].map((story, idx) => (
                <div key={idx} className="border border-border bg-surface rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
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
              ))
            )}
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
      
