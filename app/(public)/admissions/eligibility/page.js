"use client";

import React, { useState } from 'react';
import api from '../../../../services/api';
import { HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const AdmissionsEligibility = () => {
  const [board, setBoard] = useState('CBSE');
  const [score, setScore] = useState('');
  const [englishMedium, setEnglishMedium] = useState('Yes');
  const [stream, setStream] = useState('Computing & Data');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple logic: requires at least 55% in board exams
    const scoreVal = parseFloat(score);
    const eligibleStatus = scoreVal >= 55 && englishMedium === 'Yes';
    setIsEligible(eligibleStatus);

    try {
      await api.post('/inquiries', {
        type: 'eligibility',
        name,
        email,
        phone,
        data: {
          board,
          score,
          englishMedium,
          stream,
          eligibleStatus
        }
      });
      setChecked(true);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      alert('There was a problem submitting your eligibility request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 text-center max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Eligibility Checker</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
          Are you eligible for credit transfer?
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
          Enter your current qualifications. We'll show you what is typically possible — subject to formal academic evaluation.
        </p>
      </section>

      <section className="container-prose max-w-xl">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]">
          {!checked ? (
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Education Board</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ISC">ISC / ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB / Cambridge">IB / Cambridge</option>
                    <option value="University Transfer">Currently at University</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Grade 12 / CGPA (%)</label>
                  <input 
                    type="number" 
                    required 
                    min="35"
                    max="100"
                    value={score} 
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 75"
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">English Medium school?</label>
                  <select
                    value={englishMedium}
                    onChange={(e) => setEnglishMedium(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Preferred Stream</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Computing & Data">Computing & Data</option>
                    <option value="Business & Management">Business & Management</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your Contact Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-semibold">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-muted-foreground font-semibold">Email</label>
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
                      <label className="block text-[10px] text-muted-foreground font-semibold">Phone</label>
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
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 inline-flex items-center justify-center rounded-md bg-primary text-white px-5 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? 'Evaluating...' : 'Check My Eligibility'}
              </button>
            </form>
          ) : (
            /* Checked Output results */
            <div className="text-center space-y-6">
              {isEligible ? (
                <div className="space-y-4">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 text-green-500 p-3">
                    <CheckCircle className="h-8 w-8" />
                  </span>
                  <h3 className="font-display text-2xl text-foreground font-semibold">Typically Eligible</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your board exam marks of <span className="font-semibold text-foreground">{score}%</span>, you are typically eligible for the Cornerstone Pathway program.
                  </p>
                  <p className="text-xs text-muted-foreground bg-green-500/5 border border-green-500/10 p-3 rounded">
                    We will send a formal eligibility assessment request to our admissions board. An advisor will contact you at <span className="font-semibold text-foreground">{phone}</span> to request transcript copies.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-3">
                    <AlertTriangle className="h-8 w-8" />
                  </span>
                  <h3 className="font-display text-2xl text-foreground font-semibold">Evaluation Required</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A formal board review is required to determine pathway entry. Typically, a minimum score of 55% in Grade 12 is expected.
                  </p>
                  <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/10 p-3 rounded">
                    Do not worry. There are alternative entry criteria (e.g. entrance tests or bridge courses). An advisor will contact you at <span className="font-semibold text-foreground">{phone}</span> to review details.
                  </p>
                </div>
              )}

              <button 
                onClick={() => setChecked(false)}
                className="text-xs text-primary font-semibold underline underline-offset-4"
              >
                Reset Checker
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdmissionsEligibility;