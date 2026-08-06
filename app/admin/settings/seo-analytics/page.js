"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Globe2,
  Loader2,
  Mail,
  Phone,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import api from '../../../../services/api';
import { useAuth } from '../../../../services/auth';
import { useAdminFeedback } from '../../../../components/admin/AdminFeedbackProvider';
import Container from '../../../../components/ui/Container';

const emptySettings = {
  siteName: '',
  siteUrl: '',
  siteDescription: '',
  siteKeywords: '',
  siteLogo: '',
  favicon: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  yandexSiteVerification: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  microsoftClarityId: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  supportEmail: '',
  supportPhone: '',
};

const normalizeLoadedSettings = (settings = {}) => ({
  ...emptySettings,
  ...settings,
  siteUrl: String(settings.siteUrl || '').replace(/\/+$/, ''),
  siteKeywords: Array.isArray(settings.siteKeywords)
    ? settings.siteKeywords.join(', ')
    : String(settings.siteKeywords || ''),
  siteLogo: String(settings.siteLogo || ''),
  favicon: String(settings.favicon || ''),
  googleSiteVerification: String(settings.googleSiteVerification || ''),
  bingSiteVerification: String(settings.bingSiteVerification || ''),
  yandexSiteVerification: String(settings.yandexSiteVerification || ''),
  googleAnalyticsId: String(settings.googleAnalyticsId || ''),
  googleTagManagerId: String(settings.googleTagManagerId || ''),
  facebookPixelId: String(settings.facebookPixelId || ''),
  microsoftClarityId: String(settings.microsoftClarityId || ''),
  facebookUrl: String(settings.facebookUrl || ''),
  instagramUrl: String(settings.instagramUrl || ''),
  linkedinUrl: String(settings.linkedinUrl || ''),
  twitterUrl: String(settings.twitterUrl || ''),
  youtubeUrl: String(settings.youtubeUrl || ''),
  supportEmail: String(settings.supportEmail || ''),
  supportPhone: String(settings.supportPhone || ''),
});

const SectionCard = ({ icon: Icon, eyebrow, title, description, children }) => (
  <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
    <div className="flex items-start gap-3 border-b border-border pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="mt-5 space-y-4">{children}</div>
  </section>
);

const Field = ({
  id,
  label,
  register,
  errors,
  placeholder,
  type = 'text',
  disabled = false,
  helpText,
  multiline = false,
  rules = {},
  className = '',
}) => {
  const inputClassName =
    'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <label htmlFor={id} className={`block space-y-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClassName}
          {...register(id, rules)}
        />
      ) : (
        <input
          id={id}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClassName}
          {...register(id, rules)}
        />
      )}
      {helpText ? <p className="text-[11px] leading-relaxed text-muted-foreground">{helpText}</p> : null}
      {errors?.[id] ? <p className="text-xs font-medium text-red-500">{errors[id].message}</p> : null}
    </label>
  );
};

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-3xl border border-border bg-surface" />
      ))}
    </div>
    {[...Array(4)].map((_, index) => (
      <div key={index} className="h-80 animate-pulse rounded-3xl border border-border bg-surface" />
    ))}
  </div>
);

