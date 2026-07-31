"use client";

import React, { useDeferredValue, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../services/auth';
import api from '../../../services/api';
import AdminDialog from '../../../components/admin/AdminDialog';
import { useAdminFeedback } from '../../../components/admin/AdminFeedbackProvider';
import {
  validatePageDraft,
  validateStoryForm,
  validateUniversityForm,
} from '../../../lib/adminValidation';
import {
  Inbox, FileText, GraduationCap, Compass, Sparkles, LogOut,
  Trash2, Edit, Plus, Check, RefreshCw, Upload, Eye
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const createEmptySection = () => ({
  sectionId: 'intro',
  title: '',
  subtitle: '',
  content: '',
  image: '',
  isVisible: true,
  items: [],
});

const normalizeSection = (section) => {
  if (!section) return section;

  return String(section.sectionId || '').trim() === 'hero'
    ? { ...section, sectionId: 'intro' }
    : section;
};

const titleizeSlug = (slug = '') =>
  slug
    .toString()
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || 'Untitled Page';

const buildPageDraft = (slug) => {
  return {
    slug,
    title: titleizeSlug(slug),
    description: '',
    metaDescription: '',
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
    description: page?.description || fallback.description,
    metaDescription: page?.metaDescription || fallback.metaDescription,
    sections: Array.isArray(page?.sections) && page.sections.length > 0
      ? page.sections.map(normalizeSection)
      : fallback.sections,
  };
};

const inquiryTypeLabel = {
  contact: 'Contact',
  consultation: 'Consultation',
  pathway: 'Pathway',
  eligibility: 'Eligibility',
};

const inquiryStatusLabel = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived',
};

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { notify, confirm } = useAdminFeedback();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('inquiries');
  const [searchTerm, setSearchTerm] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Core CMS Data states
  const [inquiries, setInquiries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [stories, setStories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  // Editing States
  const [editingPage, setEditingPage] = useState(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState('home');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // University Form states
  const [uniFormOpen, setUniFormOpen] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [uniForm, setUniForm] = useState({
    name: '', city: '', country: 'United Kingdom', subjects: '', 
    pathway: 'BTEC HND', transferYear: 'Year 2 or 3', 
    awardingBody: 'Pearson', costLakhsMin: 45, costLakhsMax: 60, emiMonthly: 40000
  });

  // Success Story Form states
  const [storyFormOpen, setStoryFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyForm, setStoryForm] = useState({
    initials: '', startPoint: '', pathway: '', destination: '', outcome: ''
  });

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

  // Fetch all dashboard data
  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [inqRes, uniRes, storyRes, destRes] = await Promise.allSettled([
        api.get('/inquiries'),
        api.get('/universities'),
        api.get('/success-stories'),
        api.get('/destinations')
      ]);

      if (inqRes.status === 'fulfilled') {
        setInquiries(Array.isArray(inqRes.value.data) ? inqRes.value.data : []);
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
    } catch (err) {
      console.error('Error fetching dashboard datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPageContent = async (slug) => {
    setPageLoading(true);
    try {
      const pageRes = await api.get(`/pages/${slug}`);
      setEditingPage(normalizePageDraft(pageRes.data, slug));
    } catch (err) {
      if (err.response?.status === 404) {
        setEditingPage(buildPageDraft(slug));
      } else {
        console.error(`Error fetching page content for ${slug}:`, err);
        setEditingPage(null);
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
    if (user) {
      loadPageContent(selectedPageSlug);
    }
  }, [user, selectedPageSlug]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Inquiry actions
  const markInquiryStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      setInquiries((prev) => prev.map((i) => (i._id === id ? { ...i, status } : i)));
      setSelectedInquiry((current) => (current?._id === id ? { ...current, status } : current));
      notify(`Lead marked as ${status}.`, {
        tone: 'success',
        title: 'Lead updated',
      });
    } catch (err) {
      console.error('Error updating status:', err);
      notify(err.response?.data?.message || 'Unable to update lead status.', {
        tone: 'error',
        title: 'Status update failed',
      });
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
      notify('The inquiry was deleted successfully.', {
        tone: 'success',
        title: 'Lead deleted',
      });
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      notify(err.response?.data?.message || 'Unable to delete this inquiry.', {
        tone: 'error',
        title: 'Delete failed',
      });
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
      notify(err.response?.data?.message || 'Unable to save university.', {
        tone: 'error',
        title: 'University save failed',
      });
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
      notify('University deleted successfully.', {
        tone: 'success',
        title: 'University deleted',
      });
    } catch (err) {
      console.error('Error deleting university:', err);
      notify(err.response?.data?.message || 'Unable to delete university.', {
        tone: 'error',
        title: 'Delete failed',
      });
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
      notify(err.response?.data?.message || 'Unable to save success story.', {
        tone: 'error',
        title: 'Story save failed',
      });
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
      notify('Success story deleted successfully.', {
        tone: 'success',
        title: 'Story deleted',
      });
    } catch (err) {
      console.error('Error deleting success story:', err);
      notify(err.response?.data?.message || 'Unable to delete success story.', {
        tone: 'error',
        title: 'Delete failed',
      });
    }
  };

  // Edit Page Section Texts
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
        title: '',
        subtitle: '',
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

      notify('Section removed from the page draft.', {
        tone: 'success',
        title: 'Section removed',
      });
    });
  };

  // Upload file for banner or image replacement
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
      notify('Image uploaded successfully.', {
        tone: 'success',
        title: 'Upload complete',
      });
    } catch (err) {
      console.error('Upload failed:', err);
      notify(err.response?.data?.message || 'Upload failed. Please try again.', {
        tone: 'error',
        title: 'Upload failed',
      });
    }
  };

  const savePageContent = async () => {
    if (!editingPage) return;

    const validationErrors = validatePageDraft(editingPage);
    if (notifyFirstError('Fix the page draft', validationErrors)) {
      return;
    }

    try {
      const payload = {
        ...editingPage,
        title: editingPage.title || titleizeSlug(selectedPageSlug),
      };

      await api.put(`/pages/${selectedPageSlug}`, payload);
      await loadPageContent(selectedPageSlug);
      notify('Page content updated successfully.', {
        tone: 'success',
        title: 'Page saved',
      });
    } catch (err) {
      console.error('Error saving page changes:', err);
      notify(err.response?.data?.message || 'Failed to save page changes.', {
        tone: 'error',
        title: 'Page save failed',
      });
    }
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
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Navbar */}
      <header className="border-b border-border bg-surface py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary font-display text-base font-bold text-white">
            C
          </span>
          <h1 className="font-display text-lg font-semibold">CMS Control Centre</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-primary"
          >
            CMS Studio
          </Link>
          <span className="text-xs text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{user.username}</span></span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-all"
          >
            <LogOut className="h-3 w-3" /> Log Out
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard splits */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-border bg-surface p-4 flex flex-col gap-1.5">
          <button
            onClick={() => startTransition(() => setActiveTab('inquiries'))}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'inquiries' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <Inbox className="h-4 w-4" /> Inbox Leads ({inquiries.filter(i => i.status === 'unread').length})
          </button>
          <button
            onClick={() => startTransition(() => setActiveTab('pages'))}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'pages' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <FileText className="h-4 w-4" /> Edit Page Content
          </button>
          <button
            onClick={() => startTransition(() => setActiveTab('universities'))}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'universities' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <GraduationCap className="h-4 w-4" /> Partner Universities ({universities.length})
          </button>
          <button
            onClick={() => startTransition(() => setActiveTab('stories'))}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'stories' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <Sparkles className="h-4 w-4" /> Success Stories ({stories.length})
          </button>
        </aside>

        {/* Content Area */}
        <section className={`flex-1 p-6 md:p-8 bg-surface-2/30 overflow-y-auto max-h-[calc(100vh-68px)] transition-opacity duration-200 ${isPending ? 'opacity-95' : 'opacity-100'}`}>
          {loading || pageLoading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* TAB 1: INBOX LEADS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Unread leads</p>
                      <p className="mt-3 font-display text-3xl">{unreadCount}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Needs a quick follow-up.</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active leads</p>
                      <p className="mt-3 font-display text-3xl">{readCount}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Already reviewed or in progress.</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Archived</p>
                      <p className="mt-3 font-display text-3xl">{archivedCount}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Older requests kept for records.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">Admissions Lead Inbox</h2>
                      <p className="text-xs text-muted-foreground">Search by name, email, phone, or inquiry type.</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl">
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leads..."
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
                        <p className="text-center py-10 border border-dashed border-border rounded text-muted-foreground text-sm">
                          {searchTerm || inquiryStatusFilter !== 'all'
                            ? 'No leads match the current search and filter.'
                            : 'No leads submitted yet.'}
                        </p>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <div 
                            key={inq._id}
                            onClick={() => setSelectedInquiry(inq)}
                            className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedInquiry?._id === inq._id ? 'border-primary bg-primary/5 shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-surface hover:bg-surface-2 hover:border-primary/30 hover:-translate-y-0.5'}`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${inq.type === 'pathway' ? 'bg-primary/10 text-primary' : inq.type === 'eligibility' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                  {inquiryTypeLabel[inq.type] || inq.type}
                                </span>
                                {inq.status === 'unread' && <span className="h-2 w-2 rounded-full bg-red-500" />}
                              </div>
                              <h4 className="font-bold text-sm mt-1">{inq.name || 'Anonymous'}</h4>
                              <p className="text-xs text-muted-foreground">{inq.email}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {inquiryStatusLabel[inq.status] || inq.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Inquiry Detail panel */}
                    <div className="md:col-span-5">
                      {selectedInquiry ? (
                        <div className="border border-border bg-surface rounded-lg p-6 space-y-6 shadow-sm sticky top-6">
                          <div className="border-b border-border pb-4 flex justify-between items-start">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                                {selectedInquiry.type} Lead details
                              </span>
                              <h3 className="font-display text-xl mt-1">{selectedInquiry.name}</h3>
                            </div>
                            <button 
                              onClick={() => deleteInquiry(selectedInquiry._id)}
                              className="text-muted-foreground hover:text-red-500 p-1"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase">Email</p>
                              <p className="text-sm mt-0.5">{selectedInquiry.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase">Phone</p>
                              <p className="text-sm mt-0.5">{selectedInquiry.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase">Submitted Date</p>
                              <p className="text-sm mt-0.5">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                            </div>

                            {/* Wizard Custom answers */}
                            <div className="border-t border-border/60 pt-4">
                              <p className="font-semibold text-muted-foreground uppercase mb-2">Wizard Responses</p>
                              <div className="bg-surface-2 p-3 rounded border border-border space-y-1.5">
                                {Object.entries(selectedInquiry.data || {}).map(([key, val]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-muted-foreground capitalize">{key}:</span>
                                    <span className="font-semibold">{String(val)}</span>
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
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded bg-green-500 text-white py-2 text-xs font-semibold"
                              >
                                <Check className="h-3.5 w-3.5" /> Mark as Read
                              </button>
                            ) : (
                              <button
                                onClick={() => markInquiryStatus(selectedInquiry._id, 'unread')}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded border border-border hover:bg-surface-2 py-2 text-xs font-semibold"
                              >
                                Mark as Unread
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 border border-dashed border-border bg-surface rounded-lg text-muted-foreground text-xs">
                          Select a lead card from the list to view wizard answers and contact details.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EDIT PAGES */}
              {activeTab === 'pages' && editingPage && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h2 className="font-display text-2xl font-semibold">Edit Page Layouts</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedPageSlug}
                        onChange={(e) => startTransition(() => setSelectedPageSlug(e.target.value))}
                        className="p-1.5 border border-border bg-surface rounded text-xs focus:outline-none"
                      >
                        <option value="home">Home Page</option>
                        <option value="for-parents">For Parents Center</option>
                      </select>
                      <button
                        onClick={addPageSection}
                        className="inline-flex items-center justify-center rounded border border-border bg-surface px-4 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Section
                      </button>
                      <button
                        onClick={savePageContent}
                        className="inline-flex items-center justify-center rounded bg-primary text-white px-4 py-1.5 text-xs font-semibold shadow"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Page Title</label>
                      <input
                        type="text"
                        value={editingPage.title || ''}
                        onChange={(e) => handlePageFieldChange('title', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Description</label>
                      <input
                        type="text"
                        value={editingPage.description || ''}
                        onChange={(e) => handlePageFieldChange('description', e.target.value)}
                        className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Meta Description</label>
                      <textarea
                        value={editingPage.metaDescription || ''}
                        onChange={(e) => handlePageFieldChange('metaDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border bg-surface-2/60 px-4 py-3 text-xs text-muted-foreground">
                    Editing slug <span className="font-semibold text-primary">{selectedPageSlug}</span>. Save to create this page if it does not already exist.
                  </div>

                  {/* Sections List */}
                  <div className="space-y-8">
                    {(editingPage.sections || []).map((sec, secIdx) => (
                      <div key={sec._id || `${sec.sectionId}-${secIdx}`} className="border border-border bg-surface rounded-lg p-6 space-y-4 shadow-sm">
                        <div className="border-b border-border/60 pb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="grid flex-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold uppercase text-muted-foreground">Section ID</label>
                              <input
                                type="text"
                                value={sec.sectionId || ''}
                                onChange={(e) => handlePageSectionChange(secIdx, 'sectionId', e.target.value)}
                                className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold uppercase text-muted-foreground">Visibility</label>
                              <label className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2 text-xs font-medium">
                                <input
                                  type="checkbox"
                                  checked={sec.isVisible !== false}
                                  onChange={(e) => handlePageSectionChange(secIdx, 'isVisible', e.target.checked)}
                                />
                                Show on site
                              </label>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePageSection(secIdx)}
                            className="inline-flex items-center justify-center gap-1 self-start rounded border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>

                        {/* Title & Subtitle inputs */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase text-muted-foreground">Title</label>
                            <input
                              type="text"
                              value={sec.title || ''}
                              onChange={(e) => handlePageSectionChange(secIdx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase text-muted-foreground">Subtitle / Paragraph</label>
                            <input
                              type="text"
                              value={sec.subtitle || ''}
                              onChange={(e) => handlePageSectionChange(secIdx, 'subtitle', e.target.value)}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        {/* Description / Content text block */}
                        {sec.content !== undefined && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase text-muted-foreground">Additional Content</label>
                            <textarea
                              value={sec.content || ''}
                              onChange={(e) => handlePageSectionChange(secIdx, 'content', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                        )}

                        {/* Upload Image section if exists */}
                        {sec.image !== undefined && (
                          <div className="p-4 bg-surface-2 rounded-lg border border-border flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold">Section Image Banner</p>
                              {sec.image ? (
                                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{sec.image}</p>
                              ) : (
                                <p className="text-[10px] text-red-400 mt-1">No image uploaded</p>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              {sec.image && (
                                <img src={sec.image.startsWith('/uploads') ? `${API_BASE}${sec.image}` : sec.image} alt="Preview" className="h-10 w-16 object-cover border rounded" />
                              )}
                              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded text-xs font-semibold hover:bg-primary hover:text-white transition-all">
                                <Upload className="h-3.5 w-3.5" /> Upload File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleImageUpload(secIdx, null, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {/* List items if exists (e.g. why-pathway comparison cards) */}
                        {sec.items && sec.items.length > 0 && (
                          <div className="space-y-4 pt-4 border-t border-border/60">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Section List Cards ({sec.items.length})</h4>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {sec.items.map((item, itemIdx) => (
                                <div key={item._id || `${sec.sectionId}-${itemIdx}`} className="p-4 border border-border bg-surface-2 rounded-lg space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Card 0{itemIdx + 1}</span>
                                    <span className="text-[10px] text-muted-foreground">Layout item</span>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase text-muted-foreground">Title</label>
                                      <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => handlePageItemChange(secIdx, itemIdx, 'title', e.target.value)}
                                        className="w-full px-2 py-1 border border-border bg-background rounded text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase text-muted-foreground">Subtitle</label>
                                      <input
                                        type="text"
                                        value={item.subtitle || ''}
                                        onChange={(e) => handlePageItemChange(secIdx, itemIdx, 'subtitle', e.target.value)}
                                        className="w-full px-2 py-1 border border-border bg-background rounded text-xs focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] uppercase text-muted-foreground">Description</label>
                                    <textarea
                                      value={item.content || ''}
                                      onChange={(e) => handlePageItemChange(secIdx, itemIdx, 'content', e.target.value)}
                                      rows={2}
                                      className="w-full px-2 py-1 border border-border bg-background rounded text-xs focus:outline-none"
                                    />
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase text-muted-foreground">Link</label>
                                      <input
                                        type="text"
                                        value={item.link || ''}
                                        onChange={(e) => handlePageItemChange(secIdx, itemIdx, 'link', e.target.value)}
                                        className="w-full px-2 py-1 border border-border bg-background rounded text-xs focus:outline-none"
                                        placeholder="/contact"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase text-muted-foreground">Image</label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={item.image || ''}
                                          onChange={(e) => handlePageItemChange(secIdx, itemIdx, 'image', e.target.value)}
                                          className="min-w-0 flex-1 px-2 py-1 border border-border bg-background rounded text-xs focus:outline-none"
                                          placeholder="https://..."
                                        />
                                        <label className="cursor-pointer inline-flex shrink-0 items-center gap-1 rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary transition hover:bg-primary hover:text-white">
                                          <Upload className="h-3 w-3" /> Upload
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                              if (e.target.files[0]) {
                                                handleImageUpload(secIdx, itemIdx, e.target.files[0]);
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                      {item.image && (
                                        <img
                                          src={item.image.startsWith('/uploads') ? `${API_BASE}${item.image}` : item.image}
                                          alt={item.title || `Section item ${itemIdx + 1}`}
                                          className="h-16 w-full rounded border border-border object-cover"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PARTNER UNIVERSITIES */}
              {activeTab === 'universities' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h2 className="font-display text-2xl font-semibold">Partner Universities</h2>
                    <button
                      onClick={() => {
                        setEditingUni(null);
                        setUniForm({
                          name: '', city: '', country: 'United Kingdom', subjects: '', 
                          pathway: 'BTEC HND', transferYear: 'Year 2 or 3', 
                          awardingBody: 'Pearson', costLakhsMin: 45, costLakhsMax: 60, emiMonthly: 40000
                        });
                        setUniFormOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 bg-primary text-white px-4 py-1.5 rounded text-xs font-semibold shadow"
                    >
                      <Plus className="h-4 w-4" /> Add University
                    </button>
                  </div>

                  {/* Form Modal for Add/Edit */}
                  <AdminDialog
                    open={uniFormOpen}
                    title={editingUni ? 'Edit University details' : 'Add New Progression Partner'}
                    description="Update the university record and save it back to the CMS."
                    onClose={closeUniversityModal}
                    maxWidth="max-w-2xl"
                  >
                    <form onSubmit={saveUniversity} className="space-y-4">

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Name</label>
                            <input 
                              type="text" required value={uniForm.name} 
                              onChange={(e) => setUniForm({...uniForm, name: e.target.value})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">City</label>
                            <input 
                              type="text" required value={uniForm.city} 
                              onChange={(e) => setUniForm({...uniForm, city: e.target.value})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Country</label>
                            <select 
                              value={uniForm.country} 
                              onChange={(e) => setUniForm({...uniForm, country: e.target.value})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none"
                            >
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Australia">Australia</option>
                              <option value="Canada">Canada</option>
                              <option value="Ireland">Ireland</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Awarding Body</label>
                            <select 
                              value={uniForm.awardingBody} 
                              onChange={(e) => setUniForm({...uniForm, awardingBody: e.target.value})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none"
                            >
                              <option value="Pearson">Pearson</option>
                              <option value="ATHE">ATHE</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Subjects (Comma separated)</label>
                          <input 
                            type="text" required value={uniForm.subjects} 
                            onChange={(e) => setUniForm({...uniForm, subjects: e.target.value})}
                            placeholder="Computing & Data, Business & Management, Engineering"
                            className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase">Min Cost (Lakhs)</label>
                            <input 
                              type="number" required value={uniForm.costLakhsMin} 
                              onChange={(e) => setUniForm({...uniForm, costLakhsMin: Number(e.target.value)})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase">Max Cost (Lakhs)</label>
                            <input 
                              type="number" required value={uniForm.costLakhsMax} 
                              onChange={(e) => setUniForm({...uniForm, costLakhsMax: Number(e.target.value)})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase">EMI (/month)</label>
                            <input 
                              type="number" required value={uniForm.emiMonthly} 
                              onChange={(e) => setUniForm({...uniForm, emiMonthly: Number(e.target.value)})}
                              className="w-full px-3 py-1.5 border border-border bg-background rounded"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4 border-t border-border">
                          <button 
                            type="button" 
                            onClick={closeUniversityModal}
                            className="px-4 py-1.5 rounded border border-border hover:bg-surface-2 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-1.5 rounded bg-primary text-white text-xs font-semibold shadow"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                  </AdminDialog>

                  {/* Universities Table */}
                  <div className="border border-border rounded-lg bg-surface overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-2 border-b border-border font-semibold text-muted-foreground">
                          <th className="p-3">Name</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Transfer / Awarding</th>
                          <th className="p-3">Cost range (INR)</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {universities.map(uni => (
                          <tr key={uni._id} className="border-b border-border/60 transition-colors duration-150 hover:bg-surface-2/60">
                            <td className="p-3 font-semibold text-foreground">{uni.name}</td>
                            <td className="p-3 text-muted-foreground">{uni.city}, {uni.country}</td>
                            <td className="p-3">
                              <span className="font-medium text-foreground">{uni.transferYear}</span> · <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">{uni.awardingBody}</span>
                            </td>
                            <td className="p-3 font-semibold text-primary">₹{uni.costLakhsMin}–{uni.costLakhsMax} Lakhs</td>
                            <td className="p-3 text-right space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingUni(uni);
                                  setUniForm({
                                    ...uni,
                                    subjects: Array.isArray(uni.subjects)
                                      ? uni.subjects.join(', ')
                                      : String(uni.subjects || '')
                                  });
                                  setUniFormOpen(true);
                                }}
                                className="text-muted-foreground hover:text-primary p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteUniversity(uni._id)}
                                className="text-muted-foreground hover:text-red-500 p-1"
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
              )}

              {/* TAB 4: SUCCESS STORIES */}
              {activeTab === 'stories' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h2 className="font-display text-2xl font-semibold">Success Stories</h2>
                    <button
                      onClick={() => {
                        setEditingStory(null);
                        setStoryForm({ initials: '', startPoint: '', pathway: '', destination: '', outcome: '' });
                        setStoryFormOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 bg-primary text-white px-4 py-1.5 rounded text-xs font-semibold shadow"
                    >
                      <Plus className="h-4 w-4" /> Add Story
                    </button>
                  </div>

                  {/* Story Form Modal */}
                  <AdminDialog
                    open={storyFormOpen}
                    title={editingStory ? 'Edit Story details' : 'Add New Student Journey'}
                    description="Capture a student journey that can be displayed on the public success page."
                    onClose={closeStoryModal}
                    maxWidth="max-w-xl"
                  >
                    <form onSubmit={saveStory} className="space-y-4">

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Initials</label>
                            <input 
                              type="text" required value={storyForm.initials} 
                              onChange={(e) => setStoryForm({...storyForm, initials: e.target.value})}
                              placeholder="e.g. S.V."
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Start Point</label>
                            <input 
                              type="text" required value={storyForm.startPoint} 
                              onChange={(e) => setStoryForm({...storyForm, startPoint: e.target.value})}
                              placeholder="e.g. Class 12 CBSE, Bengaluru"
                              className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Pathway Taken</label>
                          <input 
                            type="text" required value={storyForm.pathway} 
                            onChange={(e) => setStoryForm({...storyForm, pathway: e.target.value})}
                            placeholder="e.g. Pearson HND Computing → Year 2 transfer"
                            className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Destination University</label>
                          <input 
                            type="text" required value={storyForm.destination} 
                            onChange={(e) => setStoryForm({...storyForm, destination: e.target.value})}
                            placeholder="e.g. Coventry University, UK"
                            className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Outcome Note (Optional)</label>
                          <textarea 
                            value={storyForm.outcome} 
                            onChange={(e) => setStoryForm({...storyForm, outcome: e.target.value})}
                            placeholder="e.g. Graduated 2024, now in graduate software role."
                            rows={3}
                            className="w-full px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-4 border-t border-border">
                          <button 
                            type="button" 
                            onClick={closeStoryModal}
                            className="px-4 py-1.5 rounded border border-border hover:bg-surface-2 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-1.5 rounded bg-primary text-white text-xs font-semibold shadow"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                  </AdminDialog>

                  {/* Stories list */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {stories.map(story => (
                      <div key={story._id} className="p-4 border border-border bg-surface rounded-lg flex justify-between items-start shadow-sm transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{story.initials}</span>
                          <h4 className="font-bold text-sm mt-1">{story.startPoint}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{story.pathway}</p>
                          <p className="text-xs font-semibold text-foreground mt-1">→ {story.destination}</p>
                          {story.outcome && <p className="text-[10px] text-muted-foreground mt-3 border-t border-border/60 pt-2">{story.outcome}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button 
                            onClick={() => {
                              setEditingStory(story);
                              setStoryForm(story);
                              setStoryFormOpen(true);
                            }}
                            className="text-muted-foreground hover:text-primary p-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteStory(story._id)}
                            className="text-muted-foreground hover:text-red-500 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
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
