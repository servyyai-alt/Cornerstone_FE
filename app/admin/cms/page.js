"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../services/auth';
import api from '../../../services/api';
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
  primaryColor: '#E8B543',
  secondaryColor: '#0E1E34',
  theme: 'system',
  copyright: '',
  announcementBar: '',
  demoFormUrl: '',
  maintenanceMode: false,
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState('banners');

  const [banners, setBanners] = useState([]);
  const [logos, setLogos] = useState([]);
  const [websiteSettings, setWebsiteSettings] = useState(emptyWebsite);

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
      const [bannerRes, logoRes, websiteRes] = await Promise.all([
        api.get('/banners'),
        api.get('/logos'),
        api.get('/settings/website'),
      ]);

      setBanners(Array.isArray(bannerRes.data) ? bannerRes.data : []);
      setLogos(Array.isArray(logoRes.data) ? logoRes.data : []);
      setWebsiteSettings({
        ...emptyWebsite,
        ...websiteRes.data,
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

  const saveBanner = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error('Failed to save banner:', err);
      alert(err.response?.data?.message || 'Unable to save banner');
    } finally {
      setSaving(false);
    }
  };

  const saveLogo = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error('Failed to save logo:', err);
      alert(err.response?.data?.message || 'Unable to save logo');
    } finally {
      setSaving(false);
    }
  };

  const saveWebsite = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/website', websiteSettings);
      await loadData();
      alert('Website settings saved');
    } catch (err) {
      console.error('Failed to save website settings:', err);
      alert(err.response?.data?.message || 'Unable to save website settings');
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    setSaving(true);
    try {
      await api.delete(`/banners/${id}`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete banner:', err);
      alert(err.response?.data?.message || 'Unable to delete banner');
    } finally {
      setSaving(false);
    }
  };

  const deleteLogo = async (id) => {
    if (!window.confirm('Delete this logo?')) return;
    setSaving(true);
    try {
      await api.delete(`/logos/${id}`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete logo:', err);
      alert(err.response?.data?.message || 'Unable to delete logo');
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
    } catch (err) {
      console.error('Failed to reorder collection:', err);
      alert(err.response?.data?.message || 'Unable to reorder items');
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
        <div className="container-prose flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
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
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="container-prose py-8">
        <div className="grid gap-4 md:grid-cols-3">
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Demo Form</p>
            <p className="mt-3 truncate text-sm font-semibold">{websiteSettings.demoFormUrl || 'Not configured'}</p>
            <p className="mt-2 text-sm text-muted-foreground">Displayed on the public contact page in an iframe.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ['banners', 'Hero Banners'],
            ['logos', 'Partnership Logos'],
            ['website', 'Website Settings'],
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
      </section>

      <section className="container-prose pb-16">
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
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadAsset(file);
                              setBannerForm((prev) => ({ ...prev, [field]: url }));
                            }}
                          />
                          {bannerForm[field] && (
                            <img
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
                              <img
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
                              {banner.publishAt && <span>Publishes {new Date(banner.publishAt).toLocaleString()}</span>}
                              {banner.expireAt && <span>Expires {new Date(banner.expireAt).toLocaleString()}</span>}
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
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadAsset(file);
                          setLogoForm((prev) => ({ ...prev, logoImage: url }));
                        }}
                      />
                      {logoForm.logoImage && (
                        <img
                          src={logoForm.logoImage}
                          alt={logoForm.altText || logoForm.companyName}
                          className="mt-2 h-24 w-full rounded-md border border-border object-contain bg-background p-2"
                        />
                      )}
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="number"
                        value={logoForm.priority}
                        onChange={(e) => setLogoForm({ ...logoForm, priority: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Priority"
                      />
                      <input
                        type="number"
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
                                <img
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
                    value={websiteSettings.demoFormUrl || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, demoFormUrl: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm lg:col-span-2"
                    placeholder="Demo form URL"
                  />

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
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadAsset(file);
                            setWebsiteSettings((prev) => ({ ...prev, [field]: url }));
                          }}
                        />
                        {websiteSettings[field] && (
                          <img
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
                    The demo form URL appears on the public contact page in an iframe once saved.
                  </p>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default AdminCmsStudio;
