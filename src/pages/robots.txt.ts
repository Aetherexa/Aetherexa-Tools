import type { APIRoute } from 'astro';
export const GET: APIRoute = () => {
 const site = process.env.PUBLIC_SITE_URL;
 const content = site
   ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site).toString()}\n`
   : 'User-agent: *\nDisallow: /\n';
 return new Response(content,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};
