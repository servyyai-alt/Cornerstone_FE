"use client";

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useRouteData } from '../route-data-context';
import Container from '../../../components/ui/Container';

// Success page metadata is handled by the root layout or can be added via CMS

const Success = () => {
  const routeData = useRouteData();
  const initialStories = Array.isArray(routeData?.stories) ? routeData.stories : [];
  const [stories, setStories] = useState(initialStories);
  const [loading, setLoading] = useState(initialStories.length === 0);

  useEffect(() => {
    if (initialStories.length > 0) {
      return;
    }

    const fetchStories = async () => {
      try {
        const res = await api.get('/success-stories?public=1');
        setStories(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [initialStories.length]);

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
      <Container className="pb-10 pt-16 lg:pb-16 lg:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Student Journeys</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          Documented student journeys.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Real students, real routes. Each journey is shared with permission and reflects individual effort and choices.
        </p>
      </Container>

      {/* Grid */}
      <Container className="pb-16">
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
      </Container>

      {/* Footer warning */}
      <section className="bg-surface-2 border-t border-border/50">
        <Container className="py-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">A note</p>
          <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight">Outcomes depend on the student.</h2>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground rounded-md border border-dashed border-border bg-surface p-4 max-w-xl mx-auto">
            Each journey is shared with the student's permission. Outcomes reflect individual effort, choices and admission decisions, and are not a forecast for any other student.
          </p>
        </Container>
      </section>
    </main>
  );
};

export default Success;
