"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../services/auth';
import api from '../../../services/api';
import {
  Inbox, FileText, GraduationCap, Compass, Sparkles, LogOut,
  Trash2, Edit, Plus, Check, RefreshCw, Upload, Eye
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inquiries');

  // Core CMS Data states
  const [inquiries, setInquiries] = useState([]);
  const [pages, setPages] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [stories, setStories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  
  const [loading, setLoading] = useState(true);

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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // Fetch all dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [inqRes, uniRes, storyRes, destRes] = await Promise.all([
        api.get('/inquiries'),
        api.get('/universities'),
        api.get('/success-stories'),
        api.get('/destinations')
      ]);
      setInquiries(inqRes.data);
      setUniversities(uniRes.data);
      setStories(storyRes.data);
      setDestinations(destRes.data);

      // Fetch currently selected page config
      const pageRes = await api.get(`/pages/${selectedPageSlug}`);
      setEditingPage(pageRes.data);
    } catch (err) {
      console.error('Error fetching dashboard datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
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
      setInquiries(inquiries.map(i => i._id === id ? { ...i, status } : i));
      if (selectedInquiry?._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await api.delete(`/inquiries/${id}`);
      setInquiries(inquiries.filter(i => i._id !== id));
      setSelectedInquiry(null);
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  // University CRUD
  const saveUniversity = async (e) => {
    e.preventDefault();
    const data = {
      ...uniForm,
      subjects: typeof uniForm.subjects === 'string' ? uniForm.subjects.split(',').map(s => s.trim()) : uniForm.subjects
    };

    try {
      if (editingUni) {
        const res = await api.put(`/universities/${editingUni._id}`, data);
        setUniversities(universities.map(u => u._id === editingUni._id ? res.data.university : u));
      } else {
        const res = await api.post('/universities', data);
        setUniversities([...universities, res.data.university]);
      }
      setUniFormOpen(false);
      setEditingUni(null);
    } catch (err) {
      console.error('Error saving university:', err);
    }
  };

  const deleteUniversity = async (id) => {
    if (!window.confirm('Delete this university?')) return;
    try {
      await api.delete(`/universities/${id}`);
      setUniversities(universities.filter(u => u._id !== id));
    } catch (err) {
      console.error('Error deleting university:', err);
    }
  };

  // Success Story CRUD
  const saveStory = async (e) => {
    e.preventDefault();
    try {
      if (editingStory) {
        const res = await api.put(`/success-stories/${editingStory._id}`, storyForm);
        setStories(stories.map(s => s._id === editingStory._id ? res.data.story : s));
      } else {
        const res = await api.post('/success-stories', storyForm);
        setStories([...stories, res.data.story]);
      }
      setStoryFormOpen(false);
      setEditingStory(null);
    } catch (err) {
      console.error('Error saving success story:', err);
    }
  };

  const deleteStory = async (id) => {
    if (!window.confirm('Delete this success story?')) return;
    try {
      await api.delete(`/success-stories/${id}`);
      setStories(stories.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting success story:', err);
    }
  };

  // Edit Page Section Texts
  const handlePageSectionChange = (sectionIdx, field, value) => {
    const updatedSections = [...editingPage.sections];
    updatedSections[sectionIdx] = {
      ...updatedSections[sectionIdx],
      [field]: value
    };
    setEditingPage({ ...editingPage, sections: updatedSections });
  };

  const handlePageItemChange = (sectionIdx, itemIdx, field, value) => {
    const updatedSections = [...editingPage.sections];
    const updatedItems = [...updatedSections[sectionIdx].items];
    updatedItems[itemIdx] = {
      ...updatedItems[itemIdx],
      [field]: value
    };
    updatedSections[sectionIdx] = {
      ...updatedSections[sectionIdx],
      items: updatedItems
    };
    setEditingPage({ ...editingPage, sections: updatedSections });
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
      alert('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const savePageContent = async () => {
    try {
      await api.put(`/pages/${selectedPageSlug}`, editingPage);
      alert('Page content updated successfully!');
    } catch (err) {
      console.error('Error saving page changes:', err);
      alert('Failed to save page changes.');
    }
  };

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
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'inquiries' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <Inbox className="h-4 w-4" /> Inbox Leads ({inquiries.filter(i => i.status === 'unread').length})
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'pages' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <FileText className="h-4 w-4" /> Edit Page Content
          </button>
          <button
            onClick={() => setActiveTab('universities')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'universities' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <GraduationCap className="h-4 w-4" /> Partner Universities ({universities.length})
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${activeTab === 'stories' ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(232,181,67,0.2)]' : 'hover:bg-surface-2 hover:text-primary'}`}
          >
            <Sparkles className="h-4 w-4" /> Success Stories ({stories.length})
          </button>
        </aside>

        {/* Content Area */}
        <section className="flex-1 p-6 md:p-8 bg-surface-2/30 overflow-y-auto max-h-[calc(100vh-68px)]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* TAB 1: INBOX LEADS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h2 className="font-display text-2xl font-semibold">Admissions Lead Inbox</h2>
                    <p className="text-xs text-muted-foreground">Review form inquiries</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-12">
                    {/* Inquiry List */}
                    <div className="md:col-span-7 space-y-3">
                      {inquiries.length === 0 ? (
                        <p className="text-center py-10 border border-dashed border-border rounded text-muted-foreground text-sm">
                          No leads submitted yet.
                        </p>
                      ) : (
                        inquiries.map((inq) => (
                          <div 
                            key={inq._id}
                            onClick={() => setSelectedInquiry(inq)}
                            className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedInquiry?._id === inq._id ? 'border-primary bg-primary/5 shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-surface hover:bg-surface-2 hover:border-primary/30 hover:-translate-y-0.5'}`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${inq.type === 'pathway' ? 'bg-primary/10 text-primary' : inq.type === 'eligibility' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                  {inq.type}
                                </span>
                                {inq.status === 'unread' && <span className="h-2 w-2 rounded-full bg-red-500" />}
                              </div>
                              <h4 className="font-bold text-sm mt-1">{inq.name || 'Anonymous'}</h4>
                              <p className="text-xs text-muted-foreground">{inq.email}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(inq.createdAt).toLocaleDateString()}
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
                    <div className="flex gap-2">
                      <select
                        value={selectedPageSlug}
                        onChange={(e) => setSelectedPageSlug(e.target.value)}
                        className="p-1.5 border border-border bg-surface rounded text-xs focus:outline-none"
                      >
                        <option value="home">Home Page</option>
                        <option value="for-parents">For Parents Center</option>
                      </select>
                      <button
                        onClick={savePageContent}
                        className="inline-flex items-center justify-center rounded bg-primary text-white px-4 py-1.5 text-xs font-semibold shadow"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Sections List */}
                  <div className="space-y-8">
                    {editingPage.sections.map((sec, secIdx) => (
                      <div key={sec._id || sec.sectionId} className="border border-border bg-surface rounded-lg p-6 space-y-4 shadow-sm">
                        <div className="border-b border-border/60 pb-3 flex justify-between items-center">
                          <h3 className="font-display text-lg font-bold text-primary capitalize">
                            Section: {sec.sectionId}
                          </h3>
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
                            <div className="grid gap-4 sm:grid-cols-3">
                              {sec.items.map((item, itemIdx) => (
                                <div key={item._id} className="p-4 border border-border bg-surface-2 rounded-lg space-y-2">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Card 0{itemIdx + 1}</span>
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
                                    <label className="text-[9px] uppercase text-muted-foreground">Description</label>
                                    <textarea
                                      value={item.content || ''}
                                      onChange={(e) => handlePageItemChange(secIdx, itemIdx, 'content', e.target.value)}
                                      rows={2}
                                      className="w-full px-2 py-1 border border-border bg-background rounded text-xs focus:outline-none"
                                    />
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
                  {uniFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <form onSubmit={saveUniversity} className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-4">
                        <h3 className="font-display text-xl border-b border-border pb-2">
                          {editingUni ? 'Edit University details' : 'Add New Progression Partner'}
                        </h3>

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
                            onClick={() => setUniFormOpen(false)}
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
                    </div>
                  )}

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
                                    subjects: uni.subjects.join(', ')
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
                  {storyFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <form onSubmit={saveStory} className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-4">
                        <h3 className="font-display text-xl border-b border-border pb-2">
                          {editingStory ? 'Edit Story details' : 'Add New Student Journey'}
                        </h3>

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
                            onClick={() => setStoryFormOpen(false)}
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
                    </div>
                  )}

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