// "use client";

// import React, { useEffect, useState } from 'react';
// import api from '../../../services/api';
// import { CheckCircle, ExternalLink, Mail, Phone } from 'lucide-react';

// const isAllowedMetaUrl = (value) => {
//   try {
//     const parsed = new URL(String(value || '').trim());
//     return parsed.protocol === 'http:' || parsed.protocol === 'https:';
//   } catch {
//     return false;
//   }
// };

// const Contact = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [message, setMessage] = useState('');
//   const [preferredIntake, setPreferredIntake] = useState('July (Main Intake)');
//   const [contactSettings, setContactSettings] = useState(null);
//   const [activeMetaForm, setActiveMetaForm] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [iframeLoading, setIframeLoading] = useState(true);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     let mounted = true;

//     const loadContactPageData = async () => {
//       try {
//         const [contactRes, metaFormRes] = await Promise.all([
//           api.get('/settings/contact'),
//           api.get('/meta-form/active'),
//         ]);

//         if (!mounted) return;

//         setContactSettings(contactRes.data);
//         setActiveMetaForm(metaFormRes.data);
//         setIframeLoading(true);
//         setError('');
//       } catch (err) {
//         if (!mounted) return;
//         console.error('Error fetching contact page data:', err);
//         setError('The contact form could not be loaded right now. The fallback form is available below.');
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     loadContactPageData();
//     const intervalId = setInterval(loadContactPageData, 30000);

//     return () => {
//       mounted = false;
//       clearInterval(intervalId);
//     };
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/inquiries', {
//         type: 'consultation',
//         name,
//         email,
//         phone,
//         data: {
//           preferredIntake,
//           message,
//         },
//       });
//       setSubmitted(true);
//     } catch (err) {
//       console.error('Error submitting consultation inquiry:', err);
//       alert('There was a problem submitting your request. Please try again.');
//     }
//   };

//   const showMetaForm = Boolean(activeMetaForm?.formUrl && isAllowedMetaUrl(activeMetaForm.formUrl));

//   return (
//     <main className="flex-1 bg-background text-foreground pb-24">
//       <section className="container-prose pt-16 pb-12 text-center max-w-4xl">
//         <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Book a Consultation</p>
//         <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
//           {contactSettings?.contactPageTitle || 'One advisor. One conversation. No pressure.'}
//         </h1>
//         <p className="mt-4 text-muted-foreground text-sm max-w-2xl mx-auto">
//           {contactSettings?.description || 'Speak to a named advisor on the phone or on campus in Bengaluru. No sales pitch, no urgency theatre.'}
//         </p>
//       </section>
      

//       <section className="container-prose max-w-4xl">
//         {loading ? (
//           <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
//             <div className="animate-pulse space-y-4">
//               <div className="h-8 w-48 rounded bg-surface-2" />
//               <div className="h-[520px] rounded-2xl bg-surface-2" />
//             </div>
//           </div>
//         ) : showMetaForm ? (
//           <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
//             <div className="mb-4 flex flex-col gap-2 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Meta Lead Form</p>
//                 <h2 className="mt-1 font-display text-2xl">{activeMetaForm?.title || 'Embedded lead form'}</h2>
//                 {activeMetaForm?.description && (
//                   <p className="mt-2 text-sm text-muted-foreground">{activeMetaForm.description}</p>
//                 )}
//               </div>
//               <a
//                 href={activeMetaForm.formUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary"
//               >
//                 <ExternalLink className="h-4 w-4" />
//                 Open in new tab
//               </a>
//             </div>

//             {error && (
//               <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
//                 {error}
//               </div>
//             )}

//             <div className="overflow-hidden rounded-xl border border-border bg-background">
//               {iframeLoading && (
//                 <div className="flex h-[700px] items-center justify-center bg-surface-2">
//                   <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//                 </div>
//               )}
//               <iframe
//                 src={activeMetaForm.formUrl}
//                 title={activeMetaForm.title || 'Meta lead form'}
//                 width="100%"
//                 height="700"
//                 frameBorder="0"
//                 allowFullScreen
//                 loading="lazy"
//                 onLoad={() => setIframeLoading(false)}
//                 onError={() => {
//                   setError('The embedded Meta form failed to load. The fallback contact form is shown below.');
//                   setIframeLoading(false);
//                 }}
//                 className={iframeLoading ? 'hidden' : 'block'}
//               />
//             </div>

//             <p className="mt-3 text-xs text-muted-foreground">
//               This form is managed from the admin panel. When the active Meta form changes, the page refreshes automatically.
//             </p>
//           </div>
//         ) : (
//           <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:border-primary/40">
//             {error && (
//               <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
//                 {error}
//               </div>
//             )}

//             {!submitted ? (
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Full Name</label>
//                   <input
//                     type="text"
//                     required
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="John Doe"
//                     className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
//                   />
//                 </div>

