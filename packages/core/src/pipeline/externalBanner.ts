import type { CheerioRoot } from '../dom.js';

const BANNER_HTML = `
<div data-sdh-external-banner="true" style="box-sizing:border-box;width:100%;margin:0 0 12px;padding:10px 14px;background:#fff4ce;border:1px solid #f0c36d;border-radius:2px;color:#5c4813;font:13px/1.4 Segoe UI,Arial,sans-serif;">
  <strong>[EXTERNE]</strong> Ce message provient d’un expéditeur externe à votre organisation.
</div>
`.trim();

export function applyExternalBanner($: CheerioRoot): void {
  const body = $('body');
  if (body.length) {
    body.prepend(BANNER_HTML);
    return;
  }
  $.root().prepend(BANNER_HTML);
}
