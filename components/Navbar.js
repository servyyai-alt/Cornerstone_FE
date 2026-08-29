"use client";

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import Img from './Img';
import Container from './ui/Container';

// Ordered nav structure — mix of dropdown groups and plain links, matching design.
const navItems = [
  {
    type: 'dropdown',
    key: 'pathways',
    label: 'Pathways',
    items: [
      { label: 'For School Leavers', path: '/pathways/school-leavers' },
      { label: 'For University Students', path: '/pathways/university-students' },
      { label: 'For Graduates', path: '/pathways/graduates' },
    ],
  },
  {
    type: 'dropdown',
    key: 'universities',
    label: 'Universities',
    items: [
      { label: 'University Explorer', path: '/universities' },
      { label: 'Destinations', path: '/destinations' },
    ],
  },
  {
    type: 'dropdown',
    key: 'academics',
    label: 'Academics',
    items: [
      { label: 'All Programmes', path: '/programmes' },
      { label: 'How Progression Works', path: '/how-it-works' },
    ],
  },
  {
    type: 'link',
    key: 'for-parents',
    label: 'For Parents',
    path: '/for-parents',
  },
  {
    type: 'link',
    key: 'success',
    label: 'Success',
    path: '/success',
  },
  {
    type: 'dropdown',
    key: 'admissions',
    label: 'Admissions',
    items: [
      { label: 'Admissions Overview', path: '/admissions' },
      { label: 'Eligibility Checker', path: '/admissions/eligibility' },
      { label: 'Fees & Cost Calculator', path: '/admissions/fees' },
    ],
  },
];

const Navbar = ({ siteSettings = {}, pages = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();
  const siteName = siteSettings.siteName || 'Cornerstone';
  const siteLogo = String(siteSettings.siteLogo || '').trim();

  // Filter custom admin-created dynamic pages
  const staticSlugs = [
    'home', 'about', 'academics', 'admissions', 'contact', 'success', 
    'destinations', 'universities', 'for-parents', 'how-it-works', 
    'programmes', 'privacy', 'terms', 'accessibility', 'pathways'
  ];
  
  const customPages = (pages || []).filter(
    (page) => page && page.status === 'published' && !staticSlugs.includes(page.slug)
  );

  const dynamicNavItems = [...navItems];
  if (customPages && customPages.length > 0) {
    dynamicNavItems.push({
      type: 'dropdown',
      key: 'more-pages',
      label: 'More',
      items: customPages.map(page => ({
        label: page.title || page.internalName,
        path: `/${page.slug}`
      }))
    });
  }

  // Stable dropdown ids keyed off the nav item key, generated once per render tree.
  const morePagesId = useId();
  const dropdownIds = {
    pathways: useId(),
    universities: useId(),
    academics: useId(),
    admissions: useId(),
    'more-pages': morePagesId,
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('cornerstone-theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
      root.style.colorScheme = systemTheme;
    }

    localStorage.setItem('cornerstone-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 py-4 backdrop-blur transition-all">
      <Container className="flex items-center justify-between gap-6">
        <Link href="/" aria-label={`${siteName} home`} className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          {siteLogo ? (
            <Img
              src={siteLogo}
              alt={siteName}
              className="h-9 max-w-[120px] object-contain"
            />
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface font-display text-lg font-semibold text-primary"
            >
              C
            </span>
          )}
          <span className="font-display text-lg font-medium tracking-tight text-foreground">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {dynamicNavItems.map((item) => {
            if (item.type === 'link') {
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  className="inline-flex items-center rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === item.key}
                  aria-controls={dropdownIds[item.key]}
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {activeDropdown === item.key ? (
                  <div className="absolute left-0 top-full pt-1.5 w-56 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
                    <div
                      id={dropdownIds[item.key]}
                      role="menu"
                      className="rounded-md border border-border bg-surface p-2 shadow-lg ring-1 ring-black/5"
                    >
                      {item.items.map((link) => (
                        <Link
                          key={link.path}
                          href={link.path}
                          role="menuitem"
                          className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors duration-150"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="inline-flex items-center py-2 text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Book a Consultation
          </Link>
          <Link
            href="/find-your-pathway"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-black shadow-sm transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md"
          >
            Find Your Pathway
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-background px-6 py-4 space-y-4 lg:hidden"
        >
          {dynamicNavItems.map((item) => {
            if (item.type === 'link') {
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  className="block py-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.key} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <div className="space-y-1 pl-3">
                  {item.items.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="block py-1.5 text-sm text-foreground/80 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="space-y-3 border-t border-border pt-4">
            <Link href="/contact" className="block text-sm text-foreground/80 hover:text-foreground">
              Book a Consultation
            </Link>
            <Link
              href="/find-your-pathway"
              className="block w-full rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-black"
            >
              Find Your Pathway
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;