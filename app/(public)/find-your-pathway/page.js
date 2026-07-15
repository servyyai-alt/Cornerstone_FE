"use client";

import React, { useState } from 'react';
import api from '../../../services/api';
import { ArrowRight, ArrowLeft, CheckCircle, GraduationCap, Compass, Coins, Calendar, Mail } from 'lucide-react';

const FindYourPathway = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form Fields
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inquiries', {
        type: 'pathway',
        name,
        email,
        phone,
        data: {
          qualification,
          subject,
          destination,
          budget
        }
      });
      setCompleted(true);
    } catch (err) {
      console.error('Error submitting pathway inquiry:', err);
      alert('There was a problem submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render logic for steps
  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 text-center max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Global Pathway Finder™</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
          Five questions. One personalised international plan.
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
          Tell us about yourself and we will map a staged route — qualifications, destinations, timelines and cost range.
        </p>
      </section>

      <section className="container-prose max-w-2xl">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]">
          {!completed ? (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase border-b border-border pb-4 mb-6">
                <span>Step {step} of 5</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span 
                      key={s} 
                      className={`h-1.5 rounded-full transition-all ${step === s ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1: Current Qualification */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl text-foreground">1. What is your current academic stage?</h3>
                  <div className="grid gap-3">
                    {[
                      { val: 'School Leaver', label: 'Finished High School (Grade 12 / IB / A-levels)' },
                      { val: 'University Student', label: 'Currently enrolled in an Indian University' },
                      { val: 'Graduate', label: 'Completed Bachelor\'s degree / College graduate' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => { setQualification(opt.val); nextStep(); }}
                        className={`p-4 text-left rounded-lg border text-sm transition-all duration-200 ${qualification === opt.val ? 'border-primary bg-primary/5 font-medium shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Stream / Subject */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl text-foreground">2. Which subject track would you like to pursue?</h3>
                  <div className="grid gap-3 grid-cols-2">
                    {[
                      'Computing & Data',
                      'Business & Management',
                      'Engineering',
                      'Creative & Media',
                      'Health & Life Sciences',
                      'Hospitality & Tourism'
                    ].map(sub => (
                      <button
                        key={sub}
                        onClick={() => { setSubject(sub); nextStep(); }}
                        className={`p-4 text-left rounded-lg border text-sm transition-all duration-200 ${subject === sub ? 'border-primary bg-primary/5 font-medium shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs text-muted-foreground pt-4 hover:text-foreground">
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                </div>
              )}

              {/* Step 3: Destination */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl text-foreground">3. What is your preferred study destination?</h3>
                  <div className="grid gap-3 grid-cols-2">
                    {[
                      'United Kingdom',
                      'Australia',
                      'Canada',
                      'Ireland',
                      'Germany',
                      'Any / Unsure'
                    ].map(dest => (
                      <button
                        key={dest}
                        onClick={() => { setDestination(dest); nextStep(); }}
                        className={`p-4 text-left rounded-lg border text-sm transition-all duration-200 ${destination === dest ? 'border-primary bg-primary/5 font-medium shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs text-muted-foreground pt-4 hover:text-foreground">
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                </div>
              )}

              {/* Step 4: Budget Limit */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl text-foreground">4. What is your total budget limit?</h3>
                  <div className="grid gap-3">
                    {[
                      { val: 'Under 30 Lakhs', label: 'Under ₹30 Lakhs total' },
                      { val: '30-50 Lakhs', label: '₹30 to ₹50 Lakhs' },
                      { val: '50-70 Lakhs', label: '₹50 to ₹70 Lakhs' },
                      { val: '70+ Lakhs', label: '₹70 Lakhs and above' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => { setBudget(opt.val); nextStep(); }}
                        className={`p-4 text-left rounded-lg border text-sm transition-all duration-200 ${budget === opt.val ? 'border-primary bg-primary/5 font-medium shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={prevStep} className="flex items-center gap-1 text-xs text-muted-foreground pt-4 hover:text-foreground">
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                </div>
              )}

              {/* Step 5: Contact Form */}
              {step === 5 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-display text-xl text-foreground">5. Where should we send your pathway summary?</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-md bg-primary text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Generate Plan'} <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Wizard Completed Output Results */
            <div className="text-center space-y-6">
              <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 text-green-500 p-3 mb-2">
                <CheckCircle className="h-8 w-8" />
              </span>
              <h3 className="font-display text-2xl text-foreground font-semibold">Your Pathway Plan is Ready!</h3>
              <p className="text-sm text-muted-foreground">
                Hi {name}, we've compiled a customized staged timeline based on your background. Check your details below:
              </p>

              {/* Pathway Results Summary Dashboard */}
              <div className="rounded-lg bg-surface-2 border border-border p-5 text-left text-xs space-y-3 transition-all duration-200 hover:border-primary/40">
                <div className="flex items-center gap-2 text-sm font-bold border-b border-border/60 pb-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>Staged Progression Profile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stage:</span>
                  <span className="font-medium text-foreground">{qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject Track:</span>
                  <span className="font-medium text-foreground">{subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred Destination:</span>
                  <span className="font-medium text-foreground">{destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Limit:</span>
                  <span className="font-medium text-primary font-semibold">{budget}</span>
                </div>
              </div>

              {/* Timeline illustration */}
              <div className="border border-dashed border-border rounded-lg p-5 text-left text-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Timeline Ladder</span>
                </div>
                <div className="relative pl-6 border-l-2 border-primary/30 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-white font-bold">1</span>
                    <h4 className="font-semibold text-foreground">Months 1–12 (India)</h4>
                    <p className="text-muted-foreground">Complete Level 4 Certificate at Cornerstone Campus.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-white font-bold">2</span>
                    <h4 className="font-semibold text-foreground">Months 13–24 (India)</h4>
                    <p className="text-muted-foreground">Complete Level 5 HND Diploma. Prepare visa transfer documents.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-white font-bold">3</span>
                    <h4 className="font-semibold text-foreground">Months 25–36 (Abroad)</h4>
                    <p className="text-muted-foreground">Transfer to {destination !== 'Any / Unsure' ? destination : 'Partner University'} for final Year 3. Graduate internationally!</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-xs text-muted-foreground flex gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <p>
                  A copy of this progression mapping and checklist has been sent to <span className="font-medium text-foreground">{email}</span>. An advisor will contact you at <span className="font-medium text-foreground">{phone}</span> to review credit transfer.
                </p>
              </div>

              <button 
                onClick={() => { setCompleted(false); setStep(1); }}
                className="text-xs text-primary font-semibold underline underline-offset-4"
              >
                Start another mapping
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default FindYourPathway;