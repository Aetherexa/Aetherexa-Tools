const value = process.env.PUBLIC_SITE_URL?.trim();
if (!value) throw new Error('PUBLIC_SITE_URL must be set for production.');
let url;
try { url = new URL(value); }
catch { throw new Error('PUBLIC_SITE_URL must be an absolute https:// URL.'); }
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
    ['example.com', 'localhost', '127.0.0.1', 'aetherexa.invalid'].includes(url.hostname) ||
    ['.example', '.invalid', '.test', '.localhost'].some(suffix => url.hostname.endsWith(suffix))) {
  throw new Error('Set PUBLIC_SITE_URL to your real https:// origin, without a path, query, hash or credentials.');
}
console.log('Production site origin validated:', url.origin);
