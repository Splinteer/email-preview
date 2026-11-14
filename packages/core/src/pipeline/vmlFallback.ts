import type { CheerioRoot } from '../dom.js';

/**
 * Minimal VML → HTML/CSS fallback for Outlook Classic shapes.
 * Not a Word engine — only common `v:rect` / `v:roundrect` wrappers.
 */
export function applyVmlFallback($: CheerioRoot): void {
  $('v\\:rect, v\\:roundrect, rect, roundrect').each((_, element) => {
    const el = $(element);
    const tag = (el.prop('tagName') as string | undefined)?.toLowerCase() ?? '';
    const isRound = tag.includes('roundrect');
    const fill = el.attr('fillcolor') || el.attr('fill') || '#ffffff';
    const stroke = el.attr('strokecolor') || '#000000';
    const style = el.attr('style') ?? '';
    const arcsize = el.attr('arcsize');

    const radius =
      isRound && arcsize
        ? `border-radius:${arcsize}`
        : isRound
          ? 'border-radius:8px'
          : '';

    const inner = el.find('v\\:textbox, textbox').html() ?? el.html() ?? '';

    const replacement = $('<div></div>')
      .attr('data-sdh-vml', tag || 'shape')
      .attr(
        'style',
        [
          style,
          `background:${fill}`,
          `border:1px solid ${stroke}`,
          radius,
          'box-sizing:border-box',
        ]
          .filter(Boolean)
          .join(';'),
      )
      .html(inner);

    el.replaceWith(replacement);
  });

  // Drop leftover VML namespaces noise that Word would ignore in HTML view
  $('v\\:*, o\\:*, w\\:*').each((_, element) => {
    const el = $(element);
    if (el.attr('data-sdh-vml')) return;
    const html = el.html();
    if (html) el.replaceWith(html);
    else el.remove();
  });
}
