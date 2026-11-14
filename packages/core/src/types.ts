import type { CSSWarning } from '@emailens/engine';

/** Phase-1 B2B clients (emailens IDs). */
export const EMAIL_CLIENT_IDS = [
  'outlook-web',
  'outlook-windows-legacy',
  'gmail-web',
  'apple-mail-macos',
] as const;

export type EmailClientId = (typeof EMAIL_CLIENT_IDS)[number];

export type DpiScale = 1 | 1.25 | 1.5;

export interface PreviewOptions {
  client: EmailClientId;
  /** Replace remote images with alt/dimension placeholders. */
  blockImages?: boolean;
  /** Inject an [EXTERNE] banner at the top of the body. */
  externalBanner?: boolean;
  /** Rewrite links like Microsoft Defender / Proofpoint Safe Links. */
  safeLinks?: boolean;
  /** Strip external stylesheets and @import (Google Fonts, etc.). */
  blockExternalCss?: boolean;
  /** Apply client-specific dark-mode luminance simulation. */
  darkMode?: boolean;
  /** Windows DPI zoom for Outlook Classic (default 1). */
  dpiScale?: DpiScale;
  /** Apple Mail-style auto-linking of phones, domains, dates in plain text. */
  appleAutoLink?: boolean;
  /** Minimal VML → HTML fallback for Outlook Classic. */
  vmlFallback?: boolean;
}

export interface PreviewMeta {
  htmlBytes: number;
  humanSize: string;
  gmailClipped: boolean;
  client: EmailClientId;
  durationMs: number;
}

export interface PreviewResult {
  html: string;
  warnings: CSSWarning[];
  meta: PreviewMeta;
}

export type { CSSWarning };
