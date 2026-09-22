"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import Container from './ui/Container';
import Img from './Img';

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
    const {
      sectionId = '',
      title,
      subtitle,
      description,
      content,
      label,
      image: sectionImage,
      backgroundImage,
      alignment = 'left',
      displayMode = 'default',
      buttonUrl: sectionButtonUrl,
      buttonText: sectionButtonText,
      items = [],
    } = section;

    const sectionKey = section.id || section._id || sectionId || idx;
    const sectionLabel = label || section.label;
    const sectionTitle = title || '';
    const sectionSubtitle = subtitle || '';
    const sectionDescription = description || content || '';
    const sectionExtraContent = content && content !== description ? content : '';
    const imageSrc = trimValue(sectionImage);
    const bgImageSrc = trimValue(backgroundImage);

    const isHero = /hero|intro/i.test(sectionId);
    const isCta = /cta|call.to.action/i.test(sectionId);
    const isCenter = alignment === 'center' || displayMode === 'banner';

    const sectionStyle = bgImageSrc
      ? {
          backgroundImage: `linear-gradient(rgba(14, 30, 52, 0.85), rgba(14, 30, 52, 0.85)), url("${bgImageSrc}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

    if (isHero) {
      return (
        <section key={sectionKey} style={sectionStyle} className={bgImageSrc ? 'text-white' : ''}>
          <Container className="py-16 lg:py-24">
            {imageSrc && !isCenter ? (
              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div className={alignment === 'right' ? 'lg:order-2' : ''}>
                  {sectionLabel && (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                      {sectionLabel}
                    </p>
                  )}
                  <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    {sectionTitle}
                  </h1>
                  {(sectionSubtitle || sectionDescription) && (
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                      {sectionSubtitle || sectionDescription}
                    </p>
                  )}
                  {items.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-4">
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
                </div>
                <div className={`${alignment === 'right' ? 'lg:order-1' : ''} relative rounded-2xl border border-border bg-surface overflow-hidden shadow-lg`}>
                  <Img src={imageSrc} alt={sectionTitle || 'Hero image'} className="w-full h-full object-cover max-h-[480px]" />
                </div>
              </div>
            ) : (
              <div className="text-center">
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
                {imageSrc && (
                  <div className="mt-10 max-w-4xl mx-auto relative rounded-2xl border border-border overflow-hidden shadow-lg">
                    <Img src={imageSrc} alt={sectionTitle || 'Hero banner'} className="w-full h-full object-cover max-h-[480px]" />
                  </div>
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
              </div>
            )}
          </Container>
        </section>
      );
    }

    if (isCta) {
      return (
        <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
          <Container>
            {imageSrc ? (
              <div className="grid gap-8 lg:grid-cols-2 items-center max-w-4xl mx-auto rounded-2xl border border-border bg-surface p-8 lg:p-12 shadow-sm">
                <div className={alignment === 'right' ? 'lg:order-2' : ''}>
                  {sectionLabel && (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                      {sectionLabel}
                    </p>
                  )}
                  <h2 className="font-display text-2xl lg:text-3xl text-primary mb-4">{sectionTitle}</h2>
                  {sectionDescription && (
                    <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                      {sectionDescription}
                    </p>
                  )}
                  {items.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.buttonUrl || item.url || '#'}
                          className={
                            i === 0
                              ? 'inline-flex items-center justify-center rounded-md bg-primary text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px'
                              : 'inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium transition-all hover:bg-surface-2'
                          }
                        >
                          {item.title || item.label || item.buttonText || 'Learn More'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ))}
                    </div>
                  ) : (sectionButtonUrl || section.buttonUrl) ? (
                    <Link
                      href={sectionButtonUrl || section.buttonUrl}
                      className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
                    >
                      {sectionButtonText || section.buttonText || 'Learn More'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
                <div className={`${alignment === 'right' ? 'lg:order-1' : ''} relative rounded-xl border border-border overflow-hidden aspect-video shadow-sm`}>
                  <Img src={imageSrc} alt={sectionTitle || 'CTA banner'} className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
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
                ) : (sectionButtonUrl || section.buttonUrl) ? (
                  <Link
                    href={sectionButtonUrl || section.buttonUrl}
                    className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
                  >
                    {sectionButtonText || section.buttonText || sectionTitle || 'Learn More'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            )}
          </Container>
        </section>
      );
    }

    if (items.length > 0 && items.some((item) => item.buttonUrl || item.url)) {
      return (
        <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
          <Container>
            <div className={`mb-12 ${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : 'max-w-2xl'}`}>
              <div>
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
              {imageSrc && (
                <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm aspect-video max-h-72">
                  <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <Link
                  key={i}
                  href={item.buttonUrl || item.url || '#'}
                  className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)] flex flex-col justify-between"
                >
                  <div>
                    {item.image && (
                      <div className="relative h-44 w-full mb-4 overflow-hidden rounded-lg bg-surface-2 border border-border">
                        <Img
                          src={item.image}
                          alt={item.title || item.label || ''}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <h3 className="font-display text-xl text-foreground mb-2">
                      {item.title || item.label || ''}
                    </h3>
                    {(item.subtitle || item.description || item.content) && (
                      <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                        {item.subtitle || item.description || item.content}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-2">
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
      const isStepSection = /step|journey|path|stage|process|ladder/i.test(sectionId);

      if (isStepSection || /0[1-9]/.test(trimValue(items[0].title))) {
        return (
          <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
            <Container>
              <div className={`mb-12 ${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : 'max-w-2xl'}`}>
                <div>
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
                {imageSrc && (
                  <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm aspect-video max-h-72">
                    <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                  >
                    {item.image && (
                      <div className="relative h-32 w-full mb-3 overflow-hidden rounded-lg bg-surface-2 border border-border">
                        <Img src={item.image} alt={item.title || ''} className="h-full w-full object-cover" />
                      </div>
                    )}
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
        <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
          <Container>
            <div className={`mb-12 ${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : 'max-w-3xl'}`}>
              <div>
                {sectionLabel && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                    {sectionLabel}
                  </p>
                )}
                <h2 className="font-display text-2xl text-primary mb-4">{sectionTitle}</h2>
                {sectionDescription && (
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    {sectionDescription}
                  </p>
                )}
              </div>
              {imageSrc && (
                <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm aspect-video max-h-72">
                  <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-6 max-w-3xl">
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
                      <div className="flex-1">
                        {item.image && (
                          <div className="relative h-40 w-full mb-3 overflow-hidden rounded-lg bg-surface-2 border border-border">
                            <Img src={item.image} alt={item.title || ''} className="h-full w-full object-cover" />
                          </div>
                        )}
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
          <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
            <Container>
              <div className={`mb-12 ${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : 'max-w-2xl'}`}>
                <div>
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
                {imageSrc && (
                  <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm aspect-video max-h-72">
                    <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <ul className="space-y-4 max-w-3xl">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></span>
                    <div className="flex-1">
                      {item.image && (
                        <div className="relative h-36 w-full max-w-sm mb-2 overflow-hidden rounded-lg bg-surface-2 border border-border">
                          <Img src={item.image} alt={item.title || ''} className="h-full w-full object-cover" />
                        </div>
                      )}
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
        <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
          <Container>
            <div className={`mb-12 ${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : 'max-w-2xl'}`}>
              <div>
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
              {imageSrc && (
                <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm aspect-video max-h-72">
                  <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                >
                  {item.image && (
                    <div className="relative h-40 w-full mb-3 overflow-hidden rounded-lg bg-surface-2 border border-border">
                      <Img src={item.image} alt={item.title || ''} className="h-full w-full object-cover" />
                    </div>
                  )}
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
        <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
          <Container>
            <div className={`mb-12 ${imageSrc ? 'grid lg:grid-cols-2 gap-8 items-center' : 'max-w-2xl'}`}>
              <div>
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
              {imageSrc && (
                <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm aspect-video max-h-72">
                  <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(185,151,80,0.08)]"
                >
                  {item.image && (
                    <div className="relative h-40 w-full mb-3 overflow-hidden rounded-lg bg-surface-2 border border-border">
                      <Img src={item.image} alt={item.title || ''} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-display text-xl text-foreground mb-1">
                    {item.title || item.label || ''}
                  </h3>
                  {item.subtitle && (
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

    // Default return: Text, Text + Image, or Custom Block without items
    if (imageSrc) {
      if (isCenter) {
        return (
          <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
            <Container>
              <div className="max-w-4xl mx-auto text-center space-y-6">
                {sectionLabel && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {sectionLabel}
                  </p>
                )}
                <h2 className="font-display text-3xl text-primary">{sectionTitle}</h2>
                <div className="relative rounded-2xl border border-border overflow-hidden shadow-md max-h-[460px]">
                  <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
                </div>
                {sectionDescription && (
                  <div className="text-left rounded-xl border border-border bg-surface p-6 shadow-sm">
                    <p className="text-sm leading-relaxed text-muted-foreground">{sectionDescription}</p>
                    {sectionExtraContent && (
                      <p className="text-sm leading-relaxed text-muted-foreground mt-4 pt-4 border-t border-border">
                        {sectionExtraContent}
                      </p>
                    )}
                  </div>
                )}
                {(sectionButtonUrl || section.buttonUrl) && (
                  <div className="pt-2">
                    <Link
                      href={sectionButtonUrl || section.buttonUrl}
                      className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
                    >
                      {sectionButtonText || section.buttonText || 'Learn More'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </Container>
          </section>
        );
      }

      // 2-column layout (left/right alignment)
      return (
        <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className={alignment === 'right' ? 'lg:order-2' : ''}>
                {sectionLabel && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                    {sectionLabel}
                  </p>
                )}
                <h2 className="font-display text-2xl lg:text-3xl text-primary mb-4">{sectionTitle}</h2>
                {sectionDescription && (
                  <div className="rounded-xl border border-border bg-surface p-6 shadow-sm mb-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{sectionDescription}</p>
                    {sectionExtraContent && (
                      <p className="text-sm leading-relaxed text-muted-foreground mt-4 pt-4 border-t border-border">
                        {sectionExtraContent}
                      </p>
                    )}
                  </div>
                )}
                {(sectionButtonUrl || section.buttonUrl) && (
                  <Link
                    href={sectionButtonUrl || section.buttonUrl}
                    className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
                  >
                    {sectionButtonText || section.buttonText || 'Learn More'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
              <div className={`${alignment === 'right' ? 'lg:order-1' : ''} relative rounded-2xl border border-border overflow-hidden shadow-md bg-surface max-h-[460px]`}>
                <Img src={imageSrc} alt={sectionTitle} className="w-full h-full object-cover" />
              </div>
            </div>
          </Container>
        </section>
      );
    }

    // Default text-only section
    return (
      <section key={sectionKey} style={sectionStyle} className="border-t border-border py-16">
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
                {sectionExtraContent && (
                  <p className="text-sm leading-relaxed text-muted-foreground mt-4 pt-4 border-t border-border">
                    {sectionExtraContent}
                  </p>
                )}
              </div>
            )}
            {(sectionButtonUrl || section.buttonUrl) && (
              <div className="mt-6">
                <Link
                  href={sectionButtonUrl || section.buttonUrl}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-px"
                >
                  {sectionButtonText || section.buttonText || 'Learn More'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
