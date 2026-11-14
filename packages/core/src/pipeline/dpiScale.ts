import type { CheerioRoot } from '../dom.js';
import type { DpiScale } from '../types.js';

/**
 * Simulate Windows display scaling for Outlook Classic (Word engine).
 */
export function applyDpiScale($: CheerioRoot, scale: DpiScale): void {
  if (scale === 1) return;

  const percent = Math.round(scale * 100);
  const body = $('body');
  if (!body.length) return;

  const existing = body.attr('style') ?? '';
  body.attr(
    'style',
    [
      existing,
      `zoom:${percent}%`,
      `-webkit-text-size-adjust:${percent}%`,
      `transform-origin:top left`,
    ]
      .filter(Boolean)
      .join(';'),
  );
  body.attr('data-sdh-dpi', String(scale));
}
