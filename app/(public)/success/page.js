"use client";

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const Success = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/success-stories');
        setStories(res.data);
      } catch (err) {
        console.error('Error fetching success stories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
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
      <section className="container-prose pb-10 pt-16 lg:pb-16 lg:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Student Journeys</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          Individual journeys, not promises.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Real students, real routes. The pathway is the same shape; the outcomes belong to each student.
        </p>
      </section>

      {/* Grid */}
      <section className="container-prose pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story._id} className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.12)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{story.initials}</p>
                <p className="mt-2 font-display text-lg text-foreground font-medium">{story.startPoint}</p>
                <p className="mt-3 text-sm text-muted-foreground">{story.pathway}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">→ {story.destination}</p>
              </div>
              {story.outcome && (
                <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                  {story.outcome}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Footer warning */}
      <section className="bg-surface-2 border-t border-border/50">
        <div className="container-prose py-12 text-center max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">A note</p>
          <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight">Outcomes depend on the student.</h2>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground rounded-md border border-dashed border-border bg-surface p-4 max-w-xl mx-auto">
            Each journey is shared with the student's permission. Outcomes reflect individual effort, choices and admission decisions, and are not a forecast for any other student.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Success;