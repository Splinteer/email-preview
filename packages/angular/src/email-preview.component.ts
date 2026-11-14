import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  previewEmail,
  type DpiScale,
  type EmailClientId,
  type PreviewResult,
} from '@supplydatahub/email-preview';

export interface EmailPreviewComponentInputs {
  html: string;
  client: EmailClientId;
}

@Component({
  selector: 'sdh-email-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sdh-email-preview">
      @if (gmailClipped()) {
        <div class="sdh-email-preview__alert" role="status">
          HTML exceeds 102&nbsp;Ko — Gmail may truncate this message.
        </div>
      }
      <iframe
        class="sdh-email-preview__frame"
        title="Email client preview"
        sandbox="allow-same-origin"
        [attr.srcdoc]="srcdoc()"
      ></iframe>
      @if (showWarnings() && warnings().length) {
        <ul class="sdh-email-preview__warnings">
          @for (warning of warnings(); track warning.client + warning.property + warning.message) {
            <li>
              <strong>{{ warning.client }}</strong>
              · {{ warning.property }} — {{ warning.message }}
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .sdh-email-preview {
      display: flex;
      flex-direction: column;
      min-height: 240px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }

    .sdh-email-preview__alert {
      padding: 8px 12px;
      background: #fff4ce;
      border-bottom: 1px solid #f0c36d;
      color: #5c4813;
      font: 13px/1.4 system-ui, sans-serif;
    }

    .sdh-email-preview__frame {
      flex: 1;
      width: 100%;
      min-height: 320px;
      border: 0;
      background: #fff;
    }

    .sdh-email-preview__warnings {
      margin: 0;
      padding: 8px 12px;
      max-height: 120px;
      overflow: auto;
      list-style: none;
      border-top: 1px solid #e2e8f0;
      font: 12px/1.4 system-ui, sans-serif;
      color: #475569;
      background: #f8fafc;
    }

    .sdh-email-preview__warnings li + li {
      margin-top: 4px;
    }
  `,
})
export class EmailPreviewComponent {
  readonly html = input.required<string>();
  readonly client = input.required<EmailClientId>();
  readonly blockImages = input(false);
  readonly externalBanner = input(false);
  readonly safeLinks = input(false);
  readonly blockExternalCss = input(false);
  readonly darkMode = input(false);
  readonly dpiScale = input<DpiScale>(1);
  readonly appleAutoLink = input(true);
  readonly vmlFallback = input(true);
  readonly showWarnings = input(false);

  readonly result = computed<PreviewResult>(() =>
    previewEmail(this.html(), {
      client: this.client(),
      blockImages: this.blockImages(),
      externalBanner: this.externalBanner(),
      safeLinks: this.safeLinks(),
      blockExternalCss: this.blockExternalCss(),
      darkMode: this.darkMode(),
      dpiScale: this.dpiScale(),
      appleAutoLink: this.appleAutoLink() && this.client() === 'apple-mail-macos',
      vmlFallback: this.vmlFallback() && this.client() === 'outlook-windows-legacy',
    }),
  );

  /** Transformed HTML for iframe srcdoc (already pipeline-sanitized). */
  readonly srcdoc = computed(() => this.result().html);

  readonly warnings = computed(() => this.result().warnings);
  readonly gmailClipped = computed(() => this.result().meta.gmailClipped);
  readonly durationMs = computed(() => this.result().meta.durationMs);
}
