import type { CheerioRoot } from '../dom.js';

const REMOTE_URL = /^(https?:)?\/\//i;

function isRemoteUrl(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('cid:')) return false;
  return REMOTE_URL.test(trimmed) || (!trimmed.startsWith('#') && trimmed.includes('/'));
}

/**
 * Replace remote `<img>` and `background-image` with dimension/alt placeholders.
 */
export function applyBlockImages($: CheerioRoot): void {
  $('img').each((_, element) => {
    const el = $(element);
    const src = el.attr('src');
    if (!isRemoteUrl(src)) return;

    const alt = el.attr('alt')?.trim() || 'Image';
    const width = el.attr('width') || el.css('width') || '';
    const height = el.attr('height') || el.css('height') || '';
    const sizeHint = [width && `w=${width}`, height && `h=${height}`]
      .filter(Boolean)
      .join(' ');

    const label = sizeHint ? `[${alt} · ${sizeHint}]` : `[${alt}]`;
    const placeholder = $('<span></span>')
      .attr('role', 'img')
      .attr('aria-label', alt)
      .attr(
        'style',
        [
          'display:inline-block',
          'border:1px dashed #999',
          'background:#f3f3f3',
          'color:#555',
          'font:12px/1.4 system-ui,sans-serif',
          'padding:8px 10px',
          'text-align:center',
          'box-sizing:border-box',
          width ? `width:${String(width).includes('px') ? width : `${width}px`}` : '',
          height ? `min-height:${String(height).includes('px') ? height : `${height}px`}` : '',
        ]
          .filter(Boolean)
          .join(';'),
      )
      .text(label);

    el.replaceWith(placeholder);
  });

  $('[style*="background-image"], [background]').each((_, element) => {
    const el = $(element);
    const bgAttr = el.attr('background');
    if (bgAttr && isRemoteUrl(bgAttr)) {
      el.removeAttr('background');
      el.attr('data-blocked-background', bgAttr);
    }

    const style = el.attr('style');
    if (!style || !/background-image\s*:/i.test(style)) return;

    const nextStyle = style.replace(
      /background-image\s*:\s*url\((['"]?)(.*?)\1\)\s*;?/gi,
      (match, _q, url: string) => {
        if (!isRemoteUrl(url)) return match;
        return '/* blocked background-image */';
      },
    );
    el.attr('style', nextStyle);
  });
}
