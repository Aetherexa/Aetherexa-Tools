# Aetherexa Tools

A privacy-first, free collection of practical browser utilities. Built with Astro + React + strict TypeScript, deployed as static files. No sign-up, account, server processing, API keys, or external service is required. Each interactive tool has a local error boundary to avoid a blank UI on unexpected React errors. Every tool also has readable step-by-step help and a FAQ.

## V1 tools

1. WhatsApp Order to CSV: paste line-based customer orders, review extracted items, export CSV.
2. CSV Date Format Fixer: select a date column and use safe automatic detection or an **explicit** source format, preview corrected and invalid rows, export.
3. Daily Price List Maker: paste item/price/unit lines, preview printable shop card, export CSV or print/save as PDF.
4. Exam Photo Resizer: exact pixels, optional center crop or contain, maximum KB.
5. Signature Resizer to 10 KB: exact pixels and file-size limit with honest feedback when the limit cannot be met.

Files and text are processed entirely **in your browser**. Images are never uploaded.

## Local development

Requires Node.js 20.11+.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run verify:build
npm run test:e2e
```

## Static deployment

Set `PUBLIC_SITE_URL=https://your-domain.example` and run `npm run build`. Deploy `dist/` to Cloudflare Pages (build command: `npm run build`, output directory: `dist`) or any static host. Configure the production domain **before publishing** so canonical and sitemap references are correct. Never ship `https://example.com` into a public release. GitHub Actions runs two-Node-version type checks, baseline coverage thresholds, static build checks, Chromium smoke tests and axe accessibility audits on PRs. Optional Cloudflare Pages deployment and SonarQube Cloud are available after secrets and variables are configured. See `SPRINT-STATUS.md` for setup and unverified gates.

## Tool architecture / MCP readiness

- `src/lib`: pure CSV/order/date/price transformations, separately unit-tested. These functions can be reused by future Node/SDK/MCP adapters without browser dependence.
- `src/lib/image.ts`: intentionally browser-specific Canvas adapter for image processing. A future MCP/server variant requires a separate image engine and resource limits.
- `src/lib/registry.ts`: central tool metadata for cards, searchable catalog and individual SEO pages. `src/lib/tool-contracts.ts` outlines transport-neutral input/output contracts for later SDK/MCP adapters.
- `src/components`: independent tool UIs, lazy-loaded only on their routes.

**MCP is not implemented in V1**. A future MCP service should use the shared pure transformations with clear schemas, rate-limits, validation and explicit privacy boundaries.

## Known boundaries

- WhatsApp import accepts **pasted text**, not direct WhatsApp integration. Human review of ambiguous/unparsed order lines is essential.
- CSV date Auto mode converts unambiguous DMY/MDY/ISO rows even when mixed. Ambiguous rows such as 03/04/2026 remain unchanged. An explicit input format is available when the source convention is known.
- Price rows use `item, price, unit` CSV notation. Print/save-as-PDF is provided through the browser Print dialog.
- Image compression uses JPEG. If even low-quality JPEG exceeds the requested KB, the UI warns and will not misleadingly claim success. Image transformations may affect EXIF metadata.
- CSV exports start with UTF-8 BOM for Excel interoperability.

## Publish to Aetherexa GitHub

The repository `Aetherexa/Aetherexa-Tools` exists and was verified as empty on 2026-10-09. To publish this working tree after reviewing it, run:

```bash
git init -b main
git add .
git commit -m "feat: launch Aetherexa browser utility suite v1"
git remote add origin https://github.com/Aetherexa/Aetherexa-Tools.git
git push -u origin main
```

If you use an SSH remote, replace the remote URL accordingly. Creating the GitHub repository is a separate step; this starter ZIP does not create it. The `samples/` directory provides realistic orders, date files and price rows for smoke testing.

## Release checklist

Do not deploy to production with an example URL: configure `PUBLIC_SITE_URL` to the real HTTPS origin, run `npm run verify:release`, and check `SPRINT-STATUS.md`. The site is deliberately `noindex` until a valid public URL is configured. Browser-based and CI verification must be completed after npm access is restored.
