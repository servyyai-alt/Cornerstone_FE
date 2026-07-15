"use client";

import React, { useState } from 'react';
import api from '../../../services/api';
import { Mail, Phone, Calendar, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredIntake, setPreferredIntake] = useState('July (Main Intake)');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inquiries', {
        type: 'consultation',
        name,
        email,
        phone,
        data: {
          preferredIntake,
          message
        }
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting consultation inquiry:', err);
      alert('There was a problem submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 text-center max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Book a Consultation</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
          One advisor. One conversation. No pressure.
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
          Speak to a named advisor on the phone or on campus in Bengaluru. No sales pitch, no urgency theatre.
        </p>
      </section>

      <section className="container-prose max-w-xl">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid gap-4 sm:grid-cols-2">
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

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Preferred Intake</label>
                <select
                  value={preferredIntake}
                  onChange={(e) => setPreferredIntake(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                >
                  <option value="January (Spring Intake)">January (Spring Intake)</option>
                  <option value="April (Mid-year Intake)">April (Mid-year Intake)</option>
                  <option value="July (Main Intake)">July (Main Intake)</option>
                  <option value="October (Autumn Intake)">October (Autumn Intake)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Your Questions / Notes (Optional)</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your educational background or preference..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 inline-flex items-center justify-center rounded-md bg-primary text-white px-5 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Book My Consultation'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-6">
              <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 text-green-500 p-3 mb-2">
                <CheckCircle className="h-8 w-8" />
              </span>
              <h3 className="font-display text-2xl text-foreground font-semibold">Consultation Requested</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you, {name}. Your request has been recorded. A Cornerstone advisor will call you at <span className="font-semibold text-foreground">{phone}</span> within 24 hours to schedule a conversation.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs text-primary font-semibold underline underline-offset-4 pt-4 block mx-auto"
              >
                Submit another inquiry
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Office location info */}
      <section className="container-prose mt-16 max-w-xl text-center text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground uppercase tracking-widest">Campus & Contact</p>
        <p>Cornerstone Pathway College Campus, Outer Ring Road, Bengaluru, India</p>
        <p>Direct Admissions Desk: +91 98765 43210 | Email: hello@cornerstone.edu</p>
      </section>
    </main>
  );
};

export default Contact;