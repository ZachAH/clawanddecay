import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';

const today = new Date().toISOString().split('T')[0];

const links = [
  { url: '/',           changefreq: 'weekly',   priority: 1.0, lastmod: today },
  { url: '/merch',      changefreq: 'weekly',   priority: 0.9, lastmod: today },
  { url: '/our-story',  changefreq: 'monthly',  priority: 0.7, lastmod: '2025-01-01' },
  { url: '/faq-page',   changefreq: 'monthly',  priority: 0.7, lastmod: '2025-01-01' },
  { url: '/contact-us', changefreq: 'yearly',   priority: 0.5, lastmod: '2025-01-01' },
  // /cart, /success, /cancel are excluded: disallowed in robots.txt or transient pages
];

const sitemap = new SitemapStream({ hostname: 'https://clawanddecay.com' });

streamToPromise(sitemap).then((data) =>
  fs.writeFileSync('./public/sitemap.xml', data.toString())
);

links.forEach(link => sitemap.write(link));
sitemap.end();
