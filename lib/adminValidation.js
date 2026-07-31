const isNonEmpty = (value) => String(value || '').trim().length > 0;

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const isValidPhone = (value) =>
  /^[+()\-.\s0-9]{7,20}$/.test(String(value || '').trim());

export const isValidHttpUrl = (value) => {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidPathOrHttpUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return false;
  if (raw.startsWith('/')) return true;
  return isValidHttpUrl(raw);
};

const normalizeErrors = (errors) => errors.filter(Boolean);

export const validateLoginForm = ({ username, password }) =>
  normalizeErrors([
    isNonEmpty(username) ? '' : 'Username is required.',
    isNonEmpty(password) ? '' : 'Password is required.',
    String(password || '').length >= 8 ? '' : 'Password must be at least 8 characters long.',
  ]);

export const validateUniversityForm = (form) =>
  normalizeErrors([
    isNonEmpty(form.name) ? '' : 'University name is required.',
    isNonEmpty(form.city) ? '' : 'University city is required.',
    isNonEmpty(form.country) ? '' : 'Country is required.',
    Array.isArray(form.subjects)
      ? form.subjects.length > 0
        ? ''
        : 'At least one subject is required.'
      : isNonEmpty(form.subjects)
        ? ''
        : 'Subject tracks are required.',
    isNonEmpty(form.pathway) ? '' : 'Pathway is required.',
    isNonEmpty(form.transferYear) ? '' : 'Transfer year is required.',
    isNonEmpty(form.awardingBody) ? '' : 'Awarding body is required.',
    Number.isFinite(Number(form.costLakhsMin)) ? '' : 'Minimum cost must be a number.',
    Number.isFinite(Number(form.costLakhsMax)) ? '' : 'Maximum cost must be a number.',
    Number.isFinite(Number(form.emiMonthly)) ? '' : 'EMI must be a number.',
    Number(form.costLakhsMin) <= Number(form.costLakhsMax)
      ? ''
      : 'Minimum cost must be less than or equal to maximum cost.',
  ]);

export const validateStoryForm = (form) =>
  normalizeErrors([
    isNonEmpty(form.initials) ? '' : 'Initials are required.',
    isNonEmpty(form.startPoint) ? '' : 'Start point is required.',
    isNonEmpty(form.pathway) ? '' : 'Pathway taken is required.',
    isNonEmpty(form.destination) ? '' : 'Destination university is required.',
  ]);

export const validateBannerForm = (form) =>
  normalizeErrors([
    isNonEmpty(form.title) ? '' : 'Banner title is required.',
    isNonEmpty(form.description) ? '' : 'Banner description is required.',
    form.button1Url ? (isValidPathOrHttpUrl(form.button1Url) ? '' : 'Primary button URL is invalid.') : '',
    form.button2Url ? (isValidPathOrHttpUrl(form.button2Url) ? '' : 'Secondary button URL is invalid.') : '',
    form.desktopImage ? (isValidHttpUrl(form.desktopImage) || form.desktopImage.startsWith('/') ? '' : 'Desktop image URL is invalid.') : '',
    form.mobileImage ? (isValidHttpUrl(form.mobileImage) || form.mobileImage.startsWith('/') ? '' : 'Mobile image URL is invalid.') : '',
    form.tabletImage ? (isValidHttpUrl(form.tabletImage) || form.tabletImage.startsWith('/') ? '' : 'Tablet image URL is invalid.') : '',
  ]);

export const validateLogoForm = (form) =>
  normalizeErrors([
    isNonEmpty(form.companyName) ? '' : 'Company name is required.',
    isNonEmpty(form.logoImage) ? '' : 'Logo image is required.',
    form.websiteUrl ? (isValidHttpUrl(form.websiteUrl) ? '' : 'Website URL must be a valid http(s) link.') : '',
  ]);

export const validateWebsiteSettings = (form) =>
  normalizeErrors([
    form.websiteName ? (String(form.websiteName).trim().length >= 2 ? '' : 'Website name is too short.') : '',
    form.demoFormUrl ? (isValidHttpUrl(form.demoFormUrl) ? '' : 'Demo form URL must be a valid http(s) link.') : '',
    ['light', 'dark', 'system'].includes(form.theme || 'system') ? '' : 'Theme must be light, dark, or system.',
  ]);

export const validateContactSettings = (form) =>
  normalizeErrors([
    form.email ? (isValidEmail(form.email) ? '' : 'Primary email is invalid.') : '',
    form.supportEmail ? (isValidEmail(form.supportEmail) ? '' : 'Support email is invalid.') : '',
    form.recipientEmail ? (isValidEmail(form.recipientEmail) ? '' : 'Recipient email is invalid.') : '',
    form.ccEmail ? (isValidEmail(form.ccEmail) ? '' : 'CC email is invalid.') : '',
    form.bccEmail ? (isValidEmail(form.bccEmail) ? '' : 'BCC email is invalid.') : '',
    form.phoneNumber ? (isValidPhone(form.phoneNumber) ? '' : 'Phone number looks invalid.') : '',
    form.whatsappNumber ? (isValidPhone(form.whatsappNumber) ? '' : 'WhatsApp number looks invalid.') : '',
    form.facebookUrl ? (isValidHttpUrl(form.facebookUrl) ? '' : 'Facebook URL must be a valid http(s) link.') : '',
    form.instagramUrl ? (isValidHttpUrl(form.instagramUrl) ? '' : 'Instagram URL must be a valid http(s) link.') : '',
    form.linkedinUrl ? (isValidHttpUrl(form.linkedinUrl) ? '' : 'LinkedIn URL must be a valid http(s) link.') : '',
    form.twitterUrl ? (isValidHttpUrl(form.twitterUrl) ? '' : 'X/Twitter URL must be a valid http(s) link.') : '',
    form.youtubeUrl ? (isValidHttpUrl(form.youtubeUrl) ? '' : 'YouTube URL must be a valid http(s) link.') : '',
    form.telegramUrl ? (isValidHttpUrl(form.telegramUrl) ? '' : 'Telegram URL must be a valid http(s) link.') : '',
    form.pinterestUrl ? (isValidHttpUrl(form.pinterestUrl) ? '' : 'Pinterest URL must be a valid http(s) link.') : '',
    form.latitude !== '' && form.latitude !== undefined && Number.isFinite(Number(form.latitude))
      ? ''
      : form.latitude
        ? 'Latitude must be numeric.'
        : '',
    form.longitude !== '' && form.longitude !== undefined && Number.isFinite(Number(form.longitude))
      ? ''
      : form.longitude
        ? 'Longitude must be numeric.'
        : '',
  ]);

export const validatePageDraft = (page) =>
  normalizeErrors([
    isNonEmpty(page.title) ? '' : 'Page title is required.',
    page.metaDescription && String(page.metaDescription).length > 260
      ? 'Meta description should be 260 characters or fewer.'
      : '',
    Array.isArray(page.sections) && page.sections.length > 0
      ? ''
      : 'At least one section is required.',
    Array.isArray(page.sections) && new Set(page.sections.map((section) => String(section.sectionId || '').trim())).size !== page.sections.length
      ? 'Section IDs must be unique.'
      : '',
    Array.isArray(page.sections) && page.sections.some((section) => !isNonEmpty(section.sectionId))
      ? 'Every section needs a section ID.'
      : '',
  ]);

