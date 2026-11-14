import {
  checkSize,
  simulateDarkMode,
  transformForClient,
} from '@emailens/engine';
import { loadHtml, serializeHtml } from './dom.js';
import { applyAppleAutoLink } from './pipeline/appleAutoLink.js';
import { applyBlockExternalCss } from './pipeline/blockExternalCss.js';
import { applyBlockImages } from './pipeline/blockImages.js';
import { applyDpiScale } from './pipeline/dpiScale.js';
import { applyExternalBanner } from './pipeline/externalBanner.js';
import { applySafeLinks } from './pipeline/safeLinks.js';
import { applyVmlFallback } from './pipeline/vmlFallback.js';
import type { PreviewOptions, PreviewResult } from './types.js';

/**
 * Transform raw email HTML for a B2B client preview in the browser.
 *
 * Order: B2B toggles → emailens client transform → dark mode / DPI.
 */
export function previewEmail(html: string, options: PreviewOptions): PreviewResult {
  const started = performance.now();
  const $ = loadHtml(html);

  if (options.blockExternalCss) {
    applyBlockExternalCss($);
  }
  if (options.blockImages) {
    applyBlockImages($);
  }
  if (options.safeLinks) {
    applySafeLinks($);
  }
  if (options.externalBanner) {
    applyExternalBanner($);
  }
  if (options.vmlFallback && options.client === 'outlook-windows-legacy') {
    applyVmlFallback($);
  }
  if (options.appleAutoLink && options.client === 'apple-mail-macos') {
    applyAppleAutoLink($);
  }

  let workingHtml = serializeHtml($);

  const transformed = transformForClient(workingHtml, options.client);
  workingHtml = transformed.html;
  const warnings = [...transformed.warnings];

  if (options.darkMode) {
    const dark = simulateDarkMode(workingHtml, options.client);
    workingHtml = dark.html;
    warnings.push(...dark.warnings);
  }

  if (options.dpiScale && options.dpiScale !== 1 && options.client === 'outlook-windows-legacy') {
    const dpi$ = loadHtml(workingHtml);
    applyDpiScale(dpi$, options.dpiScale);
    workingHtml = serializeHtml(dpi$);
  }

  const size = checkSize(html);
  const durationMs = performance.now() - started;

  return {
    html: workingHtml,
    warnings,
    meta: {
      htmlBytes: size.htmlBytes,
      humanSize: size.humanSize,
      gmailClipped: size.clipped || size.htmlBytes > 102 * 1024,
      client: options.client,
      durationMs,
    },
  };
}
