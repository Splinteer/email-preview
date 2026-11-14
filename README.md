# @supplydatahub/email-preview

Real-time B2B email client preview in the browser — no VMs, no server round-trips.

Composes [`@emailens/engine`](https://github.com/emailens/engine) (MIT) client transforms / dark mode / caniemail-backed warnings with a B2B gateway pipeline (blocked images, `[EXTERNE]` banner, Safe Links, external CSS strip) and optional Angular iframe shell.

## Packages

| Package | Role |
| --- | --- |
| [`@supplydatahub/email-preview`](./packages/core) | Framework-free `previewEmail()` |
| [`@supplydatahub/email-preview-angular`](./packages/angular) | Standalone `<sdh-email-preview>` |
| [`apps/playground`](./apps/playground) | Vite live editor |

## Quick start (core)

```bash
pnpm add @supplydatahub/email-preview
```

```ts
import { previewEmail } from '@supplydatahub/email-preview';

const { html, warnings, meta } = previewEmail(rawHtml, {
  client: 'outlook-web',
  blockImages: true,
  externalBanner: true,
  safeLinks: true,
  blockExternalCss: true,
  darkMode: false,
});

iframe.srcdoc = html;
```

### Clients (Phase 1)

| ID | Label |
| --- | --- |
| `outlook-web` | Microsoft 365 / OWA |
| `outlook-windows-legacy` | Outlook Classic (Word) |
| `gmail-web` | Gmail Web |
| `apple-mail-macos` | Apple Mail |

## Angular

```bash
pnpm add @supplydatahub/email-preview @supplydatahub/email-preview-angular
```

```ts
import { EmailPreviewComponent } from '@supplydatahub/email-preview-angular';

@Component({
  imports: [EmailPreviewComponent],
  template: `
    <sdh-email-preview
      [html]="html()"
      client="gmail-web"
      [blockImages]="true"
      [showWarnings]="true"
    />
  `,
})
export class Demo {}
```

## Local development

```bash
pnpm install
pnpm --filter @supplydatahub/email-preview test
pnpm --filter @supplydatahub/email-preview build
pnpm --filter @supplydatahub/email-preview-angular build
pnpm dev   # playground on http://localhost:5177
```

### Link into another monorepo (e.g. Supply Data Hub)

```json
{
  "dependencies": {
    "@supplydatahub/email-preview": "file:../email-preview/packages/core",
    "@supplydatahub/email-preview-angular": "file:../email-preview/packages/angular/dist"
  }
}
```

Build both packages first. Or use `pnpm link`.

## Repository

https://github.com/Splinteer/email-preview

## Publish

Requires npm login and access to the `@supplydatahub` scope (or rename the package scope before first publish).

```bash
pnpm --filter @supplydatahub/email-preview build
pnpm --filter @supplydatahub/email-preview-angular build
# from packages/core
pnpm publish --access public
# from packages/angular/dist (ng-packagr output)
pnpm publish --access public
```

CI publishes on GitHub Release when repository secret `NPM_TOKEN` is configured.

## Attribution

- Client CSS transforms, dark-mode curves, and observed overrides: [**@emailens/engine**](https://github.com/emailens/engine) (MIT)
- Compatibility tables: [**Can I Email**](https://www.caniemail.com/) (`data.json`)
- Inspiration for in-browser (non-Playwright) client simulation: [ahmetskilinc/email-renderer](https://github.com/ahmetskilinc/email-renderer)

## License

MIT © Supply Data Hub
