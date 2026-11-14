import type { CheerioRoot } from '../dom.js';

const PHONE_RE = /(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)/g;
const DOMAIN_RE = /(?<!\w|@|\/)((?:[a-z0-9-]+\.)+(?:com|fr|net|org|io|co|eu|dev))(?!\w)/gi;
const DATE_RE =
  /(?<!\w)((?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})|(?:\d{1,2}\s+(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+\d{4}))(?!\w)/gi;

const LINK_STYLE = 'color:#0a84ff;text-decoration:underline';

function wrapMatches(text: string, regex: RegExp, hrefFor: (m: string) => string): string {
  return text.replace(regex, (match) => {
    const href = hrefFor(match);
    return `<a href="${href}" data-sdh-autolink="true" style="${LINK_STYLE}">${match}</a>`;
  });
}

function autoLinkPlainText(text: string): string {
  let next = wrapMatches(text, PHONE_RE, (m) => `tel:${m.replace(/[^\d+]/g, '')}`);
  next = wrapMatches(next, DOMAIN_RE, (m) => `https://${m}`);
  next = wrapMatches(next, DATE_RE, () => '#');
  return next;
}

function needsAutoLink(text: string): boolean {
  PHONE_RE.lastIndex = 0;
  DOMAIN_RE.lastIndex = 0;
  DATE_RE.lastIndex = 0;
  return PHONE_RE.test(text) || DOMAIN_RE.test(text) || DATE_RE.test(text);
}

/**
 * Simulate Apple Mail auto-linking (blue underlined) on plain-text phones, domains, dates.
 */
export function applyAppleAutoLink($: CheerioRoot): void {
  const nodes: Array<{ el: ReturnType<CheerioRoot>; html: string }> = [];

  $('*').each((_, element) => {
    const el = $(element);
    const tag = ((el.prop('tagName') as string | undefined) ?? '').toLowerCase();
    if (['a', 'script', 'style', 'textarea', 'code', 'pre'].includes(tag)) return;

    el.contents().each((__, child) => {
      if (child.type !== 'text') return;
      const text = 'data' in child ? String(child.data ?? '') : '';
      if (!text || !needsAutoLink(text)) return;
      const linked = autoLinkPlainText(text);
      if (linked === text) return;
      nodes.push({ el: $(child), html: linked });
    });
  });

  for (const { el, html } of nodes) {
    el.replaceWith(html);
  }
}
