import type { CheerioRoot } from '../dom.js';

const SAFE_LINK_HOST = 'https://nam.safelinks.protection.outlook.com';

function toBase64Url(value: string): string {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(value)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function encodeSafeLink(target: string): string {
  const params = new URLSearchParams({
    url: target,
    data: `05|02|${toBase64Url(target).slice(0, 48)}`,
    sdata: 'AAAA',
    reserved: '0',
  });
  return `${SAFE_LINK_HOST}/?${params.toString()}`;
}

function looksLikeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Rewrite href + visible link text the way Defender / Proofpoint Safe Links do
 * (long URLs that break table layouts).
 */
export function applySafeLinks($: CheerioRoot): void {
  $('a[href]').each((_, element) => {
    const el = $(element);
    const href = el.attr('href');
    if (!href || !looksLikeHttpUrl(href)) return;
    if (href.includes('safelinks.protection.outlook.com')) return;

    const wrapped = encodeSafeLink(href);
    el.attr('href', wrapped);
    el.attr('data-original-href', href);

    const text = el.text().trim();
    if (looksLikeHttpUrl(text) || text === href || text.length === 0) {
      el.text(wrapped);
    }
  });
}
