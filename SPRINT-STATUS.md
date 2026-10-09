# Aetherexa Tools — Implementation status

Updated: 2026-10-09. This is an implementation handoff, **not** a production release declaration.

## Sprint 1 — Utilities and quality

- [x] Hardened WhatsApp order extraction for exported chat timestamps and common bullet formats.
- [x] Expanded CSV/date/price validations, formula injection controls and image type/pixel limits.
- [x] Implemented 40+ Vitest regression cases, browser-image mocks and independent offline smoke checks.
- [x] Created mobile/desktop Chromium Playwright user-journey tests, actual JPEG-export scenario and automated WCAG A/AA scans across all five tools.
- [ ] Execute npm-installed Vitest, Astro type checks and Chromium E2E on CI. Network unavailable in this authoring runtime.
- [ ] Manual visual QA of the production build, supported languages and representative uploads.

## Sprint 2 — CI/CD and deployment

- [x] GitHub Actions quality gate (Node 20/22, TypeScript, coverage, static build checks, browser tests).
- [x] Added Dependabot configuration, optional SonarQube Cloud scan and Cloudflare Pages workflow.
- [x] Added Cloudflare Pages CSP/security headers and static asset caching.
- [x] Protected production deployment with a validated explicit HTTPS `PUBLIC_SITE_URL`.
- [ ] Generate/commit `package-lock.json` using an online npm install; CI currently uses npm install fallback.
- [ ] Configure Cloudflare and SonarQube account-specific variables/secrets. No account is connected yet.
- [ ] Confirm a green GitHub Actions run and provision the actual Cloudflare Pages project.

## Sprint 3 — Search visibility, performance and accessibility

- [x] Canonical and Open Graph tags, branded social preview, structured data, unique FAQ/help content on all five pages, sitemap and robots.
- [x] Site stays `noindex`/`Disallow: /` without real domain configuration.
- [x] Added 404 page, keyboard skip link, focus outlines, reduced-motion handling.
- [x] Added `verify:build` checks covering the expected generated HTML pages.
- [ ] Run Lighthouse (mobile/desktop), confirm axe-core passes in CI and complete human keyboard/screen-reader checks on a deployed preview.
- [ ] Submit the final sitemap in search engines after the public site URL is configured.

## Deployment variables and secrets

In the GitHub repository settings: **Variables** `PUBLIC_SITE_URL` (`https://your-final-domain`), `CLOUDFLARE_PAGES_PROJECT` (existing Pages project name), optionally `SONAR_PROJECT_KEY` and `SONAR_ORGANIZATION`. **Secrets** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optionally `SONAR_TOKEN`.

Set `PUBLIC_SITE_URL` to the same HTTPS origin served by Pages before enabling indexing. Configure the Pages project first (manual UI or CLI). Never commit tokens. Branch protection for `main` should require the `Verify / Node 22` and `Browser smoke (Chromium)` jobs once a green baseline exists.

## Local commands

```sh
npm install
npm run typecheck
npm run test:coverage
npm run test:e2e
PUBLIC_SITE_URL=https://your-domain.example npm run build
PUBLIC_SITE_URL=https://your-domain.example npm run verify:build
```

Restricted/offline testing:

```sh
npm run test:offline
npm run test:syntax
```

## Intentional product limits

The WhatsApp parser operates on pasted exported messages, not WhatsApp account data. Users must review unrecognized items. Image output always uses JPEG; small byte limits are not guaranteed. The site's MCP schemas are prospective contracts, not a deployed MCP server.
