"use client";

import React, { useDeferredValue, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../services/auth';
import api from '../../../services/api';
import AdminDialog from '../../../components/admin/AdminDialog';
import Img from '../../../components/Img';
import { useAdminFeedback } from '../../../components/admin/AdminFeedbackProvider';
import { formatUtcDateTime } from '../../../lib/date';
import {
  validatePageDraft,
  validateStoryForm,
  validateUniversityForm,
  validateBannerForm,
  validateLogoForm,
  validateWebsiteSettings,
  validateContactSettings as validateContactSettingsForm,
  validateSiteSettingsForm,
  isValidHttpUrl,
} from '../../../lib/adminValidation';
import {
  Inbox, FileText, GraduationCap, Sparkles, LogOut,
  Trash2, Edit, Plus, Check, RefreshCw, Upload, Eye, Settings,
  LayoutDashboard, Image as ImageIcon, MessageSquare, Phone, Share2, Clipboard, Globe, ExternalLink, HelpCircle,
  ArrowUp, ArrowDown, MoreVertical, Copy, Search, AlertCircle, Calendar, ChevronUp, ChevronDown, BookOpen, ShieldCheck
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const createEmptySection = () => ({
  sectionId: 'intro',
  sectionKey: 'intro',
  sectionName: 'Intro',
  sectionType: 'CUSTOM',
  title: '',
  heading: '',
  subtitle: '',
  subHeading: '',
  content: '',
  description: '',
  image: '',
  backgroundImage: '',
  alignment: 'left',
  displayMode: 'default',
  sortOrder: 0,
  isVisible: true,
  isActive: true,
  settings: {},
  config: {},
  items: [],
});

const normalizeSection = (section) => {
  if (!section) return section;
  return section;
};

const titleizeSlug = (slug = '') =>
  slug
    .toString()
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || 'Untitled Page';

const slugifyPage = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildPageDraft = (slug) => {
  return {
    slug,
    title: titleizeSlug(slug),
    internalName: titleizeSlug(slug),
    description: '',
    metaDescription: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    status: 'draft',
    sections: [createEmptySection()],
  };
};

const normalizePageDraft = (page, slug) => {
  const fallback = buildPageDraft(slug);

  return {
    ...fallback,
    ...page,
    slug: page?.slug || slug,
    title: page?.title || fallback.title,
    internalName: page?.internalName || fallback.internalName,
    description: page?.description || fallback.description,
    metaDescription: page?.metaDescription || fallback.metaDescription,
    seoTitle: page?.seoTitle || page?.metaTitle || fallback.seoTitle,
    seoDescription: page?.seoDescription || page?.metaDescription || fallback.seoDescription,
    seoKeywords: Array.isArray(page?.seoKeywords) ? page.seoKeywords.join(', ') : (page?.seoKeywords || page?.metaKeywords || fallback.seoKeywords),
    canonicalUrl: page?.canonicalUrl || fallback.canonicalUrl,
    ogTitle: page?.ogTitle || fallback.ogTitle,
    ogDescription: page?.ogDescription || fallback.ogDescription,
    ogImage: page?.ogImage || fallback.ogImage,
    status: page?.status || fallback.status,
    sections: Array.isArray(page?.sections) && page.sections.length > 0
      ? page.sections.map(normalizeSection)
      : fallback.sections,
  };
};

const inquiryTypeLabel = {
  contact: 'Contact',
  consultation: 'Consultation',
  pathway: 'Pathway',
  accessibility: 'Accessibility',
  eligibility: 'Eligibility',
};

const inquiryStatusLabel = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived',
};

// Initial empty states for CMS models
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

const emptySiteSettings = {
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
  chatbotUrl: '',
  chatbotEnabled: false,
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

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { notify, confirm } = useAdminFeedback();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Core CMS Data states
  const [inquiries, setInquiries] = useState([]);
  const [pages, setPages] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [stories, setStories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  
  // CMS Studio & SEO settings states
  const [banners, setBanners] = useState([]);
  const [logos, setLogos] = useState([]);
  const [websiteSettings, setWebsiteSettings] = useState(emptyWebsite);
  const [contactSettings, setContactSettings] = useState(emptyContact);
  const [siteSettings, setSiteSettings] = useState(emptySiteSettings);
  const [mediaItems, setMediaItems] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Editing States
  const [editingPage, setEditingPage] = useState(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState(null);
  const [newPageForm, setNewPageForm] = useState({ slug: '', title: '' });
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Visual CMS and Section Editor states
  const [pageSearch, setPageSearch] = useState('');
  const [pageFilter, setPageFilter] = useState('all');
  const [editingSectionIdx, setEditingSectionIdx] = useState(null);
  const [editingCardIdx, setEditingCardIdx] = useState(null);
  const [editingCardItem, setEditingCardItem] = useState(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [isPageDirty, setIsPageDirty] = useState(false);
  const [originalPageData, setOriginalPageData] = useState('');

  // University Form states
  const [uniFormOpen, setUniFormOpen] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [uniForm, setUniForm] = useState({
    name: '', city: '', country: 'United Kingdom', subjects: '', 
    pathway: 'BTEC HND', transferYear: 'Year 2 or 3', 
    awardingBody: 'Pearson', costLakhsMin: 45, costLakhsMax: 60, emiMonthly: 40000,
    description: ''
  });

  // Success Story Form states
  const [storyFormOpen, setStoryFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyForm, setStoryForm] = useState({
    initials: '', startPoint: '', pathway: '', destination: '', outcome: ''
  });

  // CMS Sub-forms states
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [editingLogoId, setEditingLogoId] = useState(null);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [logoForm, setLogoForm] = useState(emptyLogo);

  // Chatbot states
  const [chatbotUrlInput, setChatbotUrlInput] = useState('');
  const [chatbotEnabledInput, setChatbotEnabledInput] = useState(false);
  const [chatbotSaveSuccess, setChatbotSaveSuccess] = useState('');
  const [chatbotSaveError, setChatbotSaveError] = useState('');
  const [previewChatbotOpen, setPreviewChatbotOpen] = useState(false);

  // Media states
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaUploadFile, setMediaUploadFile] = useState(null);
  const [mediaItemsLoading, setMediaItemsLoading] = useState(false);

  // Deep linking for navigation compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && [
        'dashboard', 'inquiries', 'homepage', 'pages', 
        'services', 'media', 'chatbot', 'contact', 'settings'
      ].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const closeUniversityModal = () => {
    setUniFormOpen(false);
    setEditingUni(null);
  };

  const closeStoryModal = () => {
    setStoryFormOpen(false);
    setEditingStory(null);
  };

  const notifyFirstError = (title, errors) => {
    if (errors.length === 0) {
      return false;
    }
    notify(errors[0], { tone: 'error', title });
    return true;
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // Fetch all dashboard and settings data
  const loadBaseData = async () => {
    setLoading(true);
    setPagesLoading(true);
    try {
      const [
        inqRes, pagesRes, uniRes, storyRes, destRes, 
        bannerRes, logoRes, websiteRes, contactRes, siteRes, mediaRes
      ] = await Promise.allSettled([
        api.get('/inquiries'),
        api.get('/pages'),
        api.get('/universities'),
        api.get('/success-stories'),
        api.get('/destinations'),
        api.get('/banners'),
        api.get('/logos'),
        api.get('/settings/website'),
        api.get('/settings/contact'),
        api.get('/settings'),
        api.get('/media?limit=60')
      ]);

      if (inqRes.status === 'fulfilled') {
        setInquiries(Array.isArray(inqRes.value.data) ? inqRes.value.data : []);
      }
      if (pagesRes.status === 'fulfilled') {
        setPages(Array.isArray(pagesRes.value.data) ? pagesRes.value.data : []);
      }
      if (uniRes.status === 'fulfilled') {
        setUniversities(Array.isArray(uniRes.value.data) ? uniRes.value.data : []);
      }
      if (storyRes.status === 'fulfilled') {
        setStories(Array.isArray(storyRes.value.data) ? storyRes.value.data : []);
      }
      if (destRes.status === 'fulfilled') {
        setDestinations(Array.isArray(destRes.value.data) ? destRes.value.data : []);
      }
      if (bannerRes.status === 'fulfilled') {
        setBanners(Array.isArray(bannerRes.value.data) ? bannerRes.value.data : []);
      }
      if (logoRes.status === 'fulfilled') {
        setLogos(Array.isArray(logoRes.value.data) ? logoRes.value.data : []);
      }
      if (websiteRes.status === 'fulfilled') {
        setWebsiteSettings({ ...emptyWebsite, ...websiteRes.value.data });
      }
      if (contactRes.status === 'fulfilled') {
        setContactSettings({ ...emptyContact, ...contactRes.value.data });
      }
      if (siteRes.status === 'fulfilled') {
        const loadedSettings = siteRes.value.data || {};
        setSiteSettings(loadedSettings);
        setChatbotUrlInput(loadedSettings.chatbotUrl || '');
        setChatbotEnabledInput(!!loadedSettings.chatbotEnabled);
      }
      if (mediaRes.status === 'fulfilled') {
        setMediaItems(Array.isArray(mediaRes.value.data?.items) ? mediaRes.value.data.items : []);
      }
    } catch (err) {
      console.error('Error fetching dashboard datasets:', err);
    } finally {
      setLoading(false);
      setPagesLoading(false);
    }
  };

  const loadPages = async () => {
    setPagesLoading(true);
    try {
      const pageRes = await api.get('/pages');
      setPages(Array.isArray(pageRes.data) ? pageRes.data : []);
    } catch (err) {
      console.error('Error fetching page list:', err);
    } finally {
      setPagesLoading(false);
    }
  };

  const loadMediaItems = async () => {
    setMediaItemsLoading(true);
    try {
      const res = await api.get('/media?limit=60');
      setMediaItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (err) {
      console.error('Error loading media list:', err);
    } finally {
      setMediaItemsLoading(false);
    }
  };

  const loadPageContent = async (slug) => {
    if (!slug) return;
    setPageLoading(true);
    try {
      const pageRes = await api.get(`/pages/${slug}`);
      const normalized = normalizePageDraft(pageRes.data, slug);
      setEditingPage(normalized);
      setOriginalPageData(JSON.stringify(normalized));
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = buildPageDraft(slug);
        setEditingPage(fallback);
        setOriginalPageData(JSON.stringify(fallback));
      } else {
        console.error(`Error fetching page content for ${slug}:`, err);
        setEditingPage(null);
        setOriginalPageData('');
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBaseData();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedPageSlug) {
      loadPageContent(selectedPageSlug);
    } else {
      setEditingPage(null);
      setOriginalPageData('');
      setPageLoading(false);
    }
  }, [user, selectedPageSlug]);

  // Calculate page dirty state dynamically
  useEffect(() => {
    if (editingPage && originalPageData) {
      setIsPageDirty(JSON.stringify(editingPage) !== originalPageData);
    } else {
      setIsPageDirty(false);
    }
  }, [editingPage, originalPageData]);

  // Window unload guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPageDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to discard them and leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPageDirty]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleTabChange = (newTab, options = {}) => {
    const switchTab = () => {
      startTransition(() => {
        setActiveTab(newTab);
        if (options.onSwitch) {
          options.onSwitch();
        }
      });
    };

    if (activeTab === 'pages' && isPageDirty) {
      confirm({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes in the Page Editor. If you leave now, these changes will be lost.',
        confirmLabel: 'Discard & Leave',
        cancelLabel: 'Keep Editing',
        tone: 'error',
      }).then((agreed) => {
        if (agreed) {
          setIsPageDirty(false);
          setOriginalPageData('');
          setSelectedPageSlug(null);
          switchTab();
        }
      });
    } else {
      switchTab();
    }
  };

  // Inquiry actions
  const markInquiryStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      setInquiries((prev) => prev.map((i) => (i._id === id ? { ...i, status } : i)));
      setSelectedInquiry((current) => (current?._id === id ? { ...current, status } : current));
      notify(`Lead marked as ${status}.`, { tone: 'success', title: 'Lead updated' });
    } catch (err) {
      console.error('Error updating status:', err);
      notify(err.response?.data?.message || 'Unable to update lead status.', { tone: 'error', title: 'Status update failed' });
    }
  };

  const deleteInquiry = async (id) => {
    const confirmed = await confirm({
      title: 'Delete this inquiry?',
      description: 'This will permanently remove the lead from the inbox and cannot be undone.',
      confirmLabel: 'Delete lead',
      cancelLabel: 'Keep lead',
      tone: 'error',
    });

    if (!confirmed) return;

    try {
      await api.delete(`/inquiries/${id}`);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      setSelectedInquiry((current) => (current?._id === id ? null : current));
      notify('The inquiry was deleted successfully.', { tone: 'success', title: 'Lead deleted' });
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      notify(err.response?.data?.message || 'Unable to delete this inquiry.', { tone: 'error', title: 'Delete failed' });
    }
  };

  // University CRUD
  const saveUniversity = async (e) => {
    e.preventDefault();
    const validationErrors = validateUniversityForm(uniForm);
    if (notifyFirstError('Fix the university form', validationErrors)) {
      return;
    }

    const data = {
      ...uniForm,
      subjects: typeof uniForm.subjects === 'string' ? uniForm.subjects.split(',').map(s => s.trim()) : uniForm.subjects
    };

    try {
      if (editingUni) {
        const res = await api.put(`/universities/${editingUni._id}`, data);
        setUniversities((prev) => prev.map((u) => (u._id === editingUni._id ? res.data.university : u)));
      } else {
        const res = await api.post('/universities', data);
        setUniversities((prev) => [...prev, res.data.university]);
      }
      closeUniversityModal();
      notify('University saved successfully.', {
        tone: 'success',
        title: editingUni ? 'University updated' : 'University created',
      });
    } catch (err) {
      console.error('Error saving university:', err);
      notify(err.response?.data?.message || 'Unable to save university.', { tone: 'error', title: 'University save failed' });
    }
  };

  const deleteUniversity = async (id) => {
    const confirmed = await confirm({
      title: 'Delete this university?',
      description: 'The university entry will be removed from the explorer and CMS list.',
      confirmLabel: 'Delete university',
      cancelLabel: 'Keep university',
      tone: 'error',
    });

    if (!confirmed) return;

    try {
      await api.delete(`/universities/${id}`);
      setUniversities((prev) => prev.filter((u) => u._id !== id));
      notify('University deleted successfully.', { tone: 'success', title: 'University deleted' });
    } catch (err) {
      console.error('Error deleting university:', err);
      notify(err.response?.data?.message || 'Unable to delete university.', { tone: 'error', title: 'Delete failed' });
    }
  };

  // Success Story CRUD
  const saveStory = async (e) => {
    e.preventDefault();
    const validationErrors = validateStoryForm(storyForm);
    if (notifyFirstError('Fix the story form', validationErrors)) {
      return;
    }

    try {
      if (editingStory) {
        const res = await api.put(`/success-stories/${editingStory._id}`, storyForm);
        setStories((prev) => prev.map((s) => (s._id === editingStory._id ? res.data.story : s)));
      } else {
        const res = await api.post('/success-stories', storyForm);
        setStories((prev) => [...prev, res.data.story]);
      }
      closeStoryModal();
      notify('Student journey saved successfully.', {
        tone: 'success',
        title: editingStory ? 'Story updated' : 'Story created',
      });
    } catch (err) {
      console.error('Error saving success story:', err);
      notify(err.response?.data?.message || 'Unable to save success story.', { tone: 'error', title: 'Story save failed' });
    }
  };

  const deleteStory = async (id) => {
    const confirmed = await confirm({
      title: 'Delete this success story?',
      description: 'This story will be removed from the public success page and CMS.',
      confirmLabel: 'Delete story',
      cancelLabel: 'Keep story',
      tone: 'error',
    });

    if (!confirmed) return;

    try {
      await api.delete(`/success-stories/${id}`);
      setStories((prev) => prev.filter((s) => s._id !== id));
      notify('Success story deleted successfully.', { tone: 'success', title: 'Story deleted' });
    } catch (err) {
      console.error('Error deleting success story:', err);
      notify(err.response?.data?.message || 'Unable to delete success story.', { tone: 'error', title: 'Delete failed' });
    }
  };

  // Page Editor Handlers
  const handlePageFieldChange = (field, value) => {
    setEditingPage((current) => (current ? { ...current, [field]: value } : current));
  };

  const handlePageSectionChange = (sectionIdx, field, value) => {
    setEditingPage((current) => {
      if (!current) return current;
      const updatedSections = [...(current.sections || [])];
      updatedSections[sectionIdx] = {
        ...updatedSections[sectionIdx],
        [field]: value,
      };
      return { ...current, sections: updatedSections };
    });
  };

  const handlePageItemChange = (sectionIdx, itemIdx, field, value) => {
    setEditingPage((current) => {
      if (!current) return current;
      const updatedSections = [...(current.sections || [])];
      const updatedItems = [...(updatedSections[sectionIdx]?.items || [])];
      updatedItems[itemIdx] = {
        ...updatedItems[itemIdx],
        [field]: value,
      };
      updatedSections[sectionIdx] = {
        ...updatedSections[sectionIdx],
        items: updatedItems,
      };
      return { ...current, sections: updatedSections };
    });
  };

  const addPageSection = () => {
    setEditingPage((current) => {
      if (!current) return current;
      const sections = [...(current.sections || [])];
      const nextIndex = sections.length + 1;
      sections.push({
        sectionId: `section-${nextIndex}`,
        sectionName: `Section ${nextIndex}`,
        title: '',
        subtitle: '',
        description: '',
        content: '',
        image: '',
        isVisible: true,
        items: [],
      });
      return { ...current, sections };
    });
  };

  const removePageSection = (sectionIdx) => {
    confirm({
      title: 'Remove this section?',
      description: 'This section will be removed from the draft. You can add it again later.',
      confirmLabel: 'Remove section',
      cancelLabel: 'Keep section',
      tone: 'error',
    }).then((confirmed) => {
      if (!confirmed) return;

      setEditingPage((current) => {
        if (!current) return current;
        const sections = [...(current.sections || [])];
        sections.splice(sectionIdx, 1);
        return { ...current, sections };
      });
      notify('Section removed from the page draft.', { tone: 'success', title: 'Section removed' });
    });
  };

  const handleImageUpload = async (sectionIdx, itemIdx = null, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data.url;

      if (itemIdx === null) {
        handlePageSectionChange(sectionIdx, 'image', fileUrl);
      } else {
        handlePageItemChange(sectionIdx, itemIdx, 'image', fileUrl);
      }
      notify('Image uploaded successfully.', { tone: 'success', title: 'Upload complete' });
    } catch (err) {
      console.error('Upload failed:', err);
      notify(err.response?.data?.message || 'Upload failed. Please try again.', { tone: 'error', title: 'Upload failed' });
    }
  };

  const savePageContent = async (nextStatus = null) => {
    if (!editingPage) return;

    const validationErrors = validatePageDraft(editingPage);
    if (notifyFirstError('Fix the page draft', validationErrors)) {
      return;
    }

    try {
      const payload = {
        ...editingPage,
        title: editingPage.title || titleizeSlug(selectedPageSlug),
        status: nextStatus || editingPage.status || 'draft',
        seoKeywords: Array.isArray(editingPage.seoKeywords)
          ? editingPage.seoKeywords
          : String(editingPage.seoKeywords || '')
              .split(',')
              .map((keyword) => keyword.trim())
              .filter(Boolean),
      };

      if (nextStatus === 'published') {
        await api.post(`/pages/${selectedPageSlug}/publish`, payload);
      } else if (nextStatus === 'draft' && editingPage.status === 'published') {
        await api.post(`/pages/${selectedPageSlug}/unpublish`, payload);
      } else {
        await api.put(`/pages/${selectedPageSlug}`, payload);
      }

      const updatedData = { ...payload, status: nextStatus || payload.status };
      setOriginalPageData(JSON.stringify(updatedData));
      setEditingPage(updatedData);

      await refreshPageContent();
      notify('Page content updated successfully.', {
        tone: 'success',
        title: nextStatus === 'published' ? 'Page published' : 'Page saved',
      });
    } catch (err) {
      console.error('Error saving page changes:', err);
      notify(err.response?.data?.message || 'Failed to save page changes.', { tone: 'error', title: 'Page save failed' });
    }
  };

  const createNewPage = async () => {
    const slug = slugifyPage(newPageForm.slug || newPageForm.title);

    if (!slug) {
      notify('Enter a page slug or title to create a new page.', { tone: 'error', title: 'Missing slug' });
      return;
    }

    if (pages.some((page) => page.slug === slug)) {
      notify('A page with that slug already exists.', { tone: 'error', title: 'Duplicate page' });
      return;
    }

    try {
      await api.post('/pages', {
        slug,
        title: newPageForm.title || titleizeSlug(slug),
        internalName: newPageForm.title || titleizeSlug(slug),
        status: 'draft',
        description: '',
        metaDescription: '',
        sections: [createEmptySection()],
      });

      setNewPageForm({ slug: '', title: '' });
      await loadPages();
      setSelectedPageSlug(slug);
      notify('New page created in draft state.', { tone: 'success', title: 'Page created' });
    } catch (err) {
      console.error('Error creating page:', err);
      notify(err.response?.data?.message || 'Unable to create page.', { tone: 'error', title: 'Create failed' });
    }
  };

  const handleBackToPages = () => {
    if (isPageDirty) {
      confirm({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes in this page layout. If you leave now, your edits will be discarded.',
        confirmLabel: 'Discard & Exit',
        cancelLabel: 'Stay Here',
        tone: 'error',
      }).then((agreed) => {
        if (agreed) {
          setIsPageDirty(false);
          setOriginalPageData('');
          setSelectedPageSlug(null);
        }
      });
    } else {
      setSelectedPageSlug(null);
    }
  };

  const moveSection = (index, direction) => {
    setEditingPage((current) => {
      if (!current) return current;
      const sections = [...(current.sections || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sections.length) return current;

      [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];
      
      const updated = sections.map((sec, idx) => ({ ...sec, sortOrder: idx }));
      return { ...current, sections: updated };
    });
  };

  const duplicateSection = (index) => {
    setEditingPage((current) => {
      if (!current) return current;
      const sections = [...(current.sections || [])];
      const source = sections[index];
      const nextIndex = sections.length + 1;
      const copy = {
        ...source,
        _id: undefined,
        sectionId: `${source.sectionId}-copy-${nextIndex}`,
        sectionName: `${source.sectionName || source.title || 'Section'} (Copy)`,
        title: source.title ? `${source.title} Copy` : '',
        sortOrder: nextIndex,
      };
      sections.splice(index + 1, 0, copy);
      return { ...current, sections };
    });
    notify('Section duplicated.', { tone: 'success', title: 'Duplicated' });
  };

  const toggleSectionVisibility = (index) => {
    setEditingPage((current) => {
      if (!current) return current;
      const sections = [...(current.sections || [])];
      const isVisible = sections[index].isVisible !== false;
      sections[index] = {
        ...sections[index],
        isVisible: !isVisible,
        isActive: !isVisible
      };
      return { ...current, sections };
    });
  };

  const addNewSectionFromTemplate = (templateName) => {
    const templates = {
      hero: {
        sectionId: `hero-${Date.now()}`,
        sectionName: 'Hero Banner',
        sectionType: 'HERO',
        title: 'Headline Title Here',
        subtitle: 'Sub-headline Eyebrow',
        description: 'Positioning description text goes here.',
        isVisible: true,
        items: [
          { title: 'Primary Button', buttonText: 'Explore More', buttonUrl: '/explore', isActive: true },
          { title: 'Secondary Button', buttonText: 'Contact Us', buttonUrl: '/contact', isActive: true }
        ]
      },
      text_image: {
        sectionId: `text-image-${Date.now()}`,
        sectionName: 'Text + Image Block',
        sectionType: 'CUSTOM',
        title: 'Title of Content',
        subtitle: 'Subheading',
        description: 'Provide explanation or body copy here.',
        image: '',
        isVisible: true,
        items: []
      },
      cards: {
        sectionId: `cards-${Date.now()}`,
        sectionName: 'Features Cards Grid',
        sectionType: 'CARDS',
        title: 'Section Title',
        subtitle: 'Why Choose Us',
        description: 'Section subtitle description.',
        isVisible: true,
        items: [
          { title: 'First Feature', subtitle: 'Feature Item 1', description: 'Brief description details.', buttonText: 'Explore', buttonUrl: '#', isActive: true },
          { title: 'Second Feature', subtitle: 'Feature Item 2', description: 'Brief description details.', buttonText: 'Explore', buttonUrl: '#', isActive: true }
        ]
      },
      cta: {
        sectionId: `cta-${Date.now()}`,
        sectionName: 'CTA Button Block',
        sectionType: 'CTA',
        title: 'Ready to build your pathway?',
        description: 'Connect with an admissions advisor today.',
        isVisible: true,
        items: [
          { title: 'Action Link', buttonText: 'Connect Now', buttonUrl: '/contact', isActive: true }
        ]
      },
      process: {
        sectionId: `process-${Date.now()}`,
        sectionName: 'Staged Step Process',
        sectionType: 'PROCESS',
        title: 'Step Progression Ladder',
        description: 'A staged ladder, built rung by rung.',
        isVisible: true,
        items: [
          { title: '01 First Stage', subtitle: 'Location: India', description: 'Begin your qualification in India.', isActive: true },
          { title: '02 Second Stage', subtitle: 'Location: Abroad', description: 'Progress to year 2 transfer options abroad.', isActive: true }
        ]
      }
    };

    const newSec = templates[templateName] || templates.text_image;
    setEditingPage((current) => {
      if (!current) return current;
      const sections = [...(current.sections || [])];
      sections.push(newSec);
      return { ...current, sections };
    });
    setAddSectionOpen(false);
    notify('New template section appended to draft.', { tone: 'success', title: 'Section added' });
  };

  const refreshPageContent = async () => {
    await Promise.all([loadPages(), loadPageContent(selectedPageSlug)]);
  };

  const publishExistingPage = async (page) => {
    const slug = page?.slug;
    if (!slug) return;
    try {
      const payload = editingPage && selectedPageSlug === slug ? editingPage : page;
      await api.post(`/pages/${slug}/publish`, payload);
      await refreshPageContent();
      notify('Page published successfully.', { tone: 'success', title: 'Page published' });
    } catch (err) {
      console.error('Error publishing page:', err);
      notify(err.response?.data?.message || 'Unable to publish page.', { tone: 'error', title: 'Publish failed' });
    }
  };

  const unpublishExistingPage = async (page) => {
    const slug = page?.slug;
    if (!slug) return;
    try {
      const payload = editingPage && selectedPageSlug === slug ? editingPage : page;
      await api.post(`/pages/${slug}/unpublish`, payload);
      await refreshPageContent();
      notify('Page moved back to draft.', { tone: 'success', title: 'Draft restored' });
    } catch (err) {
      console.error('Error unpublishing page:', err);
      notify(err.response?.data?.message || 'Unable to move page to draft.', { tone: 'error', title: 'Unpublish failed' });
    }
  };

  const archiveExistingPage = async (page) => {
    const slug = page?.slug;
    if (!slug) return;

    const confirmed = await confirm({
      title: 'Archive this page?',
      description: 'The page will no longer be publicly visible, but its content will be kept in CMS.',
      confirmLabel: 'Archive page',
      cancelLabel: 'Keep page',
      tone: 'error',
    });

    if (!confirmed) return;

    try {
      await api.delete(`/pages/${slug}`);
      await loadPages();
      if (selectedPageSlug === slug) {
        const fallbackPage = pages.find((item) => item.slug !== slug) || null;
        setSelectedPageSlug(fallbackPage ? fallbackPage.slug : 'home');
      }
      notify('Page archived successfully.', { tone: 'success', title: 'Page archived' });
    } catch (err) {
      console.error('Error archiving page:', err);
      notify(err.response?.data?.message || 'Unable to archive page.', { tone: 'error', title: 'Archive failed' });
    }
  };

  const duplicateExistingPage = async (page) => {
    const slug = page?.slug;
    if (!slug) return;

    try {
      const res = await api.get(`/pages/${slug}`);
      const source = res.data || page;
      const baseSlug = `${slug}-copy`;
      let duplicateSlug = baseSlug;
      let suffix = 2;
      while (pages.some((item) => item.slug === duplicateSlug)) {
        duplicateSlug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      await api.post('/pages', {
        ...source,
        slug: duplicateSlug,
        title: `${source.title || titleizeSlug(slug)} Copy`,
        internalName: `${source.internalName || source.title || titleizeSlug(slug)} Copy`,
        status: 'draft',
        isPublished: false,
        publishedAt: null,
        archivedAt: null,
      });

      await loadPages();
      setSelectedPageSlug(duplicateSlug);
      notify('Page duplicated as a draft.', { tone: 'success', title: 'Page duplicated' });
    } catch (err) {
      console.error('Error duplicating page:', err);
      notify(err.response?.data?.message || 'Unable to duplicate page.', { tone: 'error', title: 'Duplicate failed' });
    }
  };

  // Asset Uploading for CMS Banners/Logos/Settings
  const uploadAsset = async (file, folder = 'cms') => {
    const formData = new FormData();
    const compressed = await compressImage(file);
    formData.append('image', compressed);
    formData.append('folder', folder);

    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data.mediaItem.url;
  };

  const handleAssetUpload = async (file, onSuccess, contextLabel, folder = 'cms') => {
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadAsset(file, folder);
      onSuccess(url);
      notify(`${contextLabel} uploaded successfully.`, { tone: 'success', title: 'Upload complete' });
    } catch (err) {
      console.error(`Failed to upload ${contextLabel}:`, err);
      notify(err?.response?.data?.message || `Unable to upload ${contextLabel}.`, { tone: 'error', title: 'Upload failed' });
    } finally {
      setSaving(false);
    }
  };

  // Banner actions
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
      const updatedBanners = await api.get('/banners');
      setBanners(updatedBanners.data);
      notify('Banner saved successfully.', {
        tone: 'success',
        title: editingBannerId ? 'Banner updated' : 'Banner created',
      });
    } catch (err) {
      console.error('Failed to save banner:', err);
      notify(err.response?.data?.message || 'Unable to save banner.', { tone: 'error', title: 'Banner save failed' });
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
      const updatedBanners = await api.get('/banners');
      setBanners(updatedBanners.data);
      notify('Banner deleted successfully.', { tone: 'success', title: 'Banner deleted' });
    } catch (err) {
      console.error('Failed to delete banner:', err);
      notify(err.response?.data?.message || 'Unable to delete banner.', { tone: 'error', title: 'Delete failed' });
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
      if (endpoint.includes('banners')) {
        const res = await api.get('/banners');
        setBanners(res.data);
      } else if (endpoint.includes('logos')) {
        const res = await api.get('/logos');
        setLogos(res.data);
      }
      notify('Collection order updated.', { tone: 'success', title: 'Order saved' });
    } catch (err) {
      console.error('Failed to reorder collection:', err);
      notify(err.response?.data?.message || 'Unable to reorder items.', { tone: 'error', title: 'Reorder failed' });
    } finally {
      setSaving(false);
    }
  };

  // Logo actions
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
      const updatedLogos = await api.get('/logos');
      setLogos(updatedLogos.data);
      notify('Logo saved successfully.', {
        tone: 'success',
        title: editingLogoId ? 'Logo updated' : 'Logo created',
      });
    } catch (err) {
      console.error('Failed to save logo:', err);
      notify(err.response?.data?.message || 'Unable to save logo.', { tone: 'error', title: 'Logo save failed' });
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
      const updatedLogos = await api.get('/logos');
      setLogos(updatedLogos.data);
      notify('Logo deleted successfully.', { tone: 'success', title: 'Logo deleted' });
    } catch (err) {
      console.error('Failed to delete logo:', err);
      notify(err.response?.data?.message || 'Unable to delete logo.', { tone: 'error', title: 'Delete failed' });
    } finally {
      setSaving(false);
    }
  };

  // Website Settings actions
  const saveWebsite = async (e) => {
    e.preventDefault();
    const validationErrors = validateWebsiteSettings(websiteSettings);
    if (notifyFirstError('Fix the website settings', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      await api.put('/settings/website', websiteSettings);
      notify('Website settings saved successfully.', { tone: 'success', title: 'Website updated' });
    } catch (err) {
      console.error('Failed to save website settings:', err);
      notify(err.response?.data?.message || 'Unable to save website settings.', { tone: 'error', title: 'Website save failed' });
    } finally {
      setSaving(false);
    }
  };

  // Contact Settings actions
  const saveContact = async (e) => {
    e.preventDefault();
    const validationErrors = validateContactSettingsForm(contactSettings);
    if (notifyFirstError('Fix the contact settings', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      const normalized = {
        ...contactSettings,
        latitude: contactSettings.latitude === '' || contactSettings.latitude === null ? null : Number(contactSettings.latitude),
        longitude: contactSettings.longitude === '' || contactSettings.longitude === null ? null : Number(contactSettings.longitude),
      };

      if (!String(normalized.googleMapEmbed || '').trim()) {
        normalized.googleMapEmbed = buildContactMapEmbed(normalized);
      }

      await api.put('/settings/contact', normalized);
      notify('Contact settings saved successfully.', { tone: 'success', title: 'Contact updated' });
    } catch (err) {
      console.error('Failed to save contact settings:', err);
      notify(err.response?.data?.message || 'Unable to save contact settings.', { tone: 'error', title: 'Contact save failed' });
    } finally {
      setSaving(false);
    }
  };

  // Global SEO & Analytics Settings actions
  const saveSiteSettings = async (e) => {
    e.preventDefault();
    const validationErrors = validateSiteSettingsForm(siteSettings);
    if (notifyFirstError('Fix the global settings', validationErrors)) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...siteSettings,
        siteKeywords: Array.isArray(siteSettings.siteKeywords)
          ? siteSettings.siteKeywords
          : String(siteSettings.siteKeywords || '')
              .split(',')
              .map((keyword) => keyword.trim())
              .filter(Boolean),
      };

      const response = await api.put('/settings', payload);
      setSiteSettings({
        ...response.data,
        siteKeywords: Array.isArray(response.data.siteKeywords) 
          ? response.data.siteKeywords.join(', ') 
          : String(response.data.siteKeywords || '')
      });
      notify('SEO and Analytics settings saved successfully.', { tone: 'success', title: 'Settings updated' });
    } catch (err) {
      console.error('Failed to save site settings:', err);
      notify(err.response?.data?.message || 'Unable to save site settings.', { tone: 'error', title: 'Settings save failed' });
    } finally {
      setSaving(false);
    }
  };

  // Chatbot Settings actions
  const saveChatbotSettings = async (e) => {
    e.preventDefault();
    setChatbotSaveError('');
    setChatbotSaveSuccess('');

    const urlStr = chatbotUrlInput.trim();
    const isEnabled = !!chatbotEnabledInput;

    if (isEnabled) {
      if (!urlStr) {
        setChatbotSaveError('Chatbot URL is required when chatbot is enabled.');
        notify('Chatbot URL is required.', { tone: 'error', title: 'Validation failed' });
        return;
      }
      if (!isValidHttpUrl(urlStr)) {
        setChatbotSaveError('Please enter a valid HTTP or HTTPS URL (e.g. https://example.com/chat).');
        notify('Invalid chatbot URL format.', { tone: 'error', title: 'Validation failed' });
        return;
      }
    }

    setSaving(true);
    try {
      const response = await api.put('/settings/chatbot', {
        chatbotUrl: urlStr,
        chatbotEnabled: isEnabled
      });

      const updatedSettings = response.data.settings || response.data.siteSettings || response.data;
      
      setSiteSettings((prev) => ({
        ...prev,
        chatbotUrl: updatedSettings.chatbotUrl,
        chatbotEnabled: !!updatedSettings.chatbotEnabled
      }));

      setChatbotUrlInput(updatedSettings.chatbotUrl || '');
      setChatbotEnabledInput(!!updatedSettings.chatbotEnabled);
      setChatbotSaveSuccess('Chatbot settings updated successfully.');
      notify('Chatbot settings saved successfully.', { tone: 'success', title: 'Settings saved' });
    } catch (err) {
      console.error('Error saving chatbot settings:', err);
      const msg = err.response?.data?.message || 'Unable to update chatbot settings.';
      setChatbotSaveError(msg);
      notify(msg, { tone: 'error', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  // Media Management Actions
  const handleMediaUploadSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUploadFile) {
      notify('Please select a file to upload.', { tone: 'error', title: 'No file' });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      const compressed = await compressImage(mediaUploadFile);
      formData.append('image', compressed);
      formData.append('folder', 'website/media');
      formData.append('altText', mediaUploadFile.name.replace(/\.[^.]+$/, ''));

      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMediaUploadFile(null);
      // Reset input element
      const fileInput = document.getElementById('media_library_uploader');
      if (fileInput) fileInput.value = '';

      await loadMediaItems();
      notify('File uploaded to media library successfully.', { tone: 'success', title: 'File uploaded' });
    } catch (err) {
      console.error('Media upload failed:', err);
      notify(err.response?.data?.message || 'Unable to upload file to media library.', { tone: 'error', title: 'Upload failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaDelete = async (id, fileName) => {
    const confirmed = await confirm({
      title: 'Delete media item?',
      description: `This will permanently remove "${fileName}" from the server. Ensure it is not in use.`,
      confirmLabel: 'Delete file',
      cancelLabel: 'Keep file',
      tone: 'error',
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      await api.delete(`/media/${id}`);
      setMediaItems((prev) => prev.filter((m) => m._id !== id));
      notify('Media item deleted successfully.', { tone: 'success', title: 'Media deleted' });
    } catch (err) {
      console.error('Media delete failed:', err);
      notify(err.response?.data?.message || 'Unable to delete media item.', { tone: 'error', title: 'Delete failed' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    notify(`Copied ${label} to clipboard!`, { tone: 'success', title: 'Copied' });
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const search = deferredSearchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      inquiry.name?.toLowerCase().includes(search) ||
      inquiry.email?.toLowerCase().includes(search) ||
      inquiry.phone?.toLowerCase().includes(search) ||
      inquiry.type?.toLowerCase().includes(search);
    const matchesStatus = inquiryStatusFilter === 'all' || inquiry.status === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMediaItems = mediaItems.filter((item) => {
    const search = mediaSearch.trim().toLowerCase();
    return !search ||
      item.originalName?.toLowerCase().includes(search) ||
      item.fileName?.toLowerCase().includes(search) ||
      item.folder?.toLowerCase().includes(search) ||
      item.tags?.some(t => t.toLowerCase().includes(search));
  });

  const unreadCount = inquiries.filter((inquiry) => inquiry.status === 'unread').length;
  const readCount = inquiries.filter((inquiry) => inquiry.status === 'read').length;
  const archivedCount = inquiries.filter((inquiry) => inquiry.status === 'archived').length;

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans admin-panel">
      {/* Top Banner/Navbar */}
      <header className="border-b border-border bg-surface py-4 px-6 flex flex-wrap items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary font-display text-base font-bold text-white">
            C
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Cornerstone Control Centre</h1>
            <p className="text-[10px] text-muted-foreground">Admin Portal &bull; Real-time CMS Manager</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            <Globe className="h-3.5 w-3.5" /> View Live Site
          </Link>
          <span className="text-xs text-muted-foreground border-l border-border pl-4">
            Signed in as: <span className="font-semibold text-foreground">{user.username} ({user.role})</span>
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-white border border-red-500/20 hover:bg-red-500 px-3 py-1.5 rounded transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" /> Log Out
          </button>
        </div>
      </header>

      {/* Sidebar & Contents layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Main Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-border bg-surface p-4 flex flex-col gap-1.5 shrink-0">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Main Management
          </p>

          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <LayoutDashboard className="h-4 w-4" /> Overview Dashboard
          </button>

          <button
            onClick={() => handleTabChange('inquiries', { onSwitch: () => setSelectedInquiry(null) })}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'inquiries' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-4 w-4" /> Inbox Leads
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{unreadCount}</span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('homepage')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'homepage' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <ImageIcon className="h-4 w-4" /> Homepage Content
          </button>

          <button
            onClick={() => handleTabChange('pages')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'pages' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <FileText className="h-4 w-4" /> Page Editor (CMS)
          </button>

          <button
            onClick={() => handleTabChange('services')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'services' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <GraduationCap className="h-4 w-4" /> Services &amp; Progression
          </button>

          <button
            onClick={() => handleTabChange('media', { onSwitch: () => loadMediaItems() })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'media' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <Upload className="h-4 w-4" /> Media Library
          </button>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Configurations
            </p>

            <button
              onClick={() => handleTabChange('chatbot')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'chatbot' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4" /> CRM Chatbot
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${siteSettings.chatbotEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
            </button>

            <button
              onClick={() => handleTabChange('contact')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'contact' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
            >
              <Phone className="h-4 w-4" /> Contact Details
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'settings' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(185,151,80,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
            >
              <Settings className="h-4 w-4" /> Global Settings &amp; SEO
            </button>
          </div>

          <div className="mt-auto p-3 rounded-xl bg-background/60 border border-border/80 text-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Design System</span>
            <div className="flex justify-center gap-2 mt-2">
              <span className="h-4 w-4 rounded-full bg-primary block border border-border" title="Primary Color (#B99750)" />
              <span className="h-4 w-4 rounded-full bg-[#0E1E34] block border border-border" title="Secondary Color (#0E1E34)" />
              <span className="h-4 w-4 rounded-full bg-surface block border border-border" title="Surface Card bg" />
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className={`flex-1 p-6 md:p-8 bg-surface-2/20 overflow-y-auto max-h-[calc(100vh-68px)] transition-opacity duration-200 ${isPending ? 'opacity-95' : 'opacity-100'}`}>
          {loading || pageLoading ? (
            <div className="flex justify-center items-center py-40">
              <RefreshCw className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Greeting banner */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-surface to-primary/5">
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground">Welcome to Cornerstone CMS</h2>
                      <p className="text-sm text-muted-foreground mt-1">Manage public pages, progress partners, enquiries, and external site widgets.</p>
                    </div>
                    <button 
                      onClick={loadBaseData} 
                      className="inline-flex items-center gap-2 border border-border hover:border-primary bg-background px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Force Refresh
                    </button>
                  </div>

                  {/* Key metrics grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Active Pages</span>
                      <p className="mt-3 font-display text-3xl font-semibold text-foreground">{pages.filter(p => p.status === 'published').length}</p>
                      <span className="mt-2 text-xs text-muted-foreground block">{pages.length} total pages in database.</span>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Pending Leads</span>
                      <p className="mt-3 font-display text-3xl font-semibold text-primary">{unreadCount}</p>
                      <span className="mt-2 text-xs text-muted-foreground block">{inquiries.length} inquiries received.</span>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">CRM Chatbot Status</span>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${siteSettings.chatbotEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-display text-lg font-semibold text-foreground">{siteSettings.chatbotEnabled ? 'Active (ON)' : 'Disabled (OFF)'}</span>
                      </div>
                      <span className="mt-2 text-xs text-muted-foreground block truncate">{siteSettings.chatbotUrl ? 'Widget script loaded' : 'No URL set'}</span>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Partners &amp; Stories</span>
                      <p className="mt-3 font-display text-3xl font-semibold text-foreground">{universities.length} / {stories.length}</p>
                      <span className="mt-2 text-xs text-muted-foreground block">Active explorer progression paths.</span>
                    </div>
                  </div>

                  {/* Quick actions & overview */}
                  <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Quick actions panel */}
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                      <h3 className="font-display text-lg font-bold text-foreground">Quick Actions</h3>
                      <p className="text-xs text-muted-foreground">Jump directly to common content segments you want to edit on the public site.</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={() => setActiveTab('homepage')}
                          className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary text-left transition"
                        >
                          <span className="text-primary"><ImageIcon className="h-5 w-5" /></span>
                          <span className="text-xs font-semibold text-foreground mt-1">Edit Homepage</span>
                          <span className="text-[10px] text-muted-foreground">Manage Hero Banners &amp; Logos</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('chatbot')}
                          className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary text-left transition"
                        >
                          <span className="text-primary"><MessageSquare className="h-5 w-5" /></span>
                          <span className="text-xs font-semibold text-foreground mt-1">Manage Chatbot</span>
                          <span className="text-[10px] text-muted-foreground">Configure CRM Integration URL</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('pages')}
                          className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary text-left transition"
                        >
                          <span className="text-primary"><FileText className="h-5 w-5" /></span>
                          <span className="text-xs font-semibold text-foreground mt-1">Manage Pages</span>
                          <span className="text-[10px] text-muted-foreground">Modify sections, titles &amp; texts</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('contact')}
                          className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary text-left transition"
                        >
                          <span className="text-primary"><Phone className="h-5 w-5" /></span>
                          <span className="text-xs font-semibold text-foreground mt-1">Manage Contact</span>
                          <span className="text-[10px] text-muted-foreground">Modify email, phone &amp; map details</span>
                        </button>
                      </div>
                    </div>

                    {/* Recent leads / updates panel */}
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-display text-lg font-bold text-foreground">Recent Inbox Leads</h3>
                          <button onClick={() => setActiveTab('inquiries')} className="text-xs text-primary font-bold hover:underline">View all</button>
                        </div>
                        <div className="space-y-3">
                          {inquiries.slice(0, 3).map((inq) => (
                            <div key={inq._id} className="flex justify-between items-center p-3 rounded-lg bg-surface-2 border border-border text-xs">
                              <div>
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold ${inq.status === 'unread' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{inq.status}</span>
                                <h4 className="font-semibold text-foreground mt-1">{inq.name}</h4>
                                <p className="text-[10px] text-muted-foreground">{inq.email}</p>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{formatUtcDateTime(inq.createdAt)}</span>
                            </div>
                          ))}
                          {inquiries.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-6">No leads submitted yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: INBOX LEADS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-bold">Admissions Lead Inbox</h2>
                      <p className="text-xs text-muted-foreground">Review user enquiries, contact requests, and eligibility wizards.</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl">
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leads by name, email or type..."
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        {[
                          ['all', 'All'],
                          ['unread', 'Unread'],
                          ['read', 'Read'],
                          ['archived', 'Archived'],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setInquiryStatusFilter(value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              inquiryStatusFilter === value
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border bg-background text-foreground hover:border-primary'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-12">
                    {/* Inquiry List */}
                    <div className="md:col-span-7 space-y-3">
                      {filteredInquiries.length === 0 ? (
                        <p className="text-center py-10 border border-dashed border-border rounded text-muted-foreground text-sm bg-surface">
                          {searchTerm || inquiryStatusFilter !== 'all'
                            ? 'No leads match the current search and filter.'
                            : 'No leads submitted yet.'}
                        </p>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <div 
                            key={inq._id}
                            onClick={() => setSelectedInquiry(inq)}
                            className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedInquiry?._id === inq._id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:bg-surface-2 hover:border-primary/30'}`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold ${inq.type === 'pathway' ? 'bg-primary/10 text-primary' : inq.type === 'eligibility' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                  {inquiryTypeLabel[inq.type] || inq.type}
                                </span>
                                {inq.status === 'unread' && <span className="h-2 w-2 rounded-full bg-red-500" />}
                              </div>
                              <h4 className="font-bold text-sm mt-1">{inq.name || 'Anonymous'}</h4>
                              <p className="text-xs text-muted-foreground">{inq.email}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                              {inquiryStatusLabel[inq.status] || inq.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Inquiry Detail panel */}
                    <div className="md:col-span-5">
                      {selectedInquiry ? (
                        <div className="border border-border bg-surface rounded-xl p-6 space-y-6 shadow-sm sticky top-6">
                          <div className="border-b border-border pb-4 flex justify-between items-start">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                                {selectedInquiry.type} Lead details
                              </span>
                              <h3 className="font-display text-xl font-bold mt-1 text-foreground">{selectedInquiry.name}</h3>
                            </div>
                            <button 
                              type="button"
                              onClick={() => deleteInquiry(selectedInquiry._id)}
                              aria-label="Delete lead"
                              className="text-muted-foreground hover:text-red-500 p-1.5 transition-colors rounded-lg hover:bg-surface-2"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase">Email</p>
                              <p className="text-sm mt-0.5 text-foreground">{selectedInquiry.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase">Phone</p>
                              <p className="text-sm mt-0.5 text-foreground">{selectedInquiry.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase">Submitted Date</p>
                              <p className="text-sm mt-0.5 text-foreground">{formatUtcDateTime(selectedInquiry.createdAt)}</p>
                            </div>

                            {/* Wizard Custom answers */}
                            <div className="border-t border-border/60 pt-4">
                              <p className="font-semibold text-muted-foreground uppercase mb-2">Wizard Responses</p>
                              <div className="bg-surface-2 p-3 rounded-xl border border-border space-y-1.5">
                                {Object.entries(selectedInquiry.data || {}).map(([key, val]) => (
                                  <div key={key} className="flex justify-between gap-4">
                                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-semibold text-foreground text-right">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t border-border mt-6">
                            {selectedInquiry.status === 'unread' ? (
                              <button
                                onClick={() => markInquiryStatus(selectedInquiry._id, 'read')}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white py-2.5 text-xs font-semibold transition"
                              >
                                <Check className="h-4 w-4" /> Mark as Read
                              </button>
                            ) : (
                              <button
                                onClick={() => markInquiryStatus(selectedInquiry._id, 'unread')}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background hover:bg-surface-2 py-2.5 text-xs font-semibold text-foreground transition"
                              >
                                Mark as Unread
                              </button>
                            )}
                            <button
                              onClick={() => markInquiryStatus(selectedInquiry._id, 'archived')}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background hover:bg-surface-2 px-3 py-2.5 text-xs font-semibold text-foreground transition"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 border border-dashed border-border bg-surface rounded-xl text-muted-foreground text-xs">
                          Select a lead card from the list to view wizard answers and contact details.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HOMEPAGE CONTENT */}
              {activeTab === 'homepage' && (
                <div className="space-y-8">
                  {/* BANNERS FORM */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="border-b border-border pb-4 mb-6">
                      <h2 className="font-display text-2xl font-bold text-foreground">Homepage Hero Banners</h2>
                      <p className="text-xs text-muted-foreground mt-1">Configure active sliding banners at the top of the homepage.</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                      <form onSubmit={saveBanner} className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                          {editingBannerId ? 'Edit Banner Card' : 'Create New Hero Banner'}
                        </h3>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Banner Title</label>
                          <input
                            required
                            value={bannerForm.title}
                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="Banner title"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Subtitle (Eyebrow)</label>
                          <input
                            value={bannerForm.subtitle}
                            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="Subtitle text"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Description Body</label>
                          <textarea
                            required
                            value={bannerForm.description}
                            onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="Brief positioning text..."
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Button 1 Label</label>
                            <input
                              value={bannerForm.button1Text}
                              onChange={(e) => setBannerForm({ ...bannerForm, button1Text: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="e.g. Find Your Pathway"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Button 1 Link (or relative path)</label>
                            <input
                              value={bannerForm.button1Url}
                              onChange={(e) => setBannerForm({ ...bannerForm, button1Url: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="e.g. /find-your-pathway"
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Button 2 Label</label>
                            <input
                              value={bannerForm.button2Text}
                              onChange={(e) => setBannerForm({ ...bannerForm, button2Text: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="e.g. How It Works"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Button 2 Link</label>
                            <input
                              value={bannerForm.button2Url}
                              onChange={(e) => setBannerForm({ ...bannerForm, button2Url: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="e.g. /how-it-works"
                            />
                          </div>
                        </div>

                        {/* Image file uploads */}
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            ['desktopImage', 'Desktop image', '1920x800 webp'],
                            ['tabletImage', 'Tablet image', '1024x600 webp'],
                            ['mobileImage', 'Mobile image', '600x400 webp'],
                          ].map(([field, label, size]) => (
                            <div key={field} className="rounded-xl border border-dashed border-border p-3 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-muted-foreground block">{label}</span>
                                <span className="text-[9px] text-muted-foreground block mb-2">{size}</span>
                              </div>
                              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2 py-1.5 rounded text-[10px] font-semibold hover:bg-primary hover:text-white transition">
                                <Upload className="h-3 w-3" /> Select File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    void handleAssetUpload(file, (url) => {
                                      setBannerForm((prev) => ({ ...prev, [field]: url }));
                                    }, `Banner ${label}`);
                                  }}
                                />
                              </label>
                              {bannerForm[field] && (
                                <div className="mt-2 relative h-14 w-full rounded border border-border overflow-hidden">
                                  <Img src={bannerForm[field]} alt={label} className="object-cover w-full h-full" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Sort Order</label>
                            <input
                              type="number"
                              value={bannerForm.displayOrder}
                              onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: e.target.value })}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Priority</label>
                            <input
                              type="number"
                              value={bannerForm.imagePriority}
                              onChange={(e) => setBannerForm({ ...bannerForm, imagePriority: e.target.value })}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Status</label>
                            <select
                              value={bannerForm.status}
                              onChange={(e) => setBannerForm({ ...bannerForm, status: e.target.value })}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5"
                            >
                              <option value="inactive">Inactive</option>
                              <option value="active">Active</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setBannerForm(emptyBanner);
                              setEditingBannerId(null);
                            }}
                            className="px-4 py-2 border border-border bg-background hover:bg-surface-2 rounded-xl text-xs font-semibold text-foreground transition"
                          >
                            Reset
                          </button>
                          <button
                            disabled={saving}
                            type="submit"
                            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition"
                          >
                            {editingBannerId ? 'Update Banner' : 'Create Banner'}
                          </button>
                        </div>
                      </form>

                      {/* BANNERS LIST */}
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Banners ({banners.length})</h4>
                        {banners.map((item, idx) => (
                          <div key={item._id} className="p-4 rounded-xl border border-border bg-surface-2 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${item.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>{item.status}</span>
                                <h4 className="font-bold text-sm mt-1 text-foreground">{item.title}</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-4">
                                <button
                                  type="button"
                                  onClick={() => reorderCollection(banners, '/banners/reorder', item._id, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded border border-border bg-background text-muted-foreground disabled:opacity-40"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => reorderCollection(banners, '/banners/reorder', item._id, 'down')}
                                  disabled={idx === banners.length - 1}
                                  className="p-1 rounded border border-border bg-background text-muted-foreground disabled:opacity-40"
                                >
                                  ▼
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingBannerId(item._id);
                                    setBannerForm(item);
                                  }}
                                  className="p-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-primary transition"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteBanner(item._id)}
                                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {item.desktopImage && (
                                <div className="h-10 w-16 relative rounded overflow-hidden border border-border">
                                  <Img src={item.desktopImage} alt="desktop" className="object-cover w-full h-full" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PARTNERSHIP LOGOS FORM */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="border-b border-border pb-4 mb-6">
                      <h2 className="font-display text-2xl font-bold text-foreground">Partnership / Accreditation Logos</h2>
                      <p className="text-xs text-muted-foreground mt-1">Manage logos that slide or appear in headers/footers (e.g. Pearson, ATHE).</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                      <form onSubmit={saveLogo} className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                          {editingLogoId ? 'Edit Partner Logo' : 'Add New Progression Partner Logo'}
                        </h3>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Company Name</label>
                          <input
                            required
                            value={logoForm.companyName}
                            onChange={(e) => setLogoForm({ ...logoForm, companyName: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="e.g. Pearson Education"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Website Link</label>
                          <input
                            value={logoForm.websiteUrl}
                            onChange={(e) => setLogoForm({ ...logoForm, websiteUrl: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Image Alt Description</label>
                          <input
                            value={logoForm.altText}
                            onChange={(e) => setLogoForm({ ...logoForm, altText: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="ALT text"
                          />
                        </div>

                        {/* Logo File upload */}
                        <div className="rounded-xl border border-dashed border-border p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">Logo Image File</span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">Prefer transparent PNG or SVG</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {logoForm.logoImage && (
                              <div className="h-10 w-20 bg-white p-1 rounded border border-border overflow-hidden flex items-center justify-center">
                                <Img src={logoForm.logoImage} alt="Logo preview" className="object-contain max-h-full" />
                              </div>
                            )}
                            <label className="cursor-pointer inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded text-xs font-semibold hover:bg-primary hover:text-white transition">
                              <Upload className="h-3.5 w-3.5" /> Upload Logo
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  void handleAssetUpload(file, (url) => {
                                    setLogoForm((prev) => ({ ...prev, logoImage: url }));
                                  }, `Partner Logo`);
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Sort Order</label>
                            <input
                              type="number"
                              value={logoForm.displayOrder}
                              onChange={(e) => setLogoForm({ ...logoForm, displayOrder: e.target.value })}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Priority</label>
                            <input
                              type="number"
                              value={logoForm.priority}
                              onChange={(e) => setLogoForm({ ...logoForm, priority: e.target.value })}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Status</label>
                            <select
                              value={logoForm.status}
                              onChange={(e) => setLogoForm({ ...logoForm, status: e.target.value })}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5"
                            >
                              <option value="inactive">Inactive</option>
                              <option value="active">Active</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setLogoForm(emptyLogo);
                              setEditingLogoId(null);
                            }}
                            className="px-4 py-2 border border-border bg-background hover:bg-surface-2 rounded-xl text-xs font-semibold text-foreground transition"
                          >
                            Reset
                          </button>
                          <button
                            disabled={saving}
                            type="submit"
                            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition"
                          >
                            {editingLogoId ? 'Update Logo' : 'Create Logo'}
                          </button>
                        </div>
                      </form>

                      {/* LOGOS LIST */}
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accreditation partner list ({logos.length})</h4>
                        {logos.map((item, idx) => (
                          <div key={item._id} className="p-3 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-24 bg-white p-1 rounded border border-border flex items-center justify-center flex-shrink-0">
                                <Img src={item.logoImage} alt={item.companyName} className="object-contain max-h-full" />
                              </div>
                              <div>
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold ${item.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>{item.status}</span>
                                <h4 className="font-bold text-xs mt-1 text-foreground">{item.companyName}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => reorderCollection(logos, '/logos/reorder', item._id, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded border border-border bg-background text-muted-foreground disabled:opacity-40"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => reorderCollection(logos, '/logos/reorder', item._id, 'down')}
                                disabled={idx === logos.length - 1}
                                className="p-1 rounded border border-border bg-background text-muted-foreground disabled:opacity-40"
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => {
                                  setEditingLogoId(item._id);
                                  setLogoForm(item);
                                }}
                                className="p-1 rounded-lg border border-border bg-background text-muted-foreground hover:text-primary transition"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteLogo(item._id)}
                                className="p-1 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PAGES MANAGER (CMS) */}
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  {/* CASE 1: NO PAGE SELECTED - DISPLAY LANDING GRID OF ALL PAGES */}
                  {selectedPageSlug === null ? (
                    <div className="space-y-6">
                      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Website Pages</p>
                            <h2 className="font-display text-2xl font-bold text-foreground">Visual CMS Content Manager</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Select a website page to design its layouts, reorder section content blocks, or create new dynamic pages.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={refreshPageContent}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary shrink-0"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Refresh Database Pages
                          </button>
                        </div>

                        {/* Search & Filter Controls */}
                        <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="relative w-full md:max-w-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                              <Search className="h-4 w-4" />
                            </span>
                            <input
                              type="search"
                              value={pageSearch}
                              onChange={(e) => setPageSearch(e.target.value)}
                              placeholder="Search pages by name or slug..."
                              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-xs focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div className="flex rounded-lg border border-border bg-surface-2 p-1 gap-1 w-full md:w-auto overflow-x-auto shrink-0">
                            {['all', 'published', 'draft', 'archived'].map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setPageFilter(tab)}
                                className={`px-4 py-1.5 rounded text-xs font-semibold capitalize transition ${
                                  pageFilter === tab
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Pages cards list & creator grid */}
                        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
                          <div>
                            {pagesLoading ? (
                              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 py-24">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : pages.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-border bg-background/60 py-24 text-center text-xs text-muted-foreground">
                                No pages found. Create your first page using the form on the right.
                              </div>
                            ) : (
                              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                                {pages
                                  .filter((page) => {
                                    const search = pageSearch.trim().toLowerCase();
                                    const matchesSearch =
                                      !search ||
                                      page.title?.toLowerCase().includes(search) ||
                                      page.slug?.toLowerCase().includes(search);
                                    const matchesFilter = pageFilter === 'all' || page.status === pageFilter;
                                    return matchesSearch && matchesFilter;
                                  })
                                  .map((page) => {
                                    const statusTone =
                                      page.status === 'published'
                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        : page.status === 'archived'
                                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20';

                                    // Try to determine page icon
                                    let PageIcon = FileText;
                                    if (page.slug === 'home') PageIcon = Globe;
                                    else if (page.slug?.includes('about')) PageIcon = BookOpen;
                                    else if (page.slug?.includes('admissions')) PageIcon = ShieldCheck;

                                    return (
                                      <div
                                        key={page._id || page.slug}
                                        className="group rounded-2xl border border-border bg-background p-5 shadow-sm hover:border-primary/40 hover:shadow-[0_12px_24px_-8px_rgba(185,151,80,0.06)] transition flex flex-col justify-between gap-4"
                                      >
                                        <div>
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <PageIcon className="h-4 w-4" />
                                              </div>
                                              <div>
                                                <h3 className="font-display text-sm font-bold text-foreground truncate max-w-[130px]" title={page.title}>{page.title}</h3>
                                                <span className="text-[10px] font-semibold text-muted-foreground block">/{page.slug}</span>
                                              </div>
                                            </div>
                                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusTone}`}>
                                              {page.status || 'draft'}
                                            </span>
                                          </div>

                                          <div className="mt-4 grid grid-cols-2 border-y border-border/60 py-2.5 text-center text-xs text-muted-foreground">
                                            <div className="border-r border-border/60">
                                              <span className="block text-foreground font-bold">{page.sectionsCount || 0}</span>
                                              <span>Sections</span>
                                            </div>
                                            <div>
                                              <span className="block text-foreground font-bold">{page.activeSectionsCount || 0}</span>
                                              <span>Active</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-3 shrink-0">
                                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground justify-between">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Updated:</span>
                                            <span className="font-medium text-foreground">{formatUtcDateTime(page.updatedAt)}</span>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <button
                                              type="button"
                                              onClick={() => startTransition(() => setSelectedPageSlug(page.slug))}
                                              className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                                            >
                                              <Edit className="h-3 w-3 mr-1" /> Edit Layout
                                            </button>
                                            <Link
                                              href={`/${page.slug === 'home' ? '' : page.slug}`}
                                              target="_blank"
                                              className="w-full inline-flex items-center justify-center border border-border bg-surface hover:bg-surface-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground transition"
                                            >
                                              <Eye className="h-3 w-3 mr-1" /> Preview Live
                                            </Link>
                                          </div>

                                          <div className="flex justify-between items-center gap-1 pt-1">
                                            {page.status === 'published' ? (
                                              <button
                                                type="button"
                                                onClick={() => unpublishExistingPage(page)}
                                                className="flex-1 text-[9px] font-bold text-muted-foreground hover:text-primary transition py-1 rounded hover:bg-surface"
                                              >
                                                Unpublish
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => publishExistingPage(page)}
                                                className="flex-1 text-[9px] font-bold text-muted-foreground hover:text-primary transition py-1 rounded hover:bg-surface"
                                              >
                                                Publish
                                              </button>
                                            )}
                                            <span className="text-muted-foreground/30">|</span>
                                            <button
                                              type="button"
                                              onClick={() => duplicateExistingPage(page)}
                                              className="flex-1 text-[9px] font-bold text-muted-foreground hover:text-primary transition py-1 rounded hover:bg-surface"
                                            >
                                              Duplicate
                                            </button>
                                            <span className="text-muted-foreground/30">|</span>
                                            <button
                                              type="button"
                                              disabled={page.slug === 'home'}
                                              onClick={() => archiveExistingPage(page)}
                                              className="flex-1 text-[9px] font-bold text-red-500/80 hover:text-red-500 transition py-1 rounded hover:bg-red-500/5 disabled:opacity-40"
                                            >
                                              Archive
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>

                          {/* Quick Page Creator sidebar */}
                          <div className="rounded-2xl border border-border bg-background p-5 h-fit shadow-sm space-y-4">
                            <div>
                              <h3 className="font-display text-sm font-bold text-foreground">Create New Page</h3>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Appends a fresh layout template to public routes.</p>
                            </div>
                            <div className="space-y-3.5">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Route Slug</label>
                                <input
                                  type="text"
                                  value={newPageForm.slug}
                                  onChange={(e) => setNewPageForm((current) => ({ ...current, slug: e.target.value }))}
                                  placeholder="e.g. admissions-info"
                                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Page Display Title</label>
                                  <input
                                    type="text"
                                    value={newPageForm.title}
                                    onChange={(e) => setNewPageForm((current) => ({ ...current, title: e.target.value }))}
                                    placeholder="e.g. Admissions Info"
                                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs focus:border-primary focus:outline-none"
                                  />
                              </div>
                              <button
                                type="button"
                                onClick={createNewPage}
                                className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
                              >
                                <Plus className="mr-1.5 h-4 w-4" /> Create Draft Page
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // CASE 2: SELECTED PAGE WORKSPACE DISPLAY
                    editingPage && (
                      <div className="space-y-6">
                        {/* Editor Navigation Breadcrumb */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleBackToPages}
                              className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-surface-2 flex items-center justify-center text-foreground hover:text-primary transition shadow-sm shrink-0"
                              title="Back to Pages List"
                            >
                              &larr;
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="font-display text-lg font-bold text-foreground">{editingPage.title}</h2>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  editingPage.status === 'published'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {editingPage.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Route Path: <span className="font-mono bg-surface-2 px-1 rounded text-primary">/{editingPage.slug}</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <Link
                              href={`/${editingPage.slug === 'home' ? '' : editingPage.slug}`}
                              target="_blank"
                              className="inline-flex items-center justify-center border border-border bg-background hover:bg-surface-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground transition shadow-sm"
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" /> View Public Page
                            </Link>
                            <button
                              onClick={() => setAddSectionOpen(true)}
                              className="inline-flex items-center justify-center bg-surface-2 hover:bg-surface border border-border px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-primary transition shadow-sm"
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" /> Add Section
                            </button>
                            <button
                              onClick={() => savePageContent('draft')}
                              className="inline-flex items-center justify-center border border-border bg-background hover:bg-surface-2 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-primary transition shadow-sm"
                            >
                              Save Draft
                            </button>
                            <button
                              onClick={() => savePageContent('published')}
                              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
                            >
                              Publish Changes
                            </button>
                          </div>
                        </div>

                        {/* Collapsible SEO & Page Settings Panel */}
                        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
                          <details className="group">
                            <summary className="w-full flex items-center justify-between p-4 cursor-pointer select-none font-display font-semibold text-xs text-foreground uppercase tracking-widest bg-surface-2 hover:bg-surface transition">
                              <span className="flex items-center gap-1.5"><Settings className="h-4 w-4 text-primary" /> SEO &amp; Page Configurations</span>
                              <span className="transition-transform group-open:rotate-180 text-muted-foreground font-mono">&#9662;</span>
                            </summary>
                            <div className="p-5 border-t border-border bg-background/40 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Page Title (Navigation)</label>
                                <input
                                  type="text"
                                  value={editingPage.title || ''}
                                  onChange={(e) => handlePageFieldChange('title', e.target.value)}
                                  className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Internal Identifier</label>
                                <input
                                  type="text"
                                  value={editingPage.internalName || ''}
                                  onChange={(e) => handlePageFieldChange('internalName', e.target.value)}
                                  className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Publish Status</label>
                                <select
                                  value={editingPage.status || 'draft'}
                                  onChange={(e) => handlePageFieldChange('status', e.target.value)}
                                  className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none text-foreground bg-surface-2"
                                >
                                  <option value="draft">Draft</option>
                                  <option value="published">Published</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">SEO Header Title</label>
                                <input
                                  type="text"
                                  value={editingPage.seoTitle || ''}
                                  onChange={(e) => handlePageFieldChange('seoTitle', e.target.value)}
                                  className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none"
                                  placeholder="Keywords optimized title"
                                />
                              </div>
                              <div className="space-y-1 xl:col-span-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">SEO Meta Description</label>
                                <input
                                  type="text"
                                  value={editingPage.seoDescription || ''}
                                  onChange={(e) => handlePageFieldChange('seoDescription', e.target.value)}
                                  className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none"
                                  placeholder="Meta details summary (max 260 chars)"
                                />
                              </div>
                              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">SEO Keywords (Comma separated)</label>
                                <input
                                  type="text"
                                  value={Array.isArray(editingPage.seoKeywords) ? editingPage.seoKeywords.join(', ') : editingPage.seoKeywords || ''}
                                  onChange={(e) => handlePageFieldChange('seoKeywords', e.target.value)}
                                  className="w-full px-3 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none"
                                  placeholder="admissions, transfer years, pearson btec"
                                />
                              </div>
                            </div>
                          </details>
                        </div>

                        {/* Page Sections Layout Manager */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-border/80 pb-2">
                            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5"><LayoutDashboard className="h-4 w-4 text-primary" /> Visual Sections Stack ({editingPage.sections?.length || 0})</h3>
                            <span className="text-[10px] text-muted-foreground">Order of blocks matches top-to-bottom rendering on screen</span>
                          </div>

                          {(!editingPage.sections || editingPage.sections.length === 0) ? (
                            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-xs text-muted-foreground">
                              No layout sections found. Click "+ Add Section" to build your first template block.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {editingPage.sections.map((sec, secIdx) => {
                                const isVisible = sec.isVisible !== false && sec.isActive !== false;
                                
                                return (
                                  <div
                                    key={sec._id || `${sec.sectionId}-${secIdx}`}
                                    className={`rounded-2xl border p-4 bg-surface shadow-sm hover:shadow transition flex gap-4 ${
                                      isVisible ? 'border-border' : 'border-dashed border-border/60 bg-surface/40 opacity-70'
                                    }`}
                                  >
                                    {/* Vertical Tactile Reorder Controls */}
                                    <div className="flex flex-col justify-center items-center gap-1 px-1 border-r border-border/60 select-none">
                                      <button
                                        type="button"
                                        disabled={secIdx === 0}
                                        onClick={() => moveSection(secIdx, 'up')}
                                        className="h-7 w-7 rounded bg-surface hover:bg-surface-2 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary transition disabled:opacity-30 disabled:hover:text-muted-foreground"
                                        title="Move Section Up"
                                      >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                      </button>
                                      <span className="text-[9px] font-mono font-bold text-muted-foreground my-0.5">{secIdx + 1}</span>
                                      <button
                                        type="button"
                                        disabled={secIdx === editingPage.sections.length - 1}
                                        onClick={() => moveSection(secIdx, 'down')}
                                        className="h-7 w-7 rounded bg-surface hover:bg-surface-2 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary transition disabled:opacity-30 disabled:hover:text-muted-foreground"
                                        title="Move Section Down"
                                      >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                      </button>
                                    </div>

                                     {/* Section Content & Stats Preview */}
                                     <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                                       <div className="flex flex-wrap items-start justify-between gap-3">
                                         <div className="flex items-start gap-3 min-w-0 flex-1">
                                           {sec.image && (
                                             <div className="h-14 w-20 relative rounded-lg border border-border overflow-hidden shrink-0 bg-surface-2 shadow-xs">
                                               <Img src={sec.image} alt="Section thumbnail" className="object-cover w-full h-full" />
                                             </div>
                                           )}
                                           <div className="min-w-0 flex-1">
                                             <div className="flex flex-wrap items-center gap-2">
                                               <h4 className="font-bold text-sm text-foreground">{sec.sectionName || sec.title || 'Untitled Section'}</h4>
                                               <span className="font-mono text-[9px] bg-surface-2 text-muted-foreground px-1.5 py-0.5 rounded border border-border">ID: {sec.sectionId}</span>
                                               <span className="text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded tracking-wider uppercase">{sec.sectionType || 'CUSTOM'}</span>
                                               {sec.image && (
                                                 <span className="text-[8px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded tracking-wider uppercase">Image Attached</span>
                                               )}
                                             </div>
                                             
                                             {/* Snippet body text preview */}
                                             {(sec.title || sec.description || sec.content) && (
                                               <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 max-w-2xl">
                                                 {sec.title && <span className="font-semibold text-foreground">{sec.title} &bull; </span>}
                                                 {sec.description || sec.content}
                                               </p>
                                             )}
                                           </div>
                                         </div>

                                         <div className="flex items-center gap-1.5 shrink-0 select-none">
                                           <span className={`inline-block h-2 w-2 rounded-full ${isVisible ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                                           <span className="text-[10px] font-semibold text-muted-foreground uppercase">{isVisible ? 'Active' : 'Hidden'}</span>
                                         </div>
                                       </div>

                                       {/* Sub-item thumbnails preview if list items exist */}
                                       {sec.items && sec.items.length > 0 && (
                                         <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                                           <span className="font-bold text-foreground">Cards Grid ({sec.items.length}):</span>
                                           <div className="flex items-center gap-1.5 overflow-hidden max-w-md">
                                             {sec.items.slice(0, 4).map((item, idx) => (
                                               <span key={idx} className="inline-flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded border border-border truncate max-w-[110px] font-medium" title={item.title}>
                                                 {item.image && <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block shrink-0" title="Has thumbnail" />}
                                                 {item.title || `Item ${idx+1}`}
                                               </span>
                                             ))}
                                             {sec.items.length > 4 && <span>+{sec.items.length - 4} more</span>}
                                           </div>
                                         </div>
                                       )}
                                     </div>

                                    {/* Action button menu panel */}
                                    <div className="flex flex-col sm:flex-row items-center gap-1.5 justify-center shrink-0 border-l border-border/60 pl-4 select-none">
                                      <button
                                        type="button"
                                        onClick={() => setEditingSectionIdx(secIdx)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                      >
                                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit Content
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleSectionVisibility(secIdx)}
                                        className="p-1.5 rounded bg-background hover:bg-surface border border-border text-muted-foreground hover:text-foreground transition"
                                        title={isVisible ? 'Hide section from public site' : 'Show section on public site'}
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => duplicateSection(secIdx)}
                                        className="p-1.5 rounded bg-background hover:bg-surface border border-border text-muted-foreground hover:text-foreground transition"
                                        title="Duplicate content block"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removePageSection(secIdx)}
                                        className="p-1.5 rounded bg-red-500/5 hover:bg-red-500 border border-red-500/10 text-red-500 hover:text-white transition"
                                        title="Permanently remove block"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* dashed add section button at stack bottom */}
                          <button
                            type="button"
                            onClick={() => setAddSectionOpen(true)}
                            className="w-full border-2 border-dashed border-border hover:border-primary/50 bg-background/60 hover:bg-surface rounded-2xl py-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-all duration-300"
                          >
                            <Plus className="h-4 w-4" /> Add Preset Section Block
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {/* STICKY SAVE BAR IN PAGE WORKSPACE */}
                  {selectedPageSlug !== null && isPageDirty && (
                    <div className="fixed bottom-6 left-6 right-6 md:left-72 z-40 bg-surface border border-primary/30 shadow-[0_12px_36px_-6px_rgba(185,151,80,0.18)] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Unsaved page edits detected</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Please save or publish these changes to apply them to your database.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                          onClick={() => {
                            setEditingPage(JSON.parse(originalPageData));
                            notify('Edits discarded. Reverted to last saved state.', { tone: 'info', title: 'Edits reverted' });
                          }}
                          className="px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-semibold text-foreground transition"
                        >
                          Discard Edits
                        </button>
                        <button
                          onClick={() => savePageContent('draft')}
                          className="px-4 py-2 border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                          Save Draft
                        </button>
                        <button
                          onClick={() => savePageContent('published')}
                          className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition"
                        >
                          Save &amp; Publish
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DIALOG 1: ADD SECTION TEMPLATE SELECTOR */}
                  <AdminDialog
                    open={addSectionOpen}
                    title="Select Layout Template Block"
                    description="Choose a preset content structure to append to your page builder layout."
                    onClose={() => setAddSectionOpen(false)}
                    maxWidth="max-w-xl"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 pt-2 text-left">
                      <button
                        onClick={() => addNewSectionFromTemplate('hero')}
                        className="p-4 rounded-xl border border-border hover:border-primary bg-background hover:bg-surface-2 text-left space-y-2 transition duration-200"
                      >
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase"><Globe className="h-4 w-4" /> Hero Banner</div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Headline banner with eyebrow subtitles, background slider grids, and clear call-to-action buttons.</p>
                      </button>

                      <button
                        onClick={() => addNewSectionFromTemplate('text_image')}
                        className="p-4 rounded-xl border border-border hover:border-primary bg-background hover:bg-surface-2 text-left space-y-2 transition duration-200"
                      >
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase"><ImageIcon className="h-4 w-4" /> Text + Image Columns</div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Content copy aligned left or right with sidebar graphics, logos, or banner images.</p>
                      </button>

                      <button
                        onClick={() => addNewSectionFromTemplate('cards')}
                        className="p-4 rounded-xl border border-border hover:border-primary bg-background hover:bg-surface-2 text-left space-y-2 transition duration-200"
                      >
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase"><LayoutDashboard className="h-4 w-4" /> Features Cards Grid</div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">A grid list displaying partner university highlights, admissions steps, or success metrics.</p>
                      </button>

                      <button
                        onClick={() => addNewSectionFromTemplate('cta')}
                        className="p-4 rounded-xl border border-border hover:border-primary bg-background hover:bg-surface-2 text-left space-y-2 transition duration-200"
                      >
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase"><Phone className="h-4 w-4" /> CTA Button Block</div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Centered promotional prompt banners inviting prospects to request advisor eligibility check calls.</p>
                      </button>

                      <button
                        onClick={() => addNewSectionFromTemplate('process')}
                        className="p-4 rounded-xl border border-border hover:border-primary bg-background hover:bg-surface-2 text-left space-y-2 transition duration-200"
                      >
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase"><GraduationCap className="h-4 w-4" /> Process Step Ladder</div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Staged numbers (01, 02...) depicting progression transfer steps or admissions checkpoints.</p>
                      </button>
                    </div>
                    <div className="mt-6 flex justify-end border-t border-border pt-4 select-none">
                      <button
                        type="button"
                        onClick={() => setAddSectionOpen(false)}
                        className="px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-semibold text-foreground transition"
                      >
                        Close
                      </button>
                    </div>
                  </AdminDialog>

                  {/* DIALOG 2: SECTION CONTENT EDITOR */}
                  {editingSectionIdx !== null && (
                    <AdminDialog
                      open={editingSectionIdx !== null}
                      title={`Edit Content Block: ${editingPage.sections[editingSectionIdx]?.sectionName || 'Section'}`}
                      description="Modify text copy, upload images, or manage sub-item card lists inside this layout segment."
                      onClose={() => {
                        setEditingSectionIdx(null);
                        setEditingCardIdx(null);
                        setEditingCardItem(null);
                      }}
                      maxWidth="max-w-3xl"
                    >
                      <div className="space-y-5 text-left pt-2 pb-1 overflow-y-auto max-h-[70vh] pr-1">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Unique Section ID</label>
                            <input
                              type="text"
                              value={editingPage.sections[editingSectionIdx].sectionId || ''}
                              onChange={(e) => handlePageSectionChange(editingSectionIdx, 'sectionId', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Section Name / Label</label>
                            <input
                              type="text"
                              value={editingPage.sections[editingSectionIdx].sectionName || ''}
                              onChange={(e) => handlePageSectionChange(editingSectionIdx, 'sectionName', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Title / Heading</label>
                            <input
                              type="text"
                              value={editingPage.sections[editingSectionIdx].title || ''}
                              onChange={(e) => handlePageSectionChange(editingSectionIdx, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Subtitle / Eyebrow</label>
                            <input
                              type="text"
                              value={editingPage.sections[editingSectionIdx].subtitle || ''}
                              onChange={(e) => handlePageSectionChange(editingSectionIdx, 'subtitle', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description / Content Body Copy</label>
                          <textarea
                            rows={3}
                            value={editingPage.sections[editingSectionIdx].description || ''}
                            onChange={(e) => handlePageSectionChange(editingSectionIdx, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs"
                          />
                        </div>

                        {editingPage.sections[editingSectionIdx].content !== undefined && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Extra Content Block (Optional)</label>
                            <textarea
                              rows={2}
                              value={editingPage.sections[editingSectionIdx].content || ''}
                              onChange={(e) => handlePageSectionChange(editingSectionIdx, 'content', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs"
                            />
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Content Alignment</label>
                            <select
                              value={editingPage.sections[editingSectionIdx].alignment || 'left'}
                              onChange={(e) => handlePageSectionChange(editingSectionIdx, 'alignment', e.target.value)}
                              className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs text-foreground bg-surface-2"
                            >
                              <option value="left">Left Align</option>
                              <option value="center">Center Align</option>
                              <option value="right">Right Align</option>
                            </select>
                          </div>

                          {/* Section Image Uploader (WebP compress) */}
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Featured Banner Image</label>
                            <div className="flex items-center gap-3 border border-border rounded-xl p-3 bg-surface shadow-sm">
                              {editingPage.sections[editingSectionIdx].image ? (
                                <div className="h-12 w-20 relative rounded border overflow-hidden shrink-0">
                                  <Img src={editingPage.sections[editingSectionIdx].image} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                              ) : (
                                <div className="h-12 w-20 rounded border bg-surface-2 flex items-center justify-center shrink-0 text-muted-foreground text-[10px]">No image</div>
                              )}
                              <div className="min-w-0 flex-1 space-y-1">
                                <input
                                  type="text"
                                  placeholder="Path or URL..."
                                  value={editingPage.sections[editingSectionIdx].image || ''}
                                  onChange={(e) => handlePageSectionChange(editingSectionIdx, 'image', e.target.value)}
                                  className="w-full px-2 py-1 border border-border rounded text-[10px] font-mono truncate"
                                />
                                <div className="flex gap-2">
                                  <label className="cursor-pointer inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-primary hover:text-white transition">
                                    <Upload className="h-3 w-3" /> Select File
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          void handleImageUpload(editingSectionIdx, null, file);
                                        }
                                      }}
                                    />
                                  </label>
                                  {editingPage.sections[editingSectionIdx].image && (
                                    <button
                                      onClick={() => handlePageSectionChange(editingSectionIdx, 'image', '')}
                                      className="text-[10px] font-bold text-red-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECTION SUB-ITEMS (CARDS/BUTTONS) LIST ACCORDION */}
                        <div className="space-y-3 pt-3 border-t border-border">
                          <div className="flex justify-between items-center">
                            <h4 className="font-display text-[11px] font-bold text-foreground uppercase tracking-widest">Grid Items / Call-to-Action Buttons</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPage((current) => {
                                  if (!current) return current;
                                  const sections = [...(current.sections || [])];
                                  const items = [...(sections[editingSectionIdx]?.items || [])];
                                  items.push({
                                    title: 'New Card item',
                                    subtitle: '',
                                    content: 'Card item description body text copy.',
                                    buttonText: 'Learn More',
                                    buttonUrl: '#',
                                    isActive: true,
                                  });
                                  sections[editingSectionIdx] = {
                                    ...sections[editingSectionIdx],
                                    items,
                                  };
                                  return { ...current, sections };
                                });
                                notify('New card added at the bottom.', { tone: 'success', title: 'Card added' });
                              }}
                              className="inline-flex items-center justify-center gap-1 rounded border border-primary/20 bg-primary/15 hover:bg-primary text-primary hover:text-white px-2.5 py-1 text-[10px] font-bold transition"
                            >
                              <Plus className="h-3 w-3" /> Add Item Card
                            </button>
                          </div>

                          {(!editingPage.sections[editingSectionIdx].items || editingPage.sections[editingSectionIdx].items.length === 0) ? (
                            <p className="text-xs text-muted-foreground italic border border-dashed border-border p-4 text-center rounded-xl">No grid items or button cards configured in this section.</p>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {editingPage.sections[editingSectionIdx].items.map((item, itemIdx) => {
                                const isCardActive = item.isActive !== false;
                                const isEditingThisCard = editingCardIdx === itemIdx;
                                
                                return (
                                  <div key={item._id || `${editingSectionIdx}-item-${itemIdx}`} className="p-3 border border-border rounded-xl bg-surface-2 space-y-3">
                                    <div className="flex justify-between items-center gap-2 select-none">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">Card {itemIdx + 1}</span>
                                        <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">{item.title || 'Untitled'}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        {/* Card reorder up/down */}
                                        <button
                                          type="button"
                                          disabled={itemIdx === 0}
                                          onClick={() => {
                                            setEditingPage((current) => {
                                              if (!current) return current;
                                              const sections = [...(current.sections || [])];
                                              const items = [...(sections[editingSectionIdx]?.items || [])];
                                              [items[itemIdx], items[itemIdx - 1]] = [items[itemIdx - 1], items[itemIdx]];
                                              sections[editingSectionIdx] = { ...sections[editingSectionIdx], items };
                                              return { ...current, sections };
                                            });
                                          }}
                                          className="p-1 rounded bg-background border border-border text-muted-foreground disabled:opacity-40"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          disabled={itemIdx === editingPage.sections[editingSectionIdx].items.length - 1}
                                          onClick={() => {
                                            setEditingPage((current) => {
                                              if (!current) return current;
                                              const sections = [...(current.sections || [])];
                                              const items = [...(sections[editingSectionIdx]?.items || [])];
                                              [items[itemIdx], items[itemIdx + 1]] = [items[itemIdx + 1], items[itemIdx]];
                                              sections[editingSectionIdx] = { ...sections[editingSectionIdx], items };
                                              return { ...current, sections };
                                            });
                                          }}
                                          className="p-1 rounded bg-background border border-border text-muted-foreground disabled:opacity-40"
                                        >
                                          ▼
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isEditingThisCard) {
                                              setEditingCardIdx(null);
                                              setEditingCardItem(null);
                                            } else {
                                              setEditingCardIdx(itemIdx);
                                              setEditingCardItem({ ...item });
                                            }
                                          }}
                                          className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition"
                                        >
                                          {isEditingThisCard ? 'Collapse' : 'Edit Fields'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingPage((current) => {
                                              if (!current) return current;
                                              const sections = [...(current.sections || [])];
                                              const items = [...(sections[editingSectionIdx]?.items || [])];
                                              items.splice(itemIdx, 1);
                                              sections[editingSectionIdx] = { ...sections[editingSectionIdx], items };
                                              return { ...current, sections };
                                            });
                                            notify('Card removed from list.', { tone: 'info', title: 'Card removed' });
                                          }}
                                          className="p-1 text-red-500 rounded hover:bg-red-500/5 transition border border-red-500/10"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Expanded Item Form Fields */}
                                    {isEditingThisCard && (
                                      <div className="grid gap-3 border-t border-border/40 pt-3 text-xs bg-background/50 p-3 rounded-lg animate-in fade-in duration-200">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                          <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground">Title</label>
                                            <input
                                              type="text"
                                              value={item.title || ''}
                                              onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'title', e.target.value)}
                                              className="w-full px-2.5 py-1.5 border border-border bg-background rounded-lg text-xs"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground">Subtitle / Eyebrow</label>
                                            <input
                                              type="text"
                                              value={item.subtitle || ''}
                                              onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'subtitle', e.target.value)}
                                              className="w-full px-2.5 py-1.5 border border-border bg-background rounded-lg text-xs"
                                            />
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[9px] uppercase font-bold text-muted-foreground">Description Content</label>
                                          <textarea
                                            rows={2}
                                            value={item.content || ''}
                                            onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'content', e.target.value)}
                                            className="w-full px-2.5 py-1.5 border border-border bg-background rounded-lg text-xs"
                                          />
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                          <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground">Button URL / Link</label>
                                            <input
                                              type="text"
                                              value={item.buttonUrl || item.link || ''}
                                              onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'buttonUrl', e.target.value)}
                                              className="w-full px-2.5 py-1.5 border border-border bg-background rounded-lg text-xs font-mono"
                                              placeholder="/contact"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground">Button Text</label>
                                            <input
                                              type="text"
                                              value={item.buttonText || ''}
                                              onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'buttonText', e.target.value)}
                                              className="w-full px-2.5 py-1.5 border border-border bg-background rounded-lg text-xs"
                                              placeholder="Explore"
                                            />
                                          </div>
                                        </div>

                                        {/* Card Image File Picker */}
                                        <div className="space-y-1 border border-border rounded-lg p-3 bg-surface">
                                          <label className="text-[9px] uppercase font-bold text-muted-foreground block">Thumbnail Image</label>
                                          <div className="flex items-center gap-2 mt-1 flex-wrap sm:flex-nowrap">
                                            {item.image ? (
                                              <div className="h-10 w-16 relative rounded border overflow-hidden shrink-0">
                                                <Img src={item.image} alt="Thumbnail preview" className="object-cover w-full h-full" />
                                              </div>
                                            ) : (
                                              <div className="h-10 w-16 rounded border bg-surface-2 flex items-center justify-center shrink-0 text-muted-foreground text-[8px] font-bold">No image</div>
                                            )}
                                            <input
                                              type="text"
                                              value={item.image || ''}
                                              onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'image', e.target.value)}
                                              className="min-w-0 flex-1 px-2 py-1.5 border border-border rounded text-[10px] font-mono truncate bg-surface-2"
                                              placeholder="https://..."
                                            />
                                            <label className="cursor-pointer inline-flex items-center shrink-0 gap-1 rounded bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] font-bold text-primary transition hover:bg-primary hover:text-white">
                                              <Upload className="h-3 w-3" /> Upload
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    void handleImageUpload(editingSectionIdx, itemIdx, file);
                                                  }
                                                }}
                                              />
                                            </label>
                                            {item.image && (
                                              <button
                                                type="button"
                                                onClick={() => handlePageItemChange(editingSectionIdx, itemIdx, 'image', '')}
                                                className="text-[10px] font-bold text-red-500 hover:underline"
                                              >
                                                Remove
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`active-card-${itemIdx}`}
                                            checked={isCardActive}
                                            onChange={(e) => handlePageItemChange(editingSectionIdx, itemIdx, 'isActive', e.target.checked)}
                                          />
                                          <label htmlFor={`active-card-${itemIdx}`} className="text-[10px] font-bold uppercase text-muted-foreground cursor-pointer select-none">Active Visibility on Site</label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end border-t border-border pt-4 select-none">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSectionIdx(null);
                            setEditingCardIdx(null);
                            setEditingCardItem(null);
                            notify('Section edits applied to draft. Click Save Draft or Publish Changes to save.', {
                              tone: 'success',
                              title: 'Edits applied',
                            });
                          }}
                          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-sm transition"
                        >
                          Apply Section Edits
                        </button>
                      </div>
                    </AdminDialog>
                  )}
                </div>
              )}

              {/* TAB 5: SERVICES / Progression partners */}
              {activeTab === 'services' && (
                <div className="space-y-8">
                  {/* Universities list */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">Partner Universities Explorer</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage partner universities that appear in the website explorer tool.</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingUni(null);
                          setUniForm({
                            name: '', city: '', country: 'United Kingdom', subjects: '', 
                            pathway: 'BTEC HND', transferYear: 'Year 2 or 3', 
                            awardingBody: 'Pearson', costLakhsMin: 45, costLakhsMax: 60, emiMonthly: 40000,
                            description: ''
                          });
                          setUniFormOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition"
                      >
                        <Plus className="h-4 w-4" /> Add Partner University
                      </button>
                    </div>

                    <div className="border border-border rounded-xl bg-surface overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-surface-2 border-b border-border font-semibold text-muted-foreground">
                            <th className="p-3">Partner Name</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Transfer Details</th>
                            <th className="p-3">Cost range (INR)</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {universities.map(uni => (
                            <tr key={uni._id} className="border-b border-border/60 hover:bg-surface-2/40 transition">
                              <td className="p-3 font-semibold text-foreground">{uni.name}</td>
                              <td className="p-3 text-muted-foreground">{uni.city}, {uni.country}</td>
                              <td className="p-3">
                                <span className="font-medium text-foreground">{uni.transferYear}</span> &bull; <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{uni.awardingBody}</span>
                              </td>
                              <td className="p-3 font-semibold text-primary">₹{uni.costLakhsMin}–{uni.costLakhsMax} Lakhs</td>
                              <td className="p-3 text-right space-x-2">
                                <button 
                                  onClick={() => {
                                    setEditingUni(uni);
                                    setUniForm({
                                      ...uni,
                                      subjects: Array.isArray(uni.subjects) ? uni.subjects.join(', ') : String(uni.subjects || '')
                                    });
                                    setUniFormOpen(true);
                                  }}
                                  className="text-muted-foreground hover:text-primary transition p-1"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUniversity(uni._id)}
                                  className="text-muted-foreground hover:text-red-500 transition p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Success stories list */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">Success Stories (Student Journeys)</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage student progression records displayed on the public Success page.</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingStory(null);
                          setStoryForm({ initials: '', startPoint: '', pathway: '', destination: '', outcome: '' });
                          setStoryFormOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition"
                      >
                        <Plus className="h-4 w-4" /> Add Success Story
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {stories.map(story => (
                        <div key={story._id} className="p-4 border border-border bg-surface-2 rounded-xl flex justify-between items-start transition-all hover:border-primary/40 hover:-translate-y-0.5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{story.initials} &bull; {story.startPoint}</span>
                            <h4 className="font-bold text-sm text-foreground">{story.pathway}</h4>
                            <p className="text-xs font-semibold text-foreground">Moved to: {story.destination}</p>
                            {story.outcome && <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/60 pt-2 font-display">{story.outcome}</p>}
                          </div>
                          <div className="flex gap-1.5 shrink-0 ml-4">
                            <button 
                              onClick={() => {
                                  setEditingStory(story);
                                  setStoryForm(story);
                                  setStoryFormOpen(true);
                              }}
                              className="p-1 rounded-lg border border-border bg-background text-muted-foreground hover:text-primary transition"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteStory(story._id)}
                              className="p-1 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* University Dialog form */}
                  <AdminDialog
                    open={uniFormOpen}
                    title={editingUni ? 'Edit University Details' : 'Add Progression University'}
                    description="Fill out the partner university metrics for database filters."
                    onClose={closeUniversityModal}
                    maxWidth="max-w-xl"
                  >
                    <form onSubmit={saveUniversity} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Name</label>
                          <input type="text" required value={uniForm.name} onChange={(e) => setUniForm({...uniForm, name: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">City</label>
                          <input type="text" required value={uniForm.city} onChange={(e) => setUniForm({...uniForm, city: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Country</label>
                          <select value={uniForm.country} onChange={(e) => setUniForm({...uniForm, country: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs text-foreground">
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                            <option value="Canada">Canada</option>
                            <option value="Ireland">Ireland</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Awarding Body</label>
                          <select value={uniForm.awardingBody} onChange={(e) => setUniForm({...uniForm, awardingBody: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs text-foreground">
                            <option value="Pearson">Pearson</option>
                            <option value="ATHE">ATHE</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Subject Tracks (Comma separated)</label>
                        <input type="text" required value={uniForm.subjects} onChange={(e) => setUniForm({...uniForm, subjects: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="Business, Computing, Engineering" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>
                        <textarea rows={3} value={uniForm.description || ''} onChange={(e) => setUniForm({...uniForm, description: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="Campuses, courses highlights..." />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Min Cost (Lakhs)</label>
                          <input type="number" required value={uniForm.costLakhsMin} onChange={(e) => setUniForm({...uniForm, costLakhsMin: Number(e.target.value)})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Max Cost (Lakhs)</label>
                          <input type="number" required value={uniForm.costLakhsMax} onChange={(e) => setUniForm({...uniForm, costLakhsMax: Number(e.target.value)})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">EMI (/month)</label>
                          <input type="number" required value={uniForm.emiMonthly} onChange={(e) => setUniForm({...uniForm, emiMonthly: Number(e.target.value)})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-3 border-t border-border">
                        <button type="button" onClick={closeUniversityModal} className="px-4 py-2 border border-border rounded-xl text-xs font-semibold">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow">Save</button>
                      </div>
                    </form>
                  </AdminDialog>

                  {/* Success Story Dialog Form */}
                  <AdminDialog
                    open={storyFormOpen}
                    title={editingStory ? 'Edit Student Journey' : 'Add Success Journey'}
                    description="Record a student's outcome to inspire future pathway candidates."
                    onClose={closeStoryModal}
                    maxWidth="max-w-md"
                  >
                    <form onSubmit={saveStory} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Initials</label>
                          <input type="text" required value={storyForm.initials} onChange={(e) => setStoryForm({...storyForm, initials: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="e.g. S.K." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Start Point</label>
                          <input type="text" required value={storyForm.startPoint} onChange={(e) => setStoryForm({...storyForm, startPoint: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="e.g. Hyderabad, India" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Pathway Taken</label>
                        <input type="text" required value={storyForm.pathway} onChange={(e) => setStoryForm({...storyForm, pathway: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="e.g. ATHE Level 5 Diploma" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Destination University</label>
                        <input type="text" required value={storyForm.destination} onChange={(e) => setStoryForm({...storyForm, destination: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="e.g. Coventry University, UK" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Outcome details</label>
                        <textarea rows={3} value={storyForm.outcome} onChange={(e) => setStoryForm({...storyForm, outcome: e.target.value})} className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" placeholder="Career placement, post-grad, etc." />
                      </div>
                      <div className="flex gap-2 justify-end pt-3 border-t border-border">
                        <button type="button" onClick={closeStoryModal} className="px-4 py-2 border border-border rounded-xl text-xs font-semibold">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow">Save</button>
                      </div>
                    </form>
                  </AdminDialog>

                </div>
              )}

              {/* TAB 6: MEDIA LIBRARY */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="border-b border-border pb-4 mb-6 flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">Media Library</h2>
                        <p className="text-xs text-muted-foreground mt-1">Upload, replace, copy URLs, and preview image and video files used on the website.</p>
                      </div>
                      
                      {/* Search and upload triggers */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="search"
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                          placeholder="Search media files..."
                          className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                        />
                        <button
                          onClick={loadMediaItems}
                          className="p-2 border border-border rounded-xl bg-background text-muted-foreground hover:text-primary transition"
                          title="Refresh Library"
                        >
                          <RefreshCw className={`h-4 w-4 ${mediaItemsLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Drag-drop or Select uploader form */}
                    <form onSubmit={handleMediaUploadSubmit} className="p-5 border border-dashed border-border rounded-2xl bg-surface-2 flex items-center justify-between gap-4 mb-6 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Upload file to media library</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Images are auto-compressed to WebP for fast performance.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          id="media_library_uploader"
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => setMediaUploadFile(e.target.files?.[0] || null)}
                          className="text-xs text-muted-foreground border border-border bg-background rounded-lg p-1.5 w-full sm:w-auto"
                        />
                        <button
                          disabled={saving || !mediaUploadFile}
                          type="submit"
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow disabled:opacity-60 transition"
                        >
                          Upload File
                        </button>
                      </div>
                    </form>

                    {/* Media files grid list */}
                    {mediaItemsLoading ? (
                      <div className="flex justify-center items-center py-20">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredMediaItems.length === 0 ? (
                      <p className="text-center py-20 border border-dashed border-border rounded-xl text-muted-foreground text-xs bg-surface-2/40">
                        No files in the library matching criteria.
                      </p>
                    ) : (
                      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {filteredMediaItems.map((item) => {
                          const fileUrl = item.url.startsWith('/') ? `${API_BASE}${item.url}` : item.url;
                          const relativeUrl = item.url;
                          const isImage = item.mimeType?.startsWith('image/') || item.resourceType === 'image';
                          
                          return (
                            <div key={item._id} className="group border border-border bg-surface-2 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-sm hover:border-primary/50 hover:shadow transition relative">
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/80 bg-background flex items-center justify-center shrink-0">
                                {isImage ? (
                                  <Img src={item.url} alt={item.altText || item.originalName} className="object-cover w-full h-full transition duration-300 group-hover:scale-105" />
                                ) : (
                                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                    <ImageIcon className="h-8 w-8" />
                                    <span className="text-[9px] uppercase font-bold">{item.format || 'file'}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-3 space-y-1">
                                <p className="text-xs font-semibold text-foreground truncate" title={item.originalName}>{item.originalName}</p>
                                <p className="text-[9px] text-muted-foreground uppercase">{item.provider} &bull; {(item.size / 1024).toFixed(1)} KB</p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-border flex justify-between gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(relativeUrl, 'relative path')}
                                  className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-background hover:bg-primary/10 border border-border text-[9px] font-bold text-foreground hover:text-primary py-1 transition"
                                  title="Copy relative path for page builder"
                                >
                                  <Clipboard className="h-2.5 w-2.5" /> Path
                                </button>
                                <button
                                  type="button"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                  className="p-1 rounded bg-background hover:bg-surface border border-border text-muted-foreground hover:text-primary transition"
                                  title="Open in new window"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMediaDelete(item._id, item.originalName)}
                                  className="p-1 rounded bg-red-500/5 hover:bg-red-500 border border-red-500/10 text-red-500 hover:text-white transition animate-in"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: CRM CHATBOT MANAGEMENT */}
              {activeTab === 'chatbot' && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
                    <div className="border-b border-border pb-4">
                      <h2 className="font-display text-2xl font-bold text-foreground">Third-Party CRM Chatbot Management</h2>
                      <p className="text-xs text-muted-foreground mt-1">Configure and manage the external chat widget URL that renders on the public college site.</p>
                    </div>

                    {chatbotSaveSuccess && (
                      <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-xs font-semibold text-green-500 flex items-center gap-2">
                        <Check className="h-4 w-4" /> {chatbotSaveSuccess}
                      </div>
                    )}

                    {chatbotSaveError && (
                      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-500">
                        {chatbotSaveError}
                      </div>
                    )}

                    <form onSubmit={saveChatbotSettings} className="space-y-6">
                      
                      <div className="p-5 rounded-2xl bg-surface-2 border border-border flex justify-between items-center gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground block uppercase tracking-wider">Chatbot Visibility Status</label>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">Toggle whether the chatbot widget should show on the public website.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setChatbotEnabledInput(!chatbotEnabledInput)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            chatbotEnabledInput ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              chatbotEnabledInput ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="chatbot_url_input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">CRM Chatbot Iframe URL</label>
                        <input
                          id="chatbot_url_input"
                          type="text"
                          value={chatbotUrlInput}
                          onChange={(e) => setChatbotUrlInput(e.target.value)}
                          placeholder="https://third-party-crm.com/chat/xxxxx"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                        />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Provide the iframe embed or chat page URL generated by your CRM platform (e.g. HubSpot, Zoho, Freshchat).
                        </p>
                      </div>

                      {/* URL format dynamic verification label */}
                      {chatbotUrlInput.trim() && (
                        <div className="flex items-center gap-1.5 text-xs">
                          {isValidHttpUrl(chatbotUrlInput.trim()) ? (
                            <span className="text-green-500 font-semibold flex items-center gap-1">✓ Valid URL format</span>
                          ) : (
                            <span className="text-red-400 font-semibold">✗ Invalid URL format (must begin with http:// or https://)</span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-semibold text-white shadow transition disabled:opacity-60"
                        >
                          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Save Changes
                        </button>
                        <button
                          type="button"
                          disabled={!chatbotUrlInput.trim() || !isValidHttpUrl(chatbotUrlInput.trim())}
                          onClick={() => setPreviewChatbotOpen(true)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background hover:bg-surface-2 px-5 py-3 text-xs font-semibold text-foreground transition disabled:opacity-50"
                        >
                          <Eye className="h-4 w-4" /> Live Preview Widget
                        </button>
                      </div>

                    </form>

                    {/* Chatbot preview panel mock-up device */}
                    {previewChatbotOpen && (
                      <div className="border border-border bg-background/50 rounded-2xl p-6 relative">
                        <button 
                          onClick={() => setPreviewChatbotOpen(false)}
                          className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:underline"
                        >
                          Close Preview
                        </button>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Chat Widget preview</h4>
                        
                        <div className="flex justify-center">
                          {/* Simulated Mobile Device Preview */}
                          <div className="w-[360px] h-[580px] rounded-3xl border-8 border-gray-800 bg-surface shadow-xl overflow-hidden flex flex-col relative">
                            {/* Device top bar */}
                            <div className="bg-gray-800 h-6 flex justify-center items-center">
                              <span className="h-2 w-12 rounded-full bg-gray-600 block" />
                            </div>
                            
                            {/* Device content container */}
                            <div className="flex-1 bg-surface-2 flex flex-col justify-end p-4">
                              <p className="text-center text-xs text-muted-foreground my-auto px-4">
                                Simulated public page viewport. The floating chat widget bubble is rendered at the bottom right.
                              </p>
                              
                              {/* FLOATING SIMULATED CHATBOX CONTAINER */}
                              <div className="rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col h-[400px] w-full animate-in slide-in-from-bottom duration-300">
                                <div className="bg-primary px-3 py-2 text-white flex justify-between items-center">
                                  <span className="text-[11px] font-bold">Cornerstone Admissions Bot</span>
                                  <span className="h-2 w-2 rounded-full bg-green-400 block" />
                                </div>
                                <div className="flex-1 bg-background">
                                  <iframe
                                    src={chatbotUrlInput.trim()}
                                    title="Admissions chatbot preview"
                                    className="w-full h-full border-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 8: CONTACT DETAILS */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="border-b border-border pb-4 mb-6">
                      <h2 className="font-display text-2xl font-bold text-foreground">Contact &amp; Campus Settings</h2>
                      <p className="text-xs text-muted-foreground mt-1">Configure campus locations, support emails, map coordinates, and auto-reply templates.</p>
                    </div>

                    <form onSubmit={saveContact} className="space-y-6">
                      
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Office Campus Address</label>
                          <textarea
                            required
                            value={contactSettings.officeAddress}
                            onChange={(e) => setContactSettings({ ...contactSettings, officeAddress: e.target.value })}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="Campus address details..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Working Hours / Availability</label>
                          <input
                            required
                            value={contactSettings.workingHours}
                            onChange={(e) => setContactSettings({ ...contactSettings, workingHours: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="e.g. Mon-Sat, 9:00 AM to 6:00 PM"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Admissions Helpline Number</label>
                          <input
                            required
                            value={contactSettings.phoneNumber}
                            onChange={(e) => setContactSettings({ ...contactSettings, phoneNumber: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">WhatsApp Query Number</label>
                          <input
                            required
                            value={contactSettings.whatsappNumber}
                            onChange={(e) => setContactSettings({ ...contactSettings, whatsappNumber: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Primary Email</label>
                          <input
                            required
                            value={contactSettings.email}
                            onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="hello@college.edu"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Support Help Email</label>
                          <input
                            required
                            value={contactSettings.supportEmail}
                            onChange={(e) => setContactSettings({ ...contactSettings, supportEmail: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="support@college.edu"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Google Map Embed Link (Custom iframe URL)</label>
                          <input
                            value={contactSettings.googleMapEmbed}
                            onChange={(e) => setContactSettings({ ...contactSettings, googleMapEmbed: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="https://google.com/maps/embed..."
                          />
                          <span className="text-[9px] text-muted-foreground block">Leave blank to auto-generate maps embed using coordinates or address.</span>
                        </div>
                        <div className="grid gap-3 grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Latitude</label>
                            <input
                              value={contactSettings.latitude || ''}
                              onChange={(e) => setContactSettings({ ...contactSettings, latitude: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="12.9716"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Longitude</label>
                            <input
                              value={contactSettings.longitude || ''}
                              onChange={(e) => setContactSettings({ ...contactSettings, longitude: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="77.5946"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border">
                        <button
                          disabled={saving}
                          type="submit"
                          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition"
                        >
                          Save Contact Details
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

              {/* TAB 9: GLOBAL SETTINGS & SEO */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* SEO & IDENTITY */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="border-b border-border pb-4 mb-6">
                      <h2 className="font-display text-2xl font-bold text-foreground">Global SEO &amp; Identity</h2>
                      <p className="text-xs text-muted-foreground mt-1">Configure meta tags, verification tokens, tracking pixels, and social handles.</p>
                    </div>

                    <form onSubmit={saveSiteSettings} className="space-y-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Site Information</h3>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Site Brand Name</label>
                            <input
                              required
                              value={siteSettings.siteName}
                              onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Site Base URL</label>
                            <input
                              required
                              value={siteSettings.siteUrl}
                              onChange={(e) => setSiteSettings({ ...siteSettings, siteUrl: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="https://college.edu"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Site Keywords</label>
                            <input
                              value={siteSettings.siteKeywords}
                              onChange={(e) => setSiteSettings({ ...siteSettings, siteKeywords: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="study abroad, pathway college"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Meta Description</label>
                            <textarea
                              required
                              value={siteSettings.siteDescription}
                              onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                              rows={4}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Tracking &amp; Analytics IDs</h3>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Google Analytics ID (G-XXXXXXXXXX)</label>
                            <input
                              value={siteSettings.googleAnalyticsId}
                              onChange={(e) => setSiteSettings({ ...siteSettings, googleAnalyticsId: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="G-XXXXXXXXXX"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Google Tag Manager ID (GTM-XXXXXXX)</label>
                            <input
                              value={siteSettings.googleTagManagerId}
                              onChange={(e) => setSiteSettings({ ...siteSettings, googleTagManagerId: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              placeholder="GTM-XXXXXXX"
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">Facebook Pixel ID</label>
                              <input
                                value={siteSettings.facebookPixelId}
                                onChange={(e) => setSiteSettings({ ...siteSettings, facebookPixelId: e.target.value })}
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">Microsoft Clarity ID</label>
                              <input
                                value={siteSettings.microsoftClarityId}
                                onChange={(e) => setSiteSettings({ ...siteSettings, microsoftClarityId: e.target.value })}
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="grid gap-6 lg:grid-cols-2 border-t border-border pt-6">
                        
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Search Engine Verifications</h3>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Google Site Verification Code</label>
                            <input
                              value={siteSettings.googleSiteVerification}
                              onChange={(e) => setSiteSettings({ ...siteSettings, googleSiteVerification: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Bing Site Verification Code</label>
                            <input
                              value={siteSettings.bingSiteVerification}
                              onChange={(e) => setSiteSettings({ ...siteSettings, bingSiteVerification: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Social Handles URLs</h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">Facebook Link</label>
                              <input value={siteSettings.facebookUrl} onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">Instagram Link</label>
                              <input value={siteSettings.instagramUrl} onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">LinkedIn Link</label>
                              <input value={siteSettings.linkedinUrl} onChange={(e) => setSiteSettings({ ...siteSettings, linkedinUrl: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">Twitter Link</label>
                              <input value={siteSettings.twitterUrl} onChange={(e) => setSiteSettings({ ...siteSettings, twitterUrl: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs" />
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border">
                        <button
                          disabled={saving}
                          type="submit"
                          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition"
                        >
                          Save SEO Settings
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* BRANDING & STYLING */}
                  <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="border-b border-border pb-4 mb-6">
                      <h2 className="font-display text-2xl font-bold text-foreground">Website Branding &amp; Logo Settings</h2>
                      <p className="text-xs text-muted-foreground mt-1">Configure company name, theme preference, color palette indicators, and footer copyrights.</p>
                    </div>

                    <form onSubmit={saveWebsite} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">College / Website Name</label>
                          <input
                            required
                            value={websiteSettings.websiteName}
                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, websiteName: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="e.g. Cornerstone"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Copyright Notice text</label>
                          <input
                            value={websiteSettings.copyright}
                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, copyright: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="&copy; 2026 Cornerstone Pathway College."
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">College Logo Image URL</label>
                          <div className="flex items-center gap-2">
                            <input
                              value={websiteSettings.logo}
                              onChange={(e) => setWebsiteSettings({ ...websiteSettings, logo: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm flex-1"
                              placeholder="/assets/logo.svg"
                            />
                            <label className="shrink-0 cursor-pointer inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
                              <Upload className="h-4 w-4" /> Upload
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  void handleAssetUpload(file, (url) => {
                                    setWebsiteSettings((prev) => ({ ...prev, logo: url }));
                                  }, `Branding Logo`);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Branding Theme Mode</label>
                          <select
                            value={websiteSettings.theme}
                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, theme: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
                          >
                            <option value="system">System (Default)</option>
                            <option value="light">Light Theme Only</option>
                            <option value="dark">Dark Theme Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2 border-t border-border pt-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Lead Capture External URL (Wizard/Google Form link)</label>
                          <input
                            value={websiteSettings.demoFormUrl}
                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, demoFormUrl: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Branding Palette Theme Color</label>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="color"
                              value={websiteSettings.primaryColor || '#B99750'}
                              onChange={(e) => setWebsiteSettings({ ...websiteSettings, primaryColor: e.target.value })}
                              className="h-10 w-full rounded border border-border"
                            />
                            <div className="text-xs flex items-center justify-center border border-border rounded-lg bg-surface-2 font-mono">
                              {websiteSettings.primaryColor || '#B99750'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border">
                        <button
                          disabled={saving}
                          type="submit"
                          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition"
                        >
                          Save Branding Details
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
