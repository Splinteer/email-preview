import type { CheerioRoot } from '../dom.js';

/**
 * Strip external stylesheets and @import rules (Google Fonts, CDN CSS).
 */
export function applyBlockExternalCss($: CheerioRoot): void {
  $('link[rel="stylesheet"], link[rel="preload"][as="style"]').remove();

  $('style').each((_, element) => {
    const el = $(element);
    const css = el.html() ?? '';
    const cleaned = css
      .replace(/@import\s+(?:url\()?['"]?[^'")\s]+['"]?\)?[^;]*;/gi, '/* blocked @import */')
      .replace(/@font-face\s*\{[^}]*\}/gi, '/* blocked @font-face */');
    el.html(cleaned);
  });
}
