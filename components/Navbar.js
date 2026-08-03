"use client";

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Monitor, Moon, Sun, X } from 'lucide-react';

const navLinks = {
  pathways: [
    { label: 'For School Leavers', path: '/pathways/school-leavers' },
    { label: 'For University Students', path: '/pathways/university-students' },
    { label: 'For Graduates', path: '/pathways/graduates' },
    { label: 'How It Works', path: '/how-it-works' },
  ],
  universities: [
    { label: 'University Explorer', path: '/universities' },
    { label: 'Destinations', path: '/destinations' },
    { label: 'Success Stories', path: '/success' },
  ],
  academics: [
    { label: 'Recognition & Awarding Bodies', path: '/academics/recognition' },
    { label: 'Credit Transfer', path: '/academics/transfer' },
    { label: 'For Parents', path: '/for-parents' },
  ],
  admissions: [
    { label: 'Admissions Overview', path: '/admissions' },
    { label: 'Eligibility Checker', path: '/admissions/eligibility' },
    { label: 'Fees & Cost Calculator', path: '/admissions/fees' },
    { label: 'Book a Consultation', path: '/contact' },
  ],
};

const Navbar = ({ siteSettings = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();
  const siteName = siteSettings.siteName || 'Cornerstone';
  const siteLogo = String(siteSettings.siteLogo || '').trim();
  const dropdownIds = {
    pathways: useId(),
    universities: useId(),
    academics: useId(),
    admissions: useId(),
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
      <div className="container-prose flex items-center justify-between gap-6">
        <Link href="/" aria-label={`${siteName} home`} className="flex items-center gap-2">
          {siteLogo ? (
            <img
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
          {Object.keys(navLinks).map((section) => (
            <div
              key={section}
              className="relative"
              onMouseEnter={() => setActiveDropdown(section)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={activeDropdown === section}
                aria-controls={dropdownIds[section]}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm capitalize text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {section}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {activeDropdown === section ? (
                <div
                  id={dropdownIds[section]}
                  role="menu"
                  className="absolute left-0 mt-1 w-56 rounded-md border border-border bg-surface p-2 shadow-lg ring-1 ring-black/5"
                >
                  {navLinks[section].map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      role="menuitem"
                      className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface-2 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <Link
            href="/for-parents"
            className="rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            For Parents
          </Link>
          <Link
            href="/success"
            className="rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Success
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
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
      </div>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-background px-6 py-4 space-y-4 lg:hidden"
        >
          {Object.keys(navLinks).map((section) => (
            <div key={section} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                {section}
              </p>
              <div className="space-y-1 pl-3">
                {navLinks[section].map((link) => (
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
          ))}
          <div className="space-y-3 border-t border-border pt-4">
            <Link href="/for-parents" className="block text-sm text-foreground/80 hover:text-foreground">
              For Parents
            </Link>
            <Link href="/success" className="block text-sm text-foreground/80 hover:text-foreground">
              Success Stories
            </Link>
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
