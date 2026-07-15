"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Monitor, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  // Load theme from localStorage after mount to avoid SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('cornerstone-theme') || 'dark';
      setTheme(savedTheme);
    }
  }, []);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Handle Theme Toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      // System
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
    localStorage.setItem('cornerstone-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

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
    ]
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur transition-all py-4">
      <div className="container-prose flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" aria-label="Cornerstone — Home" className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface font-display text-lg font-semibold text-primary">
            C
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-foreground">
            Cornerstone
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {/* Dropdown Items */}
          {['pathways', 'universities', 'academics', 'admissions'].map((section) => (
            <div
              key={section}
              className="relative"
              onMouseEnter={() => setActiveDropdown(section)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground capitalize"
              >
                {section}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {activeDropdown === section && (
                <div className="absolute left-0 mt-1 w-56 rounded-md border border-border bg-surface p-2 shadow-lg ring-1 ring-black/5">
                  {navLinks[section].map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-surface-2 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Simple Link */}
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

        {/* Action Buttons & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/contact"
            className="text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Book a Consultation
          </Link>
          <Link
            href="/find-your-pathway"
            className="inline-flex items-center justify-center rounded-md bg-primary text-black px-4 py-2 text-sm font-medium shadow-sm transition-all hover:-translate-y-px hover:shadow-md hover:bg-primary-hover"
          >
            Find Your Pathway
          </Link>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 h-10 w-10"
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

        {/* Mobile View controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 h-9 w-9"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : theme === 'light' ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-background py-4 px-6 space-y-4">
          {Object.keys(navLinks).map((section) => (
            <div key={section} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                {section}
              </p>
              <div className="pl-3 space-y-1">
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
          <div className="border-t border-border pt-4 space-y-3">
            <Link
              href="/for-parents"
              className="block text-sm text-foreground/80 hover:text-foreground"
            >
              For Parents
            </Link>
            <Link
              href="/success"
              className="block text-sm text-foreground/80 hover:text-foreground"
            >
              Success Stories
            </Link>
            <Link
              href="/contact"
              className="block text-sm text-foreground/80 hover:text-foreground"
            >
              Book a Consultation
            </Link>
            <Link
              href="/find-your-pathway"
              className="block w-full text-center rounded-md bg-primary text-black px-4 py-2.5 text-sm font-medium"
            >
              Find Your Pathway
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;