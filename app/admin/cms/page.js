"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../services/auth';
import api from '../../../services/api';
import { useAdminFeedback } from '../../../components/admin/AdminFeedbackProvider';
import Img from '../../../components/Img';
import Container from '../../../components/ui/Container';
import { formatUtcDateTime } from '../../../lib/date';
import {
  validateBannerForm,
  validateContactSettings,
  validateLogoForm,
  validateWebsiteSettings,
} from '../../../lib/adminValidation';
import {
  ArrowLeft,
  Image as ImageIcon,
  Link2,
  LogOut,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

const emptyBanner = {
  title: '',
  subtitle: '',
  description: '',
  button1Text: '',
  button1Url: '',
  button2Text: '',
  button2Url: '',
  desktopImage: '',
  mobileImage: '',
  tabletImage: '',
  altText: '',
  imageSeoTitle: '',
  imageCaption: '',
  imagePriority: 0,
  displayOrder: 0,
  status: 'inactive',
  publishAt: '',
  expireAt: '',
};

const emptyLogo = {
  companyName: '',
  websiteUrl: '',
  altText: '',
  logoImage: '',
  priority: 0,
  displayOrder: 0,
  status: 'inactive',
};

const emptyWebsite = {
  websiteName: '',
  logo: '',
  darkLogo: '',
  footerLogo: '',
  favicon: '',
  primaryColor: '#B99750',
  secondaryColor: '#0E1E34',
  theme: 'system',
  copyright: '',
  announcementBar: '',
  demoFormUrl: '',
  maintenanceMode: false,
};

const buildContactMapSrc = (contactSettings = {}) => {
  const latitudeRaw = String(contactSettings.latitude ?? '').trim();
  const longitudeRaw = String(contactSettings.longitude ?? '').trim();

  if (latitudeRaw && longitudeRaw) {
    const latitude = Number(latitudeRaw);
    const longitude = Number(longitudeRaw);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    }
  }

  const address = String(contactSettings.officeAddress || '').trim();
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  }

  return '';
};

