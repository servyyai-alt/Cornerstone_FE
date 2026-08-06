"use client";

import React, { useState, useEffect } from "react";

// Contact page metadata is handled by the root layout or can be added via CMS
import api from "../../../services/api";
import { useRouteData } from "../route-data-context";
import { CheckCircle, ExternalLink, Mail, Phone, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import Container from "../../../components/ui/Container";

const normalizeMetaUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const candidates = raw.match(/^https?:\/\//i) ? [raw] : [`https://${raw}`];

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
      // try next candidate
    }
  }
  return null;
};

const extractWebsiteSettings = (payload) => {
  if (!payload) return null;

  const candidate =
    payload?.data?.settings ||
    payload?.data?.data ||
    payload?.data ||
    payload?.settings ||
    payload;

  if (!candidate || typeof candidate !== "object") return null;

  return candidate;
};

const buildFallbackMapSrc = (contactSettings) => {
  const latitudeRaw = String(contactSettings?.latitude ?? "").trim();
  const longitudeRaw = String(contactSettings?.longitude ?? "").trim();

  if (latitudeRaw && longitudeRaw) {
    const latitude = Number(latitudeRaw);
    const longitude = Number(longitudeRaw);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    }
  }

  const address = String(contactSettings?.officeAddress || "").trim();
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  }

  return null;
};

const extractMapSrc = (contactSettings) => {
  const rawEmbed = String(contactSettings?.googleMapEmbed || "").trim();
  if (rawEmbed) {
    const match = rawEmbed.match(/src=['"]([^'"]+)['"]/i);
    if (match?.[1]) {
      return match[1];
    }
  }

  return buildFallbackMapSrc(contactSettings);
};

const STEP_LABELS = [
  "Education stage",
  "Consultation type",
  "Schedule",
  "Contact details",
  "Consent & confirm",
];

