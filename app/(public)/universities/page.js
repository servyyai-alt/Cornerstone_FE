"use client";

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Search, SlidersHorizontal, BookOpen, GraduationCap, X } from 'lucide-react';

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [subject, setSubject] = useState('All');
  const [transferYear, setTransferYear] = useState('All');
  const [awardingBody, setAwardingBody] = useState('All');
  const [maxBudget, setMaxBudget] = useState(100); // in Lakhs

  // Modal Detail state
  const [selectedUni, setSelectedUni] = useState(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await api.get('/universities');
        setUniversities(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Error fetching universities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Handle Filtering
  useEffect(() => {
    let result = universities;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.city.toLowerCase().includes(q)
      );
    }

    // Country
    if (country !== 'All') {
      result = result.filter(u => u.country === country);
    }

    // Subject Track
    if (subject !== 'All') {
      result = result.filter(u => u.subjects.some(sub => sub.includes(subject) || subject.includes(sub)));
    }

    // Transfer Year
    if (transferYear !== 'All') {
      result = result.filter(u => u.transferYear.includes(transferYear));
    }

    // Awarding Organisation
    if (awardingBody !== 'All') {
      result = result.filter(u => u.awardingBody === awardingBody);
    }

    // Budget Slider (filter by max cost range)
    result = result.filter(u => u.costLakhsMax <= maxBudget);

    setFiltered(result);
  }, [search, country, subject, transferYear, awardingBody, maxBudget, universities]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Extracted unique values for options
  const countries = ['All', 'United Kingdom', 'Australia', 'Canada', 'Ireland'];
  const subjects = [
    'All', 
    'Business & Management', 
    'Computing & Data', 
    'Engineering', 
    'Creative & Media', 
    'Health & Life Sciences', 
    'Hospitality & Tourism'
  ];
  const transferYears = ['All', 'Year 2', 'Year 3'];
  const awardingBodies = ['All', 'Pearson', 'ATHE'];

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      {/* Header */}
      <section className="container-prose pt-16 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">University Explorer</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-[1.05]">
          See where your pathway can lead.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          Filter by country, subject track, budget limits, transfer year, and awarding organisation. Click any card for progression details.
        </p>
      </section>

      {/* Filters Section */}
      <section className="container-prose mb-12">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.06)]">
          {/* Top Row: Search and Budget */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search university or city..."
                className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            {/* Budget Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Budget Limit</span>
                <span className="text-primary font-semibold">Up to ₹{maxBudget} Lakhs</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹15L</span>
                <span>₹100L+</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Select Filters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-border">
            {/* Country Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Track</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Transfer Entry Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transfer Entry</label>
              <select
                value={transferYear}
                onChange={(e) => setTransferYear(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
              >
                {transferYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Awarding Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awarding Body</label>
              <select
                value={awardingBody}
                onChange={(e) => setAwardingBody(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
              >
                {awardingBodies.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Results */}
      <section className="container-prose">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {universities.length} universities
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <SlidersHorizontal className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground">No universities match your filters</p>
            <button 
              onClick={() => {
                setSearch('');
                setCountry('All');
                setSubject('All');
                setTransferYear('All');
                setAwardingBody('All');
                setMaxBudget(100);
              }}
              className="mt-3 text-sm text-primary font-semibold underline underline-offset-4"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((uni) => (
              <div 
                key={uni._id} 
                onClick={() => setSelectedUni(uni)}
                className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/60 hover:shadow-[0_20px_40px_-12px_rgba(232,181,67,0.12)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display text-xl text-foreground font-semibold leading-tight">{uni.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{uni.city}, {uni.country}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {uni.subjects.map((sub, i) => (
                      <span key={i} className="text-[10px] uppercase font-semibold bg-surface-2 text-foreground/80 px-2 py-0.5 rounded">
                        {sub}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Pathway:</span>
                      <span className="font-medium text-foreground">{uni.pathway}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Year:</span>
                      <span className="font-medium text-foreground">{uni.transferYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Awarded by:</span>
                      <span className="font-medium text-foreground">{uni.awardingBody}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Indicative Cost</p>
                    <p className="text-sm font-semibold text-primary">₹{uni.costLakhsMin}–{uni.costLakhsMax} Lakhs total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">EMI Starts From</p>
                    <p className="text-xs font-semibold text-foreground">₹{uni.emiMonthly.toLocaleString('en-IN')}/mo</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Detail Dialog */}
      {selectedUni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedUni(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-2xl text-foreground pr-8">{selectedUni.name}</h2>
              <p className="text-sm text-primary mt-1">{selectedUni.city}, {selectedUni.country}</p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Pathway Option</p>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedUni.pathway}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Advanced Standing</p>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="font-medium">Advanced Entry: {selectedUni.transferYear}</span>
                </div>
              </div>
            </div>

            {/* Cost Details */}
            <div className="rounded-lg bg-surface-2 p-4 border border-border space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financial Summary</h4>
              <div className="flex justify-between text-sm">
                <span>Indicative Total Cost:</span>
                <span className="font-semibold text-primary">₹{selectedUni.costLakhsMin}–{selectedUni.costLakhsMax} Lakhs</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border/60 pt-2">
                <span>Estimated Monthly EMI:</span>
                <span className="font-semibold text-foreground">₹{selectedUni.emiMonthly.toLocaleString('en-IN')}/month</span>
              </div>
            </div>

            {/* Subject Tracks */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mapped Subject Fields</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedUni.subjects.map((sub, i) => (
                  <span key={i} className="text-xs bg-surface-2 text-foreground/80 px-3 py-1 rounded-full border border-border">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer notes */}
            <p className="text-xs text-muted-foreground leading-relaxed pt-4 border-t border-border">
              Advanced entry is subject to academic evaluation and requirements set by the receiving university. Indicative costs include assumptions on tuition fees and cost of living. Speak to an advisor for custom plans.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Universities;