//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Email Address</label>
//                     <input
//                       type="email"
//                       required
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="john@example.com"
//                       className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Phone Number</label>
//                     <input
//                       type="tel"
//                       required
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       placeholder="+91 98765 43210"
//                       className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Preferred Intake</label>
//                   <select
//                     value={preferredIntake}
//                     onChange={(e) => setPreferredIntake(e.target.value)}
//                     className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
//                   >
//                     <option value="January (Spring Intake)">January (Spring Intake)</option>
//                     <option value="April (Mid-year Intake)">April (Mid-year Intake)</option>
//                     <option value="July (Main Intake)">July (Main Intake)</option>
//                     <option value="October (Autumn Intake)">October (Autumn Intake)</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Your Questions / Notes (Optional)</label>
//                   <textarea
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     placeholder="Tell us about your educational background or preference..."
//                     rows={4}
//                     className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover"
//                 >
//                   Book My Consultation
//                 </button>
//               </form>
//             ) : (
//               <div className="space-y-4 py-6 text-center">
//                 <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-3 text-green-500 mb-2">
//                   <CheckCircle className="h-8 w-8" />
//                 </span>
//                 <h3 className="font-display text-2xl font-semibold text-foreground">Consultation Requested</h3>
//                 <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
//                   Thank you, {name}. Your request has been recorded. A Cornerstone advisor will call you at{' '}
//                   <span className="font-semibold text-foreground">{phone}</span> within 24 hours to schedule a conversation.
//                 </p>
//                 <button
//                   onClick={() => setSubmitted(false)}
//                   className="mx-auto block pt-4 text-xs font-semibold text-primary underline underline-offset-4"
//                 >
//                   Submit another inquiry
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </section>

//       <section className="container-prose mt-16 max-w-4xl">
//         <div className="grid gap-4 sm:grid-cols-3">
//           <div className="rounded-xl border border-border bg-surface p-5">
//             <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Office Address</p>
//             <p className="mt-3 text-sm leading-relaxed text-foreground">
//               {contactSettings?.officeAddress || 'Cornerstone Pathway College Campus, Outer Ring Road, Bengaluru, India'}
//             </p>
//           </div>
//           <div className="rounded-xl border border-border bg-surface p-5">
//             <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone & WhatsApp</p>
//             <p className="mt-3 text-sm leading-relaxed text-foreground">
//               {contactSettings?.phoneNumber || '+91 98765 43210'}
//               <br />
//               {contactSettings?.whatsappNumber || '+91 98765 43210'}
//             </p>
//           </div>
//           <div className="rounded-xl border border-border bg-surface p-5">
//             <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
//             <p className="mt-3 text-sm leading-relaxed text-foreground">
//               {contactSettings?.email || 'hello@cornerstone.edu'}
//               <br />
//               {contactSettings?.supportEmail || 'support@cornerstone.edu'}
//             </p>
//           </div>
//         </div>

//         <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
//           {contactSettings?.googleMapEmbed ? (
//             <div
//               className="overflow-hidden rounded-2xl border border-border bg-surface"
//               dangerouslySetInnerHTML={{ __html: contactSettings.googleMapEmbed }}
//             />
//           ) : (
//             <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-sm text-muted-foreground">
//               Add a Google map embed in Admin to show your office location here.
//             </div>
//           )}

//           <div className="rounded-2xl border border-border bg-surface p-6">
//             <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
//             <h2 className="mt-2 font-display text-2xl">Live contact routing</h2>
//             <p className="mt-3 text-sm text-muted-foreground">
//               The Meta lead form is loaded dynamically from the CMS. If no active form exists, this page falls back to the website contact form automatically.
//             </p>
//             <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <Mail className="h-4 w-4 text-primary" />
//                 <span>{contactSettings?.email || 'hello@cornerstone.edu'}</span>
//               </div>
//               <div className="mt-3 flex items-center gap-2">
//                 <Phone className="h-4 w-4 text-primary" />
//                 <span>{contactSettings?.phoneNumber || '+91 98765 43210'}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default Contact;

"use client";

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { CheckCircle, ExternalLink, Mail, Phone } from 'lucide-react';

// Accepts a URL that may be missing its protocol (e.g. "www.example.com/..."
// or "example.com/...") and normalizes it to a valid https URL. Returns null
// if it still can't be parsed as a URL at all.
const normalizeMetaUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const candidates = raw.match(/^https?:\/\//i) ? [raw] : [`https://${raw}`];

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // try next candidate
    }
  }
  return null;
};

