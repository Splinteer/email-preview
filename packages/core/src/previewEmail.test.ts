import { describe, expect, it } from 'vitest';
import { previewEmail } from './previewEmail.js';

const SAMPLE = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
  <style>
    @import url('https://fonts.googleapis.com/css?family=Open+Sans');
    .btn { display: flex; border-radius: 8px; }
  </style>
</head>
<body>
  <p>Contactez-nous au 06 12 34 56 78 ou via supplydatahub.com</p>
  <p>Rendez-vous le 14/11/2026</p>
  <a href="https://example.com/campaign">https://example.com/campaign</a>
  <img src="https://cdn.example.com/hero.png" alt="Hero" width="600" height="200" />
  <div style="background-image:url('https://cdn.example.com/bg.png');padding:20px">Box</div>
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" fillcolor="#0078d4" stroke="f" style="width:200px;height:40px;">
    <v:textbox inset="0,0,0,0"><div>MSO CTA</div></v:textbox>
  </v:roundrect>
  <![endif]-->
</body>
</html>
`.trim();

describe('previewEmail', () => {
  it('transforms for gmail-web via emailens', () => {
    const result = previewEmail(SAMPLE, { client: 'gmail-web' });
    expect(result.meta.client).toBe('gmail-web');
    expect(result.html).toContain('body');
    expect(result.meta.durationMs).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('blocks remote images', () => {
    const result = previewEmail(SAMPLE, {
      client: 'outlook-web',
      blockImages: true,
    });
    expect(result.html).not.toContain('https://cdn.example.com/hero.png');
    expect(result.html).toContain('[Hero');
    expect(result.html).toMatch(/blocked background-image|data-blocked-background/);
  });

  it('injects external banner', () => {
    const result = previewEmail(SAMPLE, {
      client: 'outlook-web',
      externalBanner: true,
    });
    expect(result.html).toContain('[EXTERNE]');
    expect(result.html).toContain('data-sdh-external-banner');
  });

  it('rewrites Safe Links', () => {
    const result = previewEmail(SAMPLE, {
      client: 'outlook-web',
      safeLinks: true,
    });
    expect(result.html).toContain('safelinks.protection.outlook.com');
    expect(result.html).toContain('data-original-href');
  });

  it('strips external CSS', () => {
    const result = previewEmail(SAMPLE, {
      client: 'apple-mail-macos',
      blockExternalCss: true,
    });
    expect(result.html).not.toContain('fonts.googleapis.com');
    expect(result.html).not.toMatch(/<link[^>]+stylesheet/i);
  });

  it(
    'flags gmail clipping over 102KB',
    () => {
      const huge = `<html><body><p>${'x'.repeat(103 * 1024)}</p></body></html>`;
      const result = previewEmail(huge, { client: 'apple-mail-macos' });
      expect(result.meta.gmailClipped).toBe(true);
      expect(result.meta.htmlBytes).toBeGreaterThan(102 * 1024);
    },
    20_000,
  );

  it('applies dark mode without throwing', () => {
    const result = previewEmail(SAMPLE, {
      client: 'gmail-web',
      darkMode: true,
    });
    expect(result.html.length).toBeGreaterThan(0);
  });

  it('applies DPI scale for Outlook Classic', () => {
    const result = previewEmail(SAMPLE, {
      client: 'outlook-windows-legacy',
      dpiScale: 1.25,
    });
    expect(result.html).toContain('data-sdh-dpi="1.25"');
    expect(result.html).toMatch(/zoom:\s*125%/);
  });

  it('auto-links for Apple Mail', () => {
    const result = previewEmail(SAMPLE, {
      client: 'apple-mail-macos',
      appleAutoLink: true,
    });
    expect(result.html).toContain('data-sdh-autolink');
    expect(result.html).toContain('tel:');
  });

  it('converts VML roundrect for Outlook Classic', () => {
    const vml = `
      <html><body>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" fillcolor="#0078d4" style="width:200px;height:40px;">
          <v:textbox><div>CTA</div></v:textbox>
        </v:roundrect>
      </body></html>
    `;
    const result = previewEmail(vml, {
      client: 'outlook-windows-legacy',
      vmlFallback: true,
    });
    expect(result.html).toContain('data-sdh-vml');
    expect(result.html).toContain('CTA');
  });
});
