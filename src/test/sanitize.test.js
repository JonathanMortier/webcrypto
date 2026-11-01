import { describe, it, expect } from 'vitest';
import { sanitizeHtml, htmlToText, safeExternalUrl } from '../core/sanitize.js';

describe('sanitizeHtml', () => {
  it('removes event handlers and scripts', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)"><script>alert(2)</script><p>ok</p>');
    expect(out).not.toMatch(/onerror|<script|<img|alert/);
    expect(out).toContain('<p>ok</p>');
  });

  it('keeps http(s) links and forces safe target/rel', () => {
    const out = sanitizeHtml('<a href="https://bitcoin.org" onclick="x()">Bitcoin</a>');
    expect(out).toContain('href="https://bitcoin.org"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).not.toContain('onclick');
  });

  it('drops javascript: links', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('returns an empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});

describe('htmlToText', () => {
  it('strips markup and decodes entities', () => {
    expect(htmlToText('<p>A &amp; <a href="https://x.com">B</a></p>')).toBe('A & B');
  });

  it('does not execute handlers while parsing', () => {
    window.__pwned = false;
    htmlToText('<img src=x onerror="window.__pwned = true">');
    expect(window.__pwned).toBe(false);
  });
});

describe('safeExternalUrl', () => {
  it('accepts http and https URLs', () => {
    expect(safeExternalUrl('https://bitcoin.org/')).toBe('https://bitcoin.org/');
    expect(safeExternalUrl('http://example.com')).toBe('http://example.com/');
  });

  it('rejects other schemes and invalid values', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBe('');
    expect(safeExternalUrl(' JavaScript:alert(1)')).toBe('');
    expect(safeExternalUrl('data:text/html,<script>')).toBe('');
    expect(safeExternalUrl('not a url')).toBe('');
    expect(safeExternalUrl(null)).toBe('');
  });
});