const buildContactMapEmbed = (contactSettings = {}) => {
  const src = buildContactMapSrc(contactSettings);
  if (!src) return '';

  return `<iframe src="${src}" width="100%" height="420" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
};

const emptyContact = {
  officeAddress: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  supportEmail: '',
  googleMapEmbed: '',
  latitude: '',
  longitude: '',
  workingHours: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  telegramUrl: '',
  pinterestUrl: '',
  footerContactDetails: '',
  contactPageTitle: '',
  description: '',
  recipientEmail: '',
  ccEmail: '',
  bccEmail: '',
  autoReplyEnable: false,
  autoReplySubject: '',
  autoReplyTemplate: '',
  successMessage: '',
  failureMessage: '',
  spamProtection: false,
  recaptchaSiteKey: '',
  recaptchaSecretKey: '',
};

const compressImage = (file, maxWidth = 1600, quality = 0.82) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Unable to load image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const normalizedName = file.name.replace(/\.[^.]+$/, '.webp');
            resolve(new File([blob], normalizedName, { type: 'image/webp' }));
          },
          'image/webp',
          quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const AdminCmsStudio = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { notify, confirm } = useAdminFeedback();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState('banners');

  const [banners, setBanners] = useState([]);
  const [logos, setLogos] = useState([]);
  const [websiteSettings, setWebsiteSettings] = useState(emptyWebsite);
  const [contactSettings, setContactSettings] = useState(emptyContact);

  const [editingBannerId, setEditingBannerId] = useState(null);
  const [editingLogoId, setEditingLogoId] = useState(null);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [logoForm, setLogoForm] = useState(emptyLogo);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannerRes, logoRes, websiteRes, contactRes] = await Promise.all([
        api.get('/banners'),
        api.get('/logos'),
        api.get('/settings/website'),
        api.get('/settings/contact'),
      ]);

      setBanners(Array.isArray(bannerRes.data) ? bannerRes.data : []);
      setLogos(Array.isArray(logoRes.data) ? logoRes.data : []);
      setWebsiteSettings({
        ...emptyWebsite,
        ...websiteRes.data,
      });
      setContactSettings({
        ...emptyContact,
        ...contactRes.data,
      });
    } catch (err) {
      console.error('Failed to load CMS studio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const notifyFirstError = (title, errors) => {
    if (!errors.length) return false;

    notify(errors[0], {
      tone: 'error',
      title,
    });
    return true;
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const uploadAsset = async (file) => {
    const formData = new FormData();
    const compressed = await compressImage(file);
    formData.append('image', compressed);
    formData.append('folder', 'cms');

    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data.mediaItem.url;
  };

  const handleAssetUpload = async (file, onSuccess, contextLabel) => {
    if (!file) return;

    try {
      const url = await uploadAsset(file);
      onSuccess(url);
      notify(`${contextLabel} uploaded successfully.`, {
        tone: 'success',
        title: 'Upload complete',
      });
    } catch (err) {
      console.error(`Failed to upload ${contextLabel}:`, err);
      notify(err?.response?.data?.message || `Unable to upload ${contextLabel}.`, {
        tone: 'error',
        title: 'Upload failed',
      });
    }
  };

  const saveBanner = async (e) => {
    e.preventDefault();
    const validationErrors = validateBannerForm(bannerForm);
    if (notifyFirstError('Fix the banner form', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...bannerForm,
        displayOrder: Number(bannerForm.displayOrder || 0),
        imagePriority: Number(bannerForm.imagePriority || 0),
      };

      if (editingBannerId) {
        await api.put(`/banners/${editingBannerId}`, payload);
      } else {
        await api.post('/banners', payload);
      }

      setBannerForm(emptyBanner);
      setEditingBannerId(null);
      await loadData();
      notify('Banner saved successfully.', {
        tone: 'success',
        title: editingBannerId ? 'Banner updated' : 'Banner created',
      });
    } catch (err) {
      console.error('Failed to save banner:', err);
      notify(err.response?.data?.message || 'Unable to save banner.', {
        tone: 'error',
        title: 'Banner save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveLogo = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogoForm(logoForm);
    if (notifyFirstError('Fix the logo form', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...logoForm,
        priority: Number(logoForm.priority || 0),
        displayOrder: Number(logoForm.displayOrder || 0),
      };

      if (editingLogoId) {
        await api.put(`/logos/${editingLogoId}`, payload);
      } else {
        await api.post('/logos', payload);
      }

      setLogoForm(emptyLogo);
      setEditingLogoId(null);
      await loadData();
      notify('Logo saved successfully.', {
        tone: 'success',
        title: editingLogoId ? 'Logo updated' : 'Logo created',
      });
    } catch (err) {
      console.error('Failed to save logo:', err);
      notify(err.response?.data?.message || 'Unable to save logo.', {
        tone: 'error',
        title: 'Logo save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveWebsite = async (e) => {
    e.preventDefault();
    const validationErrors = validateWebsiteSettings(websiteSettings);
    if (notifyFirstError('Fix the website settings', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      await api.put('/settings/website', websiteSettings);
      await loadData();
      notify('Website settings saved successfully.', {
        tone: 'success',
        title: 'Website updated',
      });
    } catch (err) {
      console.error('Failed to save website settings:', err);
      notify(err.response?.data?.message || 'Unable to save website settings.', {
        tone: 'error',
        title: 'Website save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    const validationErrors = validateContactSettings(contactSettings);
    if (notifyFirstError('Fix the contact settings', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      const normalized = {
        ...contactSettings,
        latitude: contactSettings.latitude === '' ? null : Number(contactSettings.latitude),
        longitude: contactSettings.longitude === '' ? null : Number(contactSettings.longitude),
      };

      if (!String(normalized.googleMapEmbed || '').trim()) {
        normalized.googleMapEmbed = buildContactMapEmbed(normalized);
      }

      await api.put('/settings/contact', normalized);
      await loadData();
      notify('Contact settings saved successfully.', {
        tone: 'success',
        title: 'Contact updated',
      });
    } catch (err) {
      console.error('Failed to save contact settings:', err);
      notify(err.response?.data?.message || 'Unable to save contact settings.', {
        tone: 'error',
        title: 'Contact save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id) => {
    const confirmed = await confirm({
      title: 'Delete this banner?',
      description: 'This will permanently remove the banner from the CMS and public site.',
      confirmLabel: 'Delete banner',
      cancelLabel: 'Keep banner',
      tone: 'error',
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      await api.delete(`/banners/${id}`);
      await loadData();
      notify('Banner deleted successfully.', {
        tone: 'success',
        title: 'Banner deleted',
      });
    } catch (err) {
      console.error('Failed to delete banner:', err);
      notify(err.response?.data?.message || 'Unable to delete banner.', {
        tone: 'error',
        title: 'Delete failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLogo = async (id) => {
    const confirmed = await confirm({
      title: 'Delete this logo?',
      description: 'This will remove the logo from the partner list and CMS.',
      confirmLabel: 'Delete logo',
      cancelLabel: 'Keep logo',
      tone: 'error',
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      await api.delete(`/logos/${id}`);
      await loadData();
      notify('Logo deleted successfully.', {
        tone: 'success',
        title: 'Logo deleted',
      });
    } catch (err) {
      console.error('Failed to delete logo:', err);
      notify(err.response?.data?.message || 'Unable to delete logo.', {
        tone: 'error',
        title: 'Delete failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const reorderCollection = async (items, endpoint, targetId, direction) => {
    const index = items.findIndex((item) => item._id === targetId);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || swapIndex < 0 || swapIndex >= items.length) {
      return;
    }

    const nextItems = [...items];
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
    const ids = nextItems.map((item) => item._id);

    setSaving(true);
    try {
      await api.put(endpoint, { ids });
      await loadData();
      notify('Collection order updated.', {
        tone: 'success',
        title: 'Order saved',
      });
    } catch (err) {
      console.error('Failed to reorder collection:', err);
      notify(err.response?.data?.message || 'Unable to reorder items.', {
        tone: 'error',
        title: 'Reorder failed',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/95 backdrop-blur">
        <Container className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  CMS Studio
                </p>
                <h1 className="font-display text-2xl font-semibold">Brand, media and website controls</h1>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage hero banners, partnership logos, and the website settings that power the public site.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary"
            >
              <Sparkles className="h-4 w-4" />
              View website
            </Link>
            <Link
              href="/admin/settings/seo-analytics"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary"
            >
              <Link2 className="h-4 w-4" />
              SEO &amp; Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Banners</p>
            <p className="mt-3 text-3xl font-semibold">{banners.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Published and draft hero banners.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Logos</p>
            <p className="mt-3 text-3xl font-semibold">{logos.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Partnership logos shown across the site.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Enquiry Form</p>
            <p className="mt-3 truncate text-sm font-semibold">{websiteSettings.demoFormUrl || 'Not configured'}</p>
            <p className="mt-2 text-sm text-muted-foreground">Shown on the public contact page and mirrored in the CMS preview.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact CMS</p>
            <p className="mt-3 truncate text-sm font-semibold">{contactSettings.officeAddress || 'Not configured'}</p>
            <p className="mt-2 text-sm text-muted-foreground">Managed office details and map embed.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ['banners', 'Hero Banners'],
            ['logos', 'Partnership Logos'],
            ['website', 'Website Settings'],
            ['contact', 'Contact Settings'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActivePanel(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activePanel === key
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-surface text-foreground hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Container>

      <Container className="pb-16">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {activePanel === 'banners' && (
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={saveBanner} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {editingBannerId ? 'Edit banner' : 'Create banner'}
                      </p>
                      <h2 className="mt-1 font-display text-2xl">Hero banner controls</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerForm(emptyBanner);
                        setEditingBannerId(null);
                      }}
                      className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <input
                      required
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Banner title"
                    />
                    <input
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Subtitle"
                    />
                    <textarea
                      required
                      value={bannerForm.description}
                      onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                      rows={4}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Description"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={bannerForm.button1Text}
                        onChange={(e) => setBannerForm({ ...bannerForm, button1Text: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Button 1 text"
                      />
                      <input
                        value={bannerForm.button1Url}
                        onChange={(e) => setBannerForm({ ...bannerForm, button1Url: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Button 1 URL"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={bannerForm.button2Text}
                        onChange={(e) => setBannerForm({ ...bannerForm, button2Text: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Button 2 text"
                      />
                      <input
                        value={bannerForm.button2Url}
                        onChange={(e) => setBannerForm({ ...bannerForm, button2Url: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Button 2 URL"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ['desktopImage', 'Desktop image'],
                        ['tabletImage', 'Tablet image'],
                        ['mobileImage', 'Mobile image'],
                      ].map(([field, label]) => (
                        <label key={field} className="rounded-xl border border-dashed border-border p-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {label}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-2 block w-full text-xs"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              void handleAssetUpload(file, (url) => {
                                setBannerForm((prev) => ({ ...prev, [field]: url }));
                              }, `banner ${label}`);
                            }}
                          />
                          {bannerForm[field] && (
                            <Img
                              src={bannerForm[field]}
                              alt={label}
                              className="mt-2 h-20 w-full rounded-md border border-border object-cover"
                            />
                          )}
                        </label>
                      ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={bannerForm.altText}
                        onChange={(e) => setBannerForm({ ...bannerForm, altText: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Alt text"
                      />
                      <input
                        value={bannerForm.imageSeoTitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, imageSeoTitle: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="SEO title"
                      />
                    </div>

                    <input
                      value={bannerForm.imageCaption}
                      onChange={(e) => setBannerForm({ ...bannerForm, imageCaption: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Image caption"
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="number"
                        value={bannerForm.displayOrder}
                        onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Order"
                      />
                      <input
                        type="number"
                        value={bannerForm.imagePriority}
                        onChange={(e) => setBannerForm({ ...bannerForm, imagePriority: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Priority"
                      />
                      <select
                        value={bannerForm.status}
                        onChange={(e) => setBannerForm({ ...bannerForm, status: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="datetime-local"
                        value={bannerForm.publishAt}
                        onChange={(e) => setBannerForm({ ...bannerForm, publishAt: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={bannerForm.expireAt}
                        onChange={(e) => setBannerForm({ ...bannerForm, expireAt: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <button
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save banner'}
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {banners.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-sm text-muted-foreground">
                      No banners yet. Create one using the form on the left.
                    </div>
                  ) : (
                    banners.map((banner, index) => (
                      <article key={banner._id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="grid gap-0 md:grid-cols-[170px_1fr]">
                          <div className="bg-background">
                            {banner.desktopImage ? (
                              <Img
                                src={banner.desktopImage}
                                alt={banner.altText || banner.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full min-h-[180px] items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-7 w-7" />
                              </div>
                            )}
                          </div>

                          <div className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                                  {banner.status}
                                </p>
                                <h3 className="mt-1 font-display text-xl">{banner.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{banner.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => {
                                    setEditingBannerId(banner._id);
                                    setBannerForm({
                                      ...emptyBanner,
                                      ...banner,
                                      publishAt: banner.publishAt ? String(banner.publishAt).slice(0, 16) : '',
                                      expireAt: banner.expireAt ? String(banner.expireAt).slice(0, 16) : '',
                                    });
                                  }}
                                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => reorderCollection(banners, '/banners/reorder', banner._id, 'up')}
                                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                                >
                                  Up
                                </button>
                                <button
                                  onClick={() => reorderCollection(banners, '/banners/reorder', banner._id, 'down')}
                                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                                >
                                  Down
                                </button>
                                <button
                                  onClick={() => deleteBanner(banner._id)}
                                  className="inline-flex items-center gap-2 rounded-md border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/5"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span>Order {banner.displayOrder ?? index}</span>
                              <span>Priority {banner.imagePriority ?? 0}</span>
                              {banner.publishAt && <span>Publishes {formatUtcDateTime(banner.publishAt)}</span>}
                              {banner.expireAt && <span>Expires {formatUtcDateTime(banner.expireAt)}</span>}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {activePanel === 'logos' && (
              <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <form onSubmit={saveLogo} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="border-b border-border pb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {editingLogoId ? 'Edit logo' : 'Create logo'}
                    </p>
                    <h2 className="mt-1 font-display text-2xl">Partner logo controls</h2>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <input
                      required
                      value={logoForm.companyName}
                      onChange={(e) => setLogoForm({ ...logoForm, companyName: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Company name"
                    />
                    <input
                      value={logoForm.websiteUrl}
                      onChange={(e) => setLogoForm({ ...logoForm, websiteUrl: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Website URL"
                    />
                    <input
                      value={logoForm.altText}
                      onChange={(e) => setLogoForm({ ...logoForm, altText: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Alt text"
                    />
                    <label className="rounded-xl border border-dashed border-border p-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Logo image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-2 block w-full text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          void handleAssetUpload(file, (url) => {
                            setLogoForm((prev) => ({ ...prev, logoImage: url }));
                          }, 'logo image');
                        }}
                      />
                      {logoForm.logoImage && (
                        <Img
                          src={logoForm.logoImage}
                          alt={logoForm.altText || logoForm.companyName}
                          className="mt-2 h-24 w-full rounded-md border border-border object-contain bg-background p-2"
                        />
                      )}
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="number"
                        min={0}
                        value={logoForm.priority}
                        onChange={(e) => setLogoForm({ ...logoForm, priority: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Priority"
                      />
                      <input
                        type="number"
                        min={0}
                        value={logoForm.displayOrder}
                        onChange={(e) => setLogoForm({ ...logoForm, displayOrder: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Order"
                      />
                      <select
                        value={logoForm.status}
                        onChange={(e) => setLogoForm({ ...logoForm, status: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                      </select>
                    </div>

                    <button
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save logo'}
                    </button>
                  </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2">
                  {logos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-sm text-muted-foreground sm:col-span-2">
                      No logos yet. Upload one with the form on the left.
                    </div>
                  ) : (
                    logos.map((logo) => (
                      <article key={logo._id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                              {logo.logoImage ? (
                                <Img
                                  src={logo.logoImage}
                                  alt={logo.altText || logo.companyName}
                                  className="h-full w-full object-contain p-2"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                                {logo.status}
                              </p>
                              <h3 className="mt-1 font-display text-lg">{logo.companyName}</h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {logo.websiteUrl || 'No website URL'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setEditingLogoId(logo._id);
                              setLogoForm({ ...emptyLogo, ...logo });
                            }}
                            className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => reorderCollection(logos, '/logos/reorder', logo._id, 'up')}
                            className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                          >
                            Up
                          </button>
                          <button
                            onClick={() => reorderCollection(logos, '/logos/reorder', logo._id, 'down')}
                            className="rounded-md border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary"
                          >
                            Down
                          </button>
                          <button
                            onClick={() => deleteLogo(logo._id)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {activePanel === 'website' && (
              <form onSubmit={saveWebsite} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="border-b border-border pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Website settings</p>
                  <h2 className="mt-1 font-display text-2xl">Global website controls</h2>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <input
                    value={websiteSettings.websiteName || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, websiteName: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Website name"
                  />
                  <input
                    value={websiteSettings.copyright || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, copyright: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Copyright text"
                  />
                  <input
                    value={websiteSettings.announcementBar || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, announcementBar: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm lg:col-span-2"
                    placeholder="Announcement bar"
                  />
                  <input
                    type="url"
                    value={websiteSettings.demoFormUrl || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, demoFormUrl: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm lg:col-span-2"
                    placeholder="Enquiry form URL"
                  />

                  <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Enquiry form preview</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          This preview uses the same saved URL that the public contact page loads.
                        </p>
                      </div>
                      {websiteSettings.demoFormUrl ? (
                        <a
                          href={websiteSettings.demoFormUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium transition hover:border-primary"
                        >
                          Open form
                        </a>
                      ) : null}
                    </div>

                    {websiteSettings.demoFormUrl ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
                        <iframe
                          src={websiteSettings.demoFormUrl}
                          title="Enquiry form preview"
                          width="100%"
                          height="360"
                          className="block w-full"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                        Add an enquiry form URL to preview the embedded form here.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
                    {[
                      ['logo', 'Logo'],
                      ['darkLogo', 'Dark logo'],
                      ['footerLogo', 'Footer logo'],
                    ].map(([field, label]) => (
                      <label key={field} className="rounded-xl border border-dashed border-border p-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-2 block w-full text-xs"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            void handleAssetUpload(file, (url) => {
                              setWebsiteSettings((prev) => ({ ...prev, [field]: url }));
                            }, `${label.toLowerCase()}`);
                          }}
                        />
                        {websiteSettings[field] && (
                          <Img
                            src={websiteSettings[field]}
                            alt={label}
                            className="mt-2 h-20 w-full rounded-md border border-border object-contain bg-background p-2"
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
                    <input
                      value={websiteSettings.primaryColor || ''}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, primaryColor: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Primary color"
                    />
                    <input
                      value={websiteSettings.secondaryColor || ''}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, secondaryColor: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Secondary color"
                    />
                    <select
                      value={websiteSettings.theme || 'system'}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, theme: e.target.value })}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 lg:col-span-2">
                    <input
                      type="checkbox"
                      checked={Boolean(websiteSettings.maintenanceMode)}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, maintenanceMode: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      Maintenance mode
                    </span>
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save website settings'}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    The enquiry form URL appears on the public contact page in an iframe once saved.
                  </p>
                </div>
              </form>
            )}

            {activePanel === 'contact' && (
              <form onSubmit={saveContact} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="border-b border-border pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact settings</p>
                  <h2 className="mt-1 font-display text-2xl">Contact page content and map</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Anything you change here will show on the live contact page after refresh.
                  </p>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-3">
                    <input
                      value={contactSettings.contactPageTitle || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, contactPageTitle: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Contact page title"
                    />
                    <textarea
                      value={contactSettings.description || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Contact page description"
                    />
                    <textarea
                      value={contactSettings.officeAddress || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, officeAddress: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Office address"
                    />
                    <input
                      value={contactSettings.workingHours || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, workingHours: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Working hours"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      min={-90}
                      max={90}
                      value={contactSettings.latitude ?? ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, latitude: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      min={-180}
                      max={180}
                      value={contactSettings.longitude ?? ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, longitude: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Longitude"
                    />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={contactSettings.phoneNumber || ''}
                        onChange={(e) => setContactSettings({ ...contactSettings, phoneNumber: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Phone number"
                      />
                      <input
                        value={contactSettings.whatsappNumber || ''}
                        onChange={(e) => setContactSettings({ ...contactSettings, whatsappNumber: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="WhatsApp number"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={contactSettings.email || ''}
                        onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Primary email"
                      />
                      <input
                        value={contactSettings.supportEmail || ''}
                        onChange={(e) => setContactSettings({ ...contactSettings, supportEmail: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Support email"
                      />
                    </div>
                    <input
                      value={contactSettings.footerContactDetails || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, footerContactDetails: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Footer contact details"
                    />
                    <textarea
                      value={contactSettings.googleMapEmbed || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, googleMapEmbed: e.target.value })}
                      rows={6}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                      placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste the full Google Maps embed iframe here, or leave it blank and use address / latitude / longitude.
                    </p>
                    <div className="overflow-hidden rounded-xl border border-border bg-background">
                      {String(contactSettings.googleMapEmbed || '').trim() ? (
                        <div
                          className="w-full"
                          dangerouslySetInnerHTML={{ __html: contactSettings.googleMapEmbed }}
                        />
                      ) : buildContactMapSrc(contactSettings) ? (
                        <iframe
                          title="Contact map preview"
                          src={buildContactMapSrc(contactSettings)}
                          className="h-[320px] w-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-4 text-xs text-muted-foreground">
                          Enter an office address, latitude and longitude, or paste a Google Maps iframe to preview the map.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:col-span-2">
                    <input
                      value={contactSettings.facebookUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, facebookUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Facebook URL"
                    />
                    <input
                      value={contactSettings.instagramUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, instagramUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Instagram URL"
                    />
                    <input
                      value={contactSettings.linkedinUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, linkedinUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="LinkedIn URL"
                    />
                    <input
                      value={contactSettings.twitterUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, twitterUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="X / Twitter URL"
                    />
                    <input
                      value={contactSettings.youtubeUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, youtubeUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="YouTube URL"
                    />
                    <input
                      value={contactSettings.telegramUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, telegramUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Telegram URL"
                    />
                    <input
                      value={contactSettings.pinterestUrl || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, pinterestUrl: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Pinterest URL"
                    />
                  </div>

                  <div className="grid gap-3 lg:col-span-2 md:grid-cols-3">
                    <input
                      value={contactSettings.recipientEmail || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, recipientEmail: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Recipient email"
                    />
                    <input
                      value={contactSettings.ccEmail || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, ccEmail: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="CC email"
                    />
                    <input
                      value={contactSettings.bccEmail || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, bccEmail: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="BCC email"
                    />
                  </div>

                  <div className="grid gap-3 lg:col-span-2 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(contactSettings.autoReplyEnable)}
                        onChange={(e) => setContactSettings({ ...contactSettings, autoReplyEnable: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Enable auto reply</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(contactSettings.spamProtection)}
                        onChange={(e) => setContactSettings({ ...contactSettings, spamProtection: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Spam protection</span>
                    </label>
                  </div>

                  <div className="grid gap-3 lg:col-span-2 md:grid-cols-2">
                    <input
                      value={contactSettings.autoReplySubject || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, autoReplySubject: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Auto reply subject"
                    />
                    <input
                      value={contactSettings.recaptchaSiteKey || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, recaptchaSiteKey: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="reCAPTCHA site key"
                    />
                    <textarea
                      value={contactSettings.autoReplyTemplate || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, autoReplyTemplate: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                      placeholder="Auto reply message"
                    />
                    <input
                      value={contactSettings.recaptchaSecretKey || ''}
                      onChange={(e) => setContactSettings({ ...contactSettings, recaptchaSecretKey: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                      placeholder="reCAPTCHA secret key"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save contact settings'}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Contact details, map, and links on the public contact page are all driven from this panel.
                  </p>
                </div>
              </form>
            )}
          </>
        )}
      </Container>
    </main>
  );
};

export default AdminCmsStudio;