export default function SeoAnalyticsSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { notify } = useAdminFeedback();
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const canEdit = user?.role === 'super_admin';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: emptySettings,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      setLoading(true);
      setSaveError('');

      try {
        const response = await api.get('/settings');
        if (!mounted) return;

        reset(normalizeLoadedSettings(response.data));
      } catch (err) {
        if (!mounted) return;
        const message = err?.response?.data?.message || 'Unable to load site settings.';
        setSaveError(message);
        notify(message, { tone: 'error', title: 'Load failed' });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      loadSettings();
    }

    return () => {
      mounted = false;
    };
  }, [notify, reset, user]);

  const onSubmit = async (formValues) => {
    setSaveError('');

    try {
      const payload = {
        ...formValues,
        siteKeywords: String(formValues.siteKeywords || '')
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      };

      const response = await api.put('/settings', payload);
      reset(normalizeLoadedSettings(response.data));
      notify('SEO and analytics settings saved successfully.', {
        tone: 'success',
        title: 'Settings updated',
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        'Unable to save site settings.';
      setSaveError(message);
      notify(message, { tone: 'error', title: 'Save failed' });
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is the standard API for reactive field access
  const values = watch();
  const analyticsEnabled = Boolean(values.googleAnalyticsId || values.googleTagManagerId);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/90 backdrop-blur">
        <Container className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background transition hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Settings</p>
              <h1 className="font-display text-3xl font-semibold">SEO &amp; Analytics</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Manage the public site identity, verification tags, analytics IDs, social links, and support contacts from one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary"
            >
              <Sparkles className="h-4 w-4" />
              Open website
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              {canEdit ? 'Super admin editor' : 'Read only'}
            </span>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Site</p>
            <p className="mt-3 text-xl font-semibold">{values.siteName || 'Not set'}</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{values.siteUrl || 'No URL configured'}</p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Analytics</p>
            <p className="mt-3 text-xl font-semibold">{analyticsEnabled ? 'Enabled' : 'Not configured'}</p>
            <p className="mt-1 text-sm text-muted-foreground">Google Analytics and Tag Manager are injected automatically.</p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Support</p>
            <p className="mt-3 text-xl font-semibold">{values.supportEmail || 'Not set'}</p>
            <p className="mt-1 text-sm text-muted-foreground">{values.supportPhone || 'No phone configured'}</p>
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        {loading ? (
          <SettingsSkeleton />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {saveError ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{saveError}</p>
              </div>
            ) : null}

            {!canEdit ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Only super admins can save changes on this page. You can review the current configuration, but the form is read-only.</p>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard
                icon={Globe2}
                eyebrow="General"
                title="Site identity"
                description="These values power the site title, canonical URL, keywords, description, and favicon."
              >
                <Field
                  id="siteName"
                  label="Site name"
                  register={register}
                  errors={errors}
                  placeholder="Cornerstone"
                  disabled={!canEdit}
                  rules={{ required: 'Site name is required.' }}
                />
                <Field
                  id="siteUrl"
                  label="Site URL"
                  register={register}
                  errors={errors}
                  placeholder="https://www.example.com"
                  disabled={!canEdit}
                  rules={{
                    required: 'Site URL is required.',
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Site URL must be a valid http(s) URL.',
                    },
                  }}
                  helpText="Use the live canonical domain for the website."
                />
                <Field
                  id="siteDescription"
                  label="Site description"
                  register={register}
                  errors={errors}
                  placeholder="Short brand and positioning summary"
                  multiline
                  disabled={!canEdit}
                  rules={{ required: 'Site description is required.' }}
                />
                <Field
                  id="siteKeywords"
                  label="Site keywords"
                  register={register}
                  errors={errors}
                  placeholder="education, international pathway college, study abroad"
                  disabled={!canEdit}
                  helpText="Comma-separated keywords used in metadata."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="siteLogo"
                    label="Site logo"
                    register={register}
                    errors={errors}
                    placeholder="/assets/logo.svg"
                    disabled={!canEdit}
                    helpText="Use a relative path or a full https URL."
                  />
                  <Field
                    id="favicon"
                    label="Favicon"
                    register={register}
                    errors={errors}
                    placeholder="/favicon.ico"
                    disabled={!canEdit}
                    helpText="Use a relative path or a full https URL."
                  />
                </div>
              </SectionCard>

              <SectionCard
                icon={BadgeCheck}
                eyebrow="Verification"
                title="Search engine verification"
                description="Add verification codes for Google, Bing, and Yandex."
              >
                <Field
                  id="googleSiteVerification"
                  label="Google site verification"
                  register={register}
                  errors={errors}
                  placeholder="Google verification token"
                  disabled={!canEdit}
                />
                <Field
                  id="bingSiteVerification"
                  label="Bing site verification"
                  register={register}
                  errors={errors}
                  placeholder="Bing verification token"
                  disabled={!canEdit}
                />
                <Field
                  id="yandexSiteVerification"
                  label="Yandex site verification"
                  register={register}
                  errors={errors}
                  placeholder="Yandex verification token"
                  disabled={!canEdit}
                />
              </SectionCard>

              <SectionCard
                icon={BarChart3}
                eyebrow="Analytics"
                title="Tracking IDs"
                description="Google Analytics and Google Tag Manager load automatically when these values are set."
              >
                <Field
                  id="googleAnalyticsId"
                  label="Google Analytics ID"
                  register={register}
                  errors={errors}
                  placeholder="G-XXXXXXXXXX"
                  disabled={!canEdit}
                  rules={{
                    pattern: {
                      value: /^G-[A-Z0-9]{10}$/i,
                      message: 'Google Analytics ID must match G-XXXXXXXXXX.',
                    },
                  }}
                  helpText="Format: G-XXXXXXXXXX"
                />
                <Field
                  id="googleTagManagerId"
                  label="Google Tag Manager ID"
                  register={register}
                  errors={errors}
                  placeholder="GTM-XXXXXXX"
                  disabled={!canEdit}
                  rules={{
                    pattern: {
                      value: /^GTM-[A-Z0-9]{7}$/i,
                      message: 'Google Tag Manager ID must match GTM-XXXXXXX.',
                    },
                  }}
                  helpText="Format: GTM-XXXXXXX"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="facebookPixelId"
                    label="Facebook Pixel ID"
                    register={register}
                    errors={errors}
                    placeholder="Optional"
                    disabled={!canEdit}
                    helpText="Optional but validated when filled."
                  />
                  <Field
                    id="microsoftClarityId"
                    label="Microsoft Clarity ID"
                    register={register}
                    errors={errors}
                    placeholder="Optional"
                    disabled={!canEdit}
                    helpText="Optional but validated when filled."
                  />
                </div>
              </SectionCard>

              <SectionCard
                icon={Share2}
                eyebrow="Social"
                title="Social links"
                description="These links can be used in the site footer, share cards, or connected platforms."
              >
                <Field
                  id="facebookUrl"
                  label="Facebook URL"
                  register={register}
                  errors={errors}
                  placeholder="https://facebook.com/..."
                  disabled={!canEdit}
                />
                <Field
                  id="instagramUrl"
                  label="Instagram URL"
                  register={register}
                  errors={errors}
                  placeholder="https://instagram.com/..."
                  disabled={!canEdit}
                />
                <Field
                  id="linkedinUrl"
                  label="LinkedIn URL"
                  register={register}
                  errors={errors}
                  placeholder="https://linkedin.com/company/..."
                  disabled={!canEdit}
                />
                <Field
                  id="twitterUrl"
                  label="Twitter / X URL"
                  register={register}
                  errors={errors}
                  placeholder="https://x.com/..."
                  disabled={!canEdit}
                />
                <Field
                  id="youtubeUrl"
                  label="YouTube URL"
                  register={register}
                  errors={errors}
                  placeholder="https://youtube.com/@..."
                  disabled={!canEdit}
                />
              </SectionCard>
            </div>

            <SectionCard
              icon={Mail}
              eyebrow="Contact"
              title="Support contacts"
              description="These values power contact links and support references across the public site."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="supportEmail"
                  label="Support email"
                  register={register}
                  errors={errors}
                  placeholder="support@example.com"
                  disabled={!canEdit}
                  rules={{
                    required: 'Support email is required.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Support email must be valid.',
                    },
                  }}
                />
                <Field
                  id="supportPhone"
                  label="Support phone"
                  register={register}
                  errors={errors}
                  placeholder="+91 98765 43210"
                  disabled={!canEdit}
                  rules={{
                    required: 'Support phone is required.',
                    pattern: {
                      value: /^[+()\-.\s0-9]{7,20}$/,
                      message: 'Support phone must be valid.',
                    },
                  }}
                />
              </div>
              <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{values.supportPhone || 'Support phone will appear here.'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{values.supportEmail || 'Support email will appear here.'}</span>
                </div>
              </div>
            </SectionCard>

            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Saved settings are applied immediately.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sitemap, robots, metadata, verification tags, and analytics scripts all read from this document.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={!canEdit || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </form>
        )}
      </Container>
    </main>
  );
}
