import {
  EMAIL_CLIENT_IDS,
  previewEmail,
  type DpiScale,
  type EmailClientId,
  type PreviewOptions,
} from '@supplydatahub/email-preview';
import { SAMPLE_HTML } from './sample.html';
import './styles.css';

const CLIENT_LABELS: Record<EmailClientId, string> = {
  'outlook-web': 'Microsoft 365 (OWA)',
  'outlook-windows-legacy': 'Outlook Classic',
  'gmail-web': 'Gmail Web',
  'apple-mail-macos': 'Apple Mail',
};

const DEBOUNCE_MS = 12;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app missing');

app.innerHTML = `
  <div class="playground">
    <header class="playground__header">
      <h1>Email Preview</h1>
      <div class="playground__meta" id="meta" aria-live="polite"></div>
    </header>
    <section class="playground__editor" aria-label="HTML source">
      <div class="playground__toolbar" id="toolbar"></div>
      <textarea id="source" spellcheck="false" aria-label="Raw email HTML">${SAMPLE_HTML.replace(/</g, '&lt;')}</textarea>
    </section>
    <section class="playground__preview" aria-label="Client preview">
      <iframe class="playground__frame" id="frame" title="Email client preview" sandbox="allow-same-origin"></iframe>
      <ul class="playground__warnings" id="warnings"></ul>
    </section>
  </div>
`;

const source = document.querySelector<HTMLTextAreaElement>('#source')!;
const frame = document.querySelector<HTMLIFrameElement>('#frame')!;
const meta = document.querySelector<HTMLDivElement>('#meta')!;
const warnings = document.querySelector<HTMLUListElement>('#warnings')!;
const toolbar = document.querySelector<HTMLDivElement>('#toolbar')!;

source.value = SAMPLE_HTML;

const state: PreviewOptions = {
  client: 'outlook-web',
  blockImages: false,
  externalBanner: false,
  safeLinks: false,
  blockExternalCss: false,
  darkMode: false,
  dpiScale: 1,
  appleAutoLink: true,
  vmlFallback: true,
};

toolbar.innerHTML = `
  <label>Client
    <select id="client">
      ${EMAIL_CLIENT_IDS.map(
        (id) => `<option value="${id}">${CLIENT_LABELS[id]}</option>`,
      ).join('')}
    </select>
  </label>
  <label><input type="checkbox" id="blockImages" /> Images bloquées</label>
  <label><input type="checkbox" id="externalBanner" /> Bannière [EXTERNE]</label>
  <label><input type="checkbox" id="safeLinks" /> Safe Links</label>
  <label><input type="checkbox" id="blockExternalCss" /> Bloquer CSS externes</label>
  <label><input type="checkbox" id="darkMode" /> Dark mode</label>
  <label>DPI
    <select id="dpiScale">
      <option value="1">100%</option>
      <option value="1.25">125%</option>
      <option value="1.5">150%</option>
    </select>
  </label>
`;

const clientSelect = document.querySelector<HTMLSelectElement>('#client')!;
const dpiSelect = document.querySelector<HTMLSelectElement>('#dpiScale')!;

function bindToggle(id: keyof PreviewOptions, inputId: string): void {
  const input = document.querySelector<HTMLInputElement>(`#${inputId}`)!;
  input.checked = Boolean(state[id]);
  input.addEventListener('change', () => {
    (state as Record<string, unknown>)[id] = input.checked;
    scheduleRender();
  });
}

bindToggle('blockImages', 'blockImages');
bindToggle('externalBanner', 'externalBanner');
bindToggle('safeLinks', 'safeLinks');
bindToggle('blockExternalCss', 'blockExternalCss');
bindToggle('darkMode', 'darkMode');

clientSelect.value = state.client;
clientSelect.addEventListener('change', () => {
  state.client = clientSelect.value as EmailClientId;
  scheduleRender();
});

dpiSelect.addEventListener('change', () => {
  state.dpiScale = Number(dpiSelect.value) as DpiScale;
  scheduleRender();
});

let timer: ReturnType<typeof setTimeout> | undefined;

function scheduleRender(): void {
  clearTimeout(timer);
  timer = setTimeout(render, DEBOUNCE_MS);
}

function render(): void {
  const result = previewEmail(source.value, {
    ...state,
    appleAutoLink: state.client === 'apple-mail-macos',
    vmlFallback: state.client === 'outlook-windows-legacy',
  });

  frame.srcdoc = result.html;

  const clippedClass = result.meta.gmailClipped ? 'is-warn' : '';
  meta.innerHTML = `
    <span>Transform <strong>${result.meta.durationMs.toFixed(1)} ms</strong></span>
    <span>Size <strong>${result.meta.humanSize}</strong></span>
    <span class="${clippedClass}">Gmail clip <strong>${result.meta.gmailClipped ? 'YES (>102 Ko)' : 'no'}</strong></span>
    <span>Warnings <strong>${result.warnings.length}</strong></span>
  `;

  warnings.innerHTML = result.warnings
    .slice(0, 40)
    .map(
      (w) =>
        `<li><strong>${w.client}</strong> · ${w.property} — ${escapeHtml(w.message)}</li>`,
    )
    .join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

source.addEventListener('input', scheduleRender);
render();