const Contact = () => {
  const routeData = useRouteData();
  const initialContactSettings = routeData?.contactSettings || null;
  const initialWebsiteSettings = routeData?.websiteSettings || null;

  const [contactSettings, setContactSettings] = useState(initialContactSettings);
  const [websiteSettings, setWebsiteSettings] = useState(initialWebsiteSettings);
  const [loading, setLoading] = useState(!initialContactSettings || !initialWebsiteSettings);
  const [submitting, setSubmitting] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [step, setStep] = useState(0);
  const [educationStage, setEducationStage] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const enquiryFormUrl = normalizeMetaUrl(websiteSettings?.demoFormUrl);
  const showEnquiryForm = Boolean(enquiryFormUrl);
  const contactMapSrc = extractMapSrc(contactSettings);

  useEffect(() => {
    if (!showEnquiryForm) {
      setIframeLoading(false);
      return undefined;
    }

    setIframeLoading(true);
    const fallbackTimer = setTimeout(() => {
      setIframeLoading(false);
    }, 15000);

    return () => clearTimeout(fallbackTimer);
  }, [showEnquiryForm, enquiryFormUrl]);

  useEffect(() => {
    let mounted = true;

    const loadContactPageData = async () => {
      try {
        const [contactRes, websiteRes] = await Promise.all([
          api.get("/settings/contact?public=1"),
          api.get(`/settings/website?public=1&_ts=${Date.now()}`),
        ]);

        if (!mounted) return;

        setContactSettings(contactRes.data);
        setWebsiteSettings(extractWebsiteSettings(websiteRes));
        setError("");
      } catch (err) {
        if (!mounted) return;
        setError("The enquiry form could not be loaded right now. The fallback form is available below.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContactPageData();
    const intervalId = setInterval(loadContactPageData, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [initialContactSettings, initialWebsiteSettings]);

  const canContinue =
    step === 0
      ? Boolean(educationStage)
      : step === 1
        ? Boolean(consultationType)
        : step === 2
          ? Boolean(selectedDate && selectedTime)
          : step === 3
            ? Boolean(name && email && phone)
            : Boolean(consent);

  const handleNext = () => {
    if (step < STEP_LABELS.length - 1) {
      setStep((current) => current + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((current) => current - 1);
    }
  };

  const handleSubmitWithValidation = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        type: "consultation",
        name,
        email,
        phone,
        data: {
          educationStage,
          consultationType,
          selectedDate,
          selectedTime,
          consent,
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError("There was a problem submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (step < STEP_LABELS.length - 1) {
      handleNextWithValidation();
    } else {
      await handleSubmitWithValidation(e);
    }
  };

  const addToCalendar = () => {
    const dateValue = selectedDate || new Date().toISOString().split("T")[0];
    const timeValue = selectedTime || "10:00";
    const cleanPhone = String(phone || contactSettings?.phoneNumber || "+919876543210").replace(/[^\d+]/g, "");
    const whatsappMessage = encodeURIComponent(
      `Hi, I have booked a consultation on ${dateValue} at ${timeValue}.`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${whatsappMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[+]?[\d\s()-]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 2) {
      if (!selectedDate) newErrors.date = "Please select a date";
      if (!selectedTime) newErrors.time = "Please select a time";
    }
    
    if (step === 3) {
      if (!name.trim()) newErrors.name = "Name is required";
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!phone.trim()) {
        newErrors.phone = "Phone is required";
      } else if (!validatePhone(phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }
    
    if (step === 4 && !consent) {
      newErrors.consent = "You must agree to the privacy policy";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextWithValidation = () => {
    if (validateStep()) {
      handleNext();
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <Container className="pt-16 pb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Book a Consultation</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
          {contactSettings?.contactPageTitle || "One advisor. One conversation. No pressure."}
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-2xl mx-auto">
          {contactSettings?.description || "Speak to a named adviser on the phone or on campus in Bengaluru. No sales pitch, no urgency theatre."}
        </p>
      </Container>

      <Container aria-labelledby="consultation-heading">
        {showEnquiryForm ? (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Enquiry form</p>
                <h2 id="consultation-heading" className="mt-1 font-display text-2xl">
                  {websiteSettings?.websiteName ? `${websiteSettings.websiteName} enquiry form` : "Embedded enquiry form"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This URL is managed from Website Settings in the admin panel.
                </p>
              </div>
              <a
                href={enquiryFormUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            </div>

            {error && (
              <div role="alert" className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-background">
              {iframeLoading && (
                <div className="flex h-[700px] items-center justify-center bg-surface-2">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )}
              <iframe
                src={enquiryFormUrl}
                title="Embedded enquiry form"
                width="100%"
                height="700"
                style={{ border: 0, width: "100%", height: 700, display: iframeLoading ? "none" : "block" }}
                allow="clipboard-read; clipboard-write; clipboard-write-self; accelerometer; camera; gyroscope; microphone; payment"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setError("The embedded enquiry form failed to load. The fallback contact form is shown below.");
                  setIframeLoading(false);
                }}
              />
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              This form is managed from the admin panel. Changes in Website Settings are picked up automatically.
            </p>
          </div>
        ) : submitted ? (
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-4 text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-3 text-green-500">
              <CheckCircle className="h-8 w-8" />
            </span>
            <h3 className="font-display text-2xl font-semibold text-foreground">Consultation Requested</h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
              Thank you, {name}. Your request has been recorded. A Cornerstone adviser will call you at{" "}
              <span className="font-semibold text-foreground">{phone}</span> within 24 hours to schedule a conversation.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setEducationStage("");
                setConsultationType("");
                setSelectedDate("");
                setSelectedTime("");
                setName("");
                setEmail("");
                setPhone("");
                setConsent(false);
              }}
              className="mx-auto block pt-4 text-xs font-semibold text-primary underline underline-offset-4"
            >
              Submit another inquiry
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40">
            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {error}
              </div>
            )}

            <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {STEP_LABELS.map((label, idx) => (
                <li key={label} className="flex items-center gap-2">
                  <span className={idx <= step ? "text-primary" : ""}>{idx + 1}. {label}</span>
                  {idx < STEP_LABELS.length - 1 && <span aria-hidden="true">·</span>}
                </li>
              ))}
            </ol>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              {step === 0 && (
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-foreground">What is your current education stage?</legend>
                  {[
                    "School leaver",
                    "University student in India",
                    "University graduate",
                    "Working professional",
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                        educationStage === option ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <span>{option}</span>
                      <input
                        type="radio"
                        name="educationStage"
                        value={option}
                        checked={educationStage === option}
                        onChange={(e) => setEducationStage(e.target.value)}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-foreground">What type of consultation do you need?</legend>
                  {[
                    "Pathway advice",
                    "Eligibility check",
                    "Fees and financing",
                    "Credit transfer",
                    "Parent enquiry",
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                        consultationType === option ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <span>{option}</span>
                      <input
                        type="radio"
                        name="consultationType"
                        value={option}
                        checked={consultationType === option}
                        onChange={(e) => setConsultationType(e.target.value)}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="space-y-4">
                  <legend className="text-sm font-semibold text-foreground">Choose a preferred date and time</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Preferred date</label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Preferred time</label>
                      <select
                        required
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="">Select a time</option>
                        <option value="09:00">09:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                        <option value="16:00">16:00</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="space-y-4">
                  <legend className="text-sm font-semibold text-foreground">Your contact details</legend>
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Full name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Email address</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Phone number</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {step === 4 && (
                <fieldset className="space-y-4">
                  <legend className="text-sm font-semibold text-foreground">Consent and confirmation</legend>
                  <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      I agree to be contacted by Cornerstone about my enquiry. I understand my data will be handled in line with the privacy policy.
                    </span>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={addToCalendar}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-surface-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Add to calendar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cleanPhone = String(phone || contactSettings?.phoneNumber || "+919876543210").replace(/[^\d+]/g, "");
                        const url = `https://wa.me/${cleanPhone.replace("+", "")}`;
                        window.open(url, "_blank");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-surface-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp placeholder
                    </button>
                  </div>
                </fieldset>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-surface-2"
                    >
                      Back
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  {step < STEP_LABELS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextWithValidation}
                      disabled={!canContinue}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitWithValidation}
                      disabled={!canContinue || submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Confirm booking'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </Container>

      <Container className="mt-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Office Address</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.officeAddress || "Cornerstone Pathway College Campus, Outer Ring Road, Bengaluru, India"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone & WhatsApp</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.phoneNumber || "+91 98765 43210"}
              <br />
              {contactSettings?.whatsappNumber || "+91 98765 43210"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.email || "hello@cornerstone.edu"}
              <br />
              {contactSettings?.supportEmail || "support@cornerstone.edu"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Working Hours</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.workingHours || "Mon-Sat, 9:00 AM to 6:00 PM"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] lg:items-start">
          {contactMapSrc ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div
                className="relative w-full"
                style={{ minHeight: "clamp(320px, 55vh, 680px)" }}
              >
                <iframe
                  title="Cornerstone office location map"
                  src={contactMapSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-sm text-muted-foreground">
              Add a Google map embed in Admin to show your office location here.
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
              <h2 className="mt-2 font-display text-2xl">Live contact routing</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                The contact details, hours, and map here are all managed from the Contact Settings panel in CMS.
              </p>
              <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{contactSettings?.email || "hello@cornerstone.edu"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{contactSettings?.phoneNumber || "+91 98765 43210"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {contactSettings?.footerContactDetails || "Our team is available during business hours for guidance and admissions support."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Social Links</p>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  ["facebookUrl", "Facebook"],
                  ["instagramUrl", "Instagram"],
                  ["linkedinUrl", "LinkedIn"],
                  ["twitterUrl", "X / Twitter"],
                  ["youtubeUrl", "YouTube"],
                ].map(([field, label]) =>
                  contactSettings?.[field] ? (
                    <a
                      key={field}
                      href={contactSettings[field]}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-border bg-background px-3 py-2 text-foreground transition hover:border-primary hover:text-primary"
                    >
                      {label}
                    </a>
                  ) : null
                )}
                {![
                  contactSettings?.facebookUrl,
                  contactSettings?.instagramUrl,
                  contactSettings?.linkedinUrl,
                  contactSettings?.twitterUrl,
                  contactSettings?.youtubeUrl,
                ].some(Boolean) && (
                  <p className="text-sm text-muted-foreground">
                    Add social links in CMS to show them here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default Contact;