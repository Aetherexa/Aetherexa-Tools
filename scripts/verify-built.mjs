import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
const routes = ['', 'privacy', 'tools/whatsapp-order-to-csv', 'tools/csv-date-format-fixer', 'tools/daily-price-list-maker', 'tools/exam-photo-resizer', 'tools/signature-resize-10kb'];
for (const route of routes) {
  const file = join('dist', route, 'index.html');
  const html = await readFile(file, 'utf8');
  if (!/<meta\s+name="description"/.test(html) || !/<h1\b/.test(html)) throw new Error(`Missing semantic SEO HTML: ${file}`);
  if (/<script\s+src="https?:\/\//.test(html)) throw new Error(`Unexpected third-party script: ${file}`);
  if (process.env.PUBLIC_SITE_URL) {
    const canonical = new URL(`/${route ? route + '/' : ''}`, process.env.PUBLIC_SITE_URL).toString();
    if (!html.includes(`rel="canonical" href="${canonical}"`)) throw new Error(`Canonical mismatch: ${file}`);
  } else if (!html.includes('content="noindex, nofollow"')) {
    throw new Error(`Unconfigured site must stay non-indexable: ${file}`);
  }
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
if ((sitemap.match(/<loc>/g) || []).length !== routes.length) throw new Error('Sitemap route count mismatch');
const robots = await readFile('dist/robots.txt', 'utf8');
if (!process.env.PUBLIC_SITE_URL && !robots.includes('Disallow: /')) throw new Error('Default robots.txt must block indexing');
if (process.env.PUBLIC_SITE_URL && !robots.includes('Sitemap: ')) throw new Error('Production robots.txt missing sitemap');
const missingPage = await stat('dist/404.html');
if (!missingPage.size) throw new Error('Missing custom 404 page');
const headers = await stat('dist/_headers');
if (!headers.size) throw new Error('Cloudflare headers are missing');
console.log(`Static verification passed for ${routes.length} pages, sitemap, robots and headers.`);
