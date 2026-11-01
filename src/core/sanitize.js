/* global DOMParser, URL */
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['a', 'p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = ['href'];

// Force external links in sanitized HTML to open safely in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Sanitize third-party HTML (e.g. CoinGecko descriptions) before rendering.
 * Only basic formatting tags and http(s) links survive.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  });
}

/** Strip all markup and return plain text. */
export function htmlToText(html) {
  if (!html) return '';
  // DOMParser builds an inert document: no script execution, no resource loading.
  return new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
}

/** Return the URL only if it uses http(s), otherwise an empty string. */
export function safeExternalUrl(url) {
  if (typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}
