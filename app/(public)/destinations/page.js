"use client";

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Compass, GraduationCap, DollarSign, Heart } from 'lucide-react';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/destinations');
        setDestinations(res.data);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      {/* Header */}
      <section className="container-prose pt-16 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Destinations</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-[1.05]">
          Pick the country that fits the family.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          Clear-eyed, comparable facts regarding typical living costs, visa guidelines, and post-study opportunities across transfer destinations.
        </p>
      </section>

      {/* Destinations List */}
      <section className="container-prose space-y-12">
        {destinations.map((dest) => (
          <div 
            key={dest._id} 
            className="rounded-xl border border-border bg-surface p-8 shadow-sm grid gap-8 md:grid-cols-[1fr_2fr] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]"
          >
            {/* Visual Header */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2.5 mb-4">
                  <Compass className="h-6 w-6" />
                </span>
                <h2 className="font-display text-3xl text-foreground font-semibold">{dest.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-4 md:mt-0">
                Data sources updated dynamically.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Cost of Living */}
              <div className="border border-border bg-surface-2 p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <DollarSign className="h-5 w-5 text-primary mb-3" />
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Living cost</h3>
                  <p className="text-sm font-semibold text-foreground">{dest.livingCost}</p>
                </div>
              </div>

              {/* Visa & Career */}
              <div className="border border-border bg-surface-2 p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <GraduationCap className="h-5 w-5 text-primary mb-3" />
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Career & visa</h3>
                  <p className="text-sm font-semibold text-foreground">{dest.careerVisa}</p>
                </div>
              </div>

              {/* Lifestyle Notes */}
              <div className="border border-border bg-surface-2 p-5 rounded-lg flex flex-col justify-between col-span-1 sm:col-span-3 lg:col-span-1">
                <div>
                  <Heart className="h-5 w-5 text-primary mb-3" />
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Lifestyle notes</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{dest.lifestyleNotes}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* A Note on numbers */}
      <section className="bg-surface-2 border-t border-border/50 mt-16">
        <div className="container-prose py-12 max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">A note on numbers</p>
          <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight">Estimates, not promises.</h2>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground rounded-md border border-dashed border-primary/20 bg-surface p-4 max-w-xl mx-auto transition-all duration-200 hover:border-primary/40">
            Cost-of-living and visa figures are indicative ranges from publicly available sources at the time of writing. Visa policies in particular change — always reconfirm before you commit.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Destinations;