// Backends often wrap the payload differently between endpoints
// (e.g. { settings: {...} }, { data: {...} }, or the raw object itself).
const extractWebsiteSettings = (payload) => {
  if (!payload) return null;

  const candidate =
    payload?.data?.settings ||
    payload?.data?.data ||
    payload?.data ||
    payload?.settings ||
    payload;

  if (!candidate || typeof candidate !== 'object') return null;

  return candidate;
};

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredIntake, setPreferredIntake] = useState('July (Main Intake)');
  const [contactSettings, setContactSettings] = useState(null);
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const demoFormUrl = normalizeMetaUrl(websiteSettings?.demoFormUrl);
  const showDemoForm = Boolean(demoFormUrl);

  useEffect(() => {
    let mounted = true;

    const loadContactPageData = async () => {
      try {
        const [contactRes, websiteRes] = await Promise.all([
          api.get('/settings/contact'),
          api.get(`/settings/website?_ts=${Date.now()}`),
        ]);

        if (!mounted) return;

        setContactSettings(contactRes.data);
        setWebsiteSettings(extractWebsiteSettings(websiteRes));
        setError('');

        if (normalizeMetaUrl(extractWebsiteSettings(websiteRes)?.demoFormUrl)) {
          setIframeLoading(true);
          clearTimeout(window.__iframeLoadTimer);
          window.__iframeLoadTimer = setTimeout(() => {
            if (mounted) setIframeLoading(false);
          }, 15000);
        } else {
          setIframeLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching contact page data:', err);
        setError('The contact form could not be loaded right now. The fallback form is available below.');
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
      clearTimeout(window.__iframeLoadTimer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inquiries', {
        type: 'consultation',
        name,
        email,
        phone,
        data: {
          preferredIntake,
          message,
        },
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting consultation inquiry:', err);
      alert('There was a problem submitting your request. Please try again.');
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12 text-center max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Book a Consultation</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
          {contactSettings?.contactPageTitle || 'One advisor. One conversation. No pressure.'}
        </h1>
        <p className="mt-4 text-muted-foreground text-sm max-w-2xl mx-auto">
          {contactSettings?.description || 'Speak to a named advisor on the phone or on campus in Bengaluru. No sales pitch, no urgency theatre.'}
        </p>
      </section>


      <section className="container-prose max-w-4xl">
        {loading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 rounded bg-surface-2" />
              <div className="h-[520px] rounded-2xl bg-surface-2" />
            </div>
          </div>
        ) : showDemoForm ? (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Demo lead form</p>
                <h2 className="mt-1 font-display text-2xl">
                  {websiteSettings?.websiteName ? `${websiteSettings.websiteName} contact form` : 'Embedded lead form'}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This URL is managed from Website Settings in the admin panel.
                </p>
              </div>
              <a
                href={demoFormUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
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
                src={demoFormUrl}
                title="Embedded demo lead form"
                width="100%"
                height="700"
                style={{ border: 0, width: '100%', height: 700, display: iframeLoading ? 'none' : 'block' }}
                allow="clipboard-read; clipboard-write; clipboard-write-self; accelerometer; camera; gyroscope; microphone; payment"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setError('The embedded Meta form failed to load. The fallback contact form is shown below.');
                  setIframeLoading(false);
                }}
              />
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              This form is managed from the admin panel. When Website Settings change, the page refreshes automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:border-primary/40">
            {error && (
              <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {error}
              </div>
            )}

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
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Preferred Intake</label>
                  <select
                    value={preferredIntake}
                    onChange={(e) => setPreferredIntake(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover"
                >
                  Book My Consultation
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-6 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-3 text-green-500 mb-2">
                  <CheckCircle className="h-8 w-8" />
                </span>
                <h3 className="font-display text-2xl font-semibold text-foreground">Consultation Requested</h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Thank you, {name}. Your request has been recorded. A Cornerstone advisor will call you at{' '}
                  <span className="font-semibold text-foreground">{phone}</span> within 24 hours to schedule a conversation.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mx-auto block pt-4 text-xs font-semibold text-primary underline underline-offset-4"
                >
                  Submit another inquiry
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="container-prose mt-16 max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Office Address</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.officeAddress || 'Cornerstone Pathway College Campus, Outer Ring Road, Bengaluru, India'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone & WhatsApp</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.phoneNumber || '+91 98765 43210'}
              <br />
              {contactSettings?.whatsappNumber || '+91 98765 43210'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {contactSettings?.email || 'hello@cornerstone.edu'}
              <br />
              {contactSettings?.supportEmail || 'support@cornerstone.edu'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {contactSettings?.googleMapEmbed ? (
            <div
              className="overflow-hidden rounded-2xl border border-border bg-surface"
              dangerouslySetInnerHTML={{ __html: contactSettings.googleMapEmbed }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-sm text-muted-foreground">
              Add a Google map embed in Admin to show your office location here.
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
            <h2 className="mt-2 font-display text-2xl">Live contact routing</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The Meta lead form is loaded dynamically from the CMS. If no active form exists, this page falls back to the website contact form automatically.
            </p>
            <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>{contactSettings?.email || 'hello@cornerstone.edu'}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>{contactSettings?.phoneNumber || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
