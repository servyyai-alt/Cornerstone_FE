"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import Container from './ui/Container';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const trimValue = (value) => String(value ?? '').trim();

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => {
    const orderDelta = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
    if (orderDelta !== 0) return orderDelta;
    return trimValue(a.title || a.sectionId || a.label || '').localeCompare(
      trimValue(b.title || b.sectionId || b.label || '')
    );
  });

const normalizePageSections = (pageData) =>
  sortByOrder(Array.isArray(pageData?.sections) ? pageData.sections : [])
    .filter((section) => section?.isVisible !== false && section?.isActive !== false)
    .map((section) => ({
      ...section,
      items: sortByOrder(Array.isArray(section.items) ? section.items : []).filter(
        (item) => item?.isActive !== false
      ),
    }));

const hasNumberedTitles = (items) =>
  items.length > 0 && items.every((item) => /^\d+[.\s]/.test(trimValue(item.title)));

const CmsPageRenderer = ({ pageData: initialPageData, slug, fallback = null, className = '' }) => {
  const [pageData, setPageData] = useState(initialPageData || null);
  const [loading, setLoading] = useState(!initialPageData && !!slug);

  useEffect(() => {
    if (initialPageData) return;
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const res = await api.get(`/pages/${slug}?public=1`);
        setPageData(res.data);
      } catch {
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [initialPageData, slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const sections = normalizePageSections(pageData);

  if (sections.length === 0) {
    return fallback;
  }

  const renderSection = (section, idx) => {
    const { sectionId = '', title, subtitle, description, content, label, items = [] } = section;
    const sectionKey = section.id || sectionId || idx;
    const sectionLabel = label || section.label;
    const sectionTitle = title || '';
    const sectionSubtitle = subtitle || '';
    const sectionDescription = description || content || '';

    const isHero = /hero/i.test(sectionId);
    const isCta = /cta|call.to.action/i.test(sectionId);

    if (isHero) {
      return (
        <Container key={sectionKey} className="py-16 lg:py-24 text-center">
          {sectionLabel && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              {sectionLabel}
            </p>
          )}
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
            {sectionTitle}
          </h1>
          {(sectionSubtitle || sectionDescription) && (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              {sectionSubtitle || sectionDescription}
            </p>
          )}
          {items.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {items.map((item, i) => (
                <Link
                  key={i}
                  href={item.buttonUrl || item.url || '#'}
                  className={
                    i === 0
                      ? 'inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px'
                      : 'inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium transition-all hover:bg-surface-2'
                  }
                >
                  {item.title || item.label || item.buttonText || 'Learn More'}
                </Link>
              ))}
            </div>
          )}
        </Container>
      );
    }

    if (isCta) {
      return (
        <section key={sectionKey} className="border-t border-border py-16">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              {sectionLabel && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  {sectionLabel}
                </p>
              )}
              <h2 className="font-display text-2xl text-primary mb-4">{sectionTitle}</h2>
              {sectionDescription && (
                <p className="text-sm leading-relaxed text-muted-foreground mb-8">
                  {sectionDescription}
                </p>
              )}
              {items.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {items.map((item, i) => (
                    <Link
                      key={i}
                      href={item.buttonUrl || item.url || '#'}
                      className={
                        i === 0
                          ? 'inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px'
                          : 'inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium transition-all hover:bg-surface-2'
                      }
                    >
                      {item.title || item.label || item.buttonText || 'Learn More'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ))}
                </div>
              ) : section.buttonUrl ? (
                <Link
                  href={section.buttonUrl}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
                >
                  {section.buttonText || sectionTitle || 'Learn More'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </Container>
        </section>
      );
    }

    if (items.length > 0 && items.some((item) => item.buttonUrl || item.url)) {
      return (
        <section key={sectionKey} className="border-t border-border py-16">
          <Container>
            <div className="mb-12 max-w-2xl">
              {sectionLabel && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  {sectionLabel}
                </p>
              )}
              <h2 className="font-display text-2xl text-primary">{sectionTitle}</h2>
              {sectionDescription && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {sectionDescription}
                </p>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <Link
                  key={i}
                  href={item.buttonUrl || item.url || '#'}
                  className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)] block"
                >
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {item.title || item.label || ''}
                  </h3>
                  {(item.subtitle || item.description || item.content) && (
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      {item.subtitle || item.description || item.content}
                    </p>
                  )}
                  <span className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    {item.buttonText || 'Learn More'}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    if (items.length > 0 && hasNumberedTitles(items)) {
      const firstNum = parseInt(trimValue(items[0].title), 10);
      const isStepSection = /step|journey|path|stage|process|ladder/i.test(sectionId);

      if (isStepSection || /0[1-9]/.test(trimValue(items[0].title))) {
        return (
          <section key={sectionKey} className="border-t border-border py-16">
            <Container>
              <div className="mb-12 max-w-2xl">
                {sectionLabel && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                    {sectionLabel}
                  </p>
                )}
                <h2 className="font-display text-2xl text-primary">{sectionTitle}</h2>
                {sectionDescription && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {sectionDescription}
                  </p>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mb-3">
                      {i + 1}
                    </div>
                    <h3 className="font-display text-xl text-foreground mb-1">
                      {item.title.replace(/^\d+[.\s]+/, '').trim() || item.title}
                    </h3>
                    {(item.subtitle || item.label) && (
                      <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-3">
                        {item.subtitle || item.label}
                      </p>
                    )}
                    {(item.description || item.content) && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description || item.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Container>
          </section>
        );
      }

      return (
        <section key={sectionKey} className="border-t border-border py-16">
          <Container>
            <div className="max-w-3xl">
              {sectionLabel && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  {sectionLabel}
                </p>
              )}
              <h2 className="font-display text-2xl text-primary mb-8">{sectionTitle}</h2>
              {sectionDescription && (
                <p className="text-sm leading-relaxed text-muted-foreground mb-8">
                  {sectionDescription}
                </p>
              )}
              <div className="space-y-8">
                {items.map((item, i) => {
                  const num = parseInt(trimValue(item.title), 10);
                  const cleanTitle = item.title.replace(/^\d+[.\s]+/, '').trim();
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                    >
                      <div className="flex items-start gap-4">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {num || i + 1}
                        </span>
                        <div>
                          <h3 className="font-display text-xl text-foreground mb-2">
                            {cleanTitle || item.title}
                          </h3>
                          {(item.description || item.content) && (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {item.description || item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      );
    }

    if (items.length > 0 && items.some((item) => item.description || item.content)) {
      const hasLongContent = items.some(
        (item) => (item.description || item.content || '').length > 120
      );

      if (hasLongContent) {
        return (
          <section key={sectionKey} className="border-t border-border py-16">
            <Container>
              <div className="mb-12 max-w-2xl">
                {sectionLabel && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                    {sectionLabel}
                  </p>
                )}
                <h2 className="font-display text-2xl text-primary">{sectionTitle}</h2>
                {sectionDescription && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {sectionDescription}
                  </p>
                )}
              </div>
              <ul className="space-y-4">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></span>
                    <div>
                      {item.title && (
                        <h3 className="font-display text-xl text-foreground mb-1">
                          {item.title}
                        </h3>
                      )}
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description || item.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        );
      }

      return (
        <section key={sectionKey} className="border-t border-border py-16">
          <Container>
            <div className="mb-12 max-w-2xl">
              {sectionLabel && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  {sectionLabel}
                </p>
              )}
              <h2 className="font-display text-2xl text-primary">{sectionTitle}</h2>
              {sectionDescription && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {sectionDescription}
                </p>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                >
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {item.title || item.label || ''}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description || item.content}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    if (items.length > 0) {
      return (
        <section key={sectionKey} className="border-t border-border py-16">
          <Container>
            <div className="mb-12 max-w-2xl">
              {sectionLabel && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  {sectionLabel}
                </p>
              )}
              <h2 className="font-display text-2xl text-primary">{sectionTitle}</h2>
              {sectionDescription && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {sectionDescription}
                </p>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                >
                  <h3 className="font-display text-xl text-foreground mb-1">
                    {item.title || item.label || ''}
                  </h3>
                  {(item.subtitle) && (
                    <p className="text-xs text-primary uppercase tracking-widest font-semibold mb-3">
                      {item.subtitle}
                    </p>
                  )}
                  {(item.description || item.content) && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description || item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    return (
      <section key={sectionKey} className="border-t border-border py-16">
        <Container>
          <div className="max-w-3xl">
            {sectionLabel && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                {sectionLabel}
              </p>
            )}
            <h2 className="font-display text-2xl text-primary mb-4">{sectionTitle}</h2>
            {sectionDescription && (
              <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {sectionDescription}
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    );
  };

  return (
    <main className={`flex-1 bg-background text-foreground pb-24 ${className}`}>
      {sections.map((section, idx) => renderSection(section, idx))}
    </main>
  );
};

export default CmsPageRenderer;
