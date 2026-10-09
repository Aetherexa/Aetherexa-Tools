import type { APIRoute } from 'astro';
import { tools } from '../lib/registry';
export const GET: APIRoute = () => {
  const base = process.env.PUBLIC_SITE_URL || 'https://aetherexa.invalid';
  const paths = ['/', '/privacy/', ...tools.map(t=>`/tools/${t.slug}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${new URL(path,base).toString()}</loc></url>`).join('')}</urlset>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
