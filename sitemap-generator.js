import fs from 'fs';
import { SitemapStream, streamToPromise } from 'sitemap';

const links = [
    { url: '/', changefreq: 'monthly', priority: 1.0 },
    { url: '/merch', changefreq: 'weekly', priority: 0.8 },
    { url: '/contact-us', changefreq: 'monthly', priority: 0.7 },
    { url: '/our-story', changefreq: 'monthly', priority: 0.7 },
    { url: '/faq-page', changefreq: 'monthly', priority: 0.7 },
    { url: '/cart', changefreq: 'weekly', priority: 0.5 },
    // These routes are for internal Stripe redirects and typically don't need to be in the sitemap
    // { url: '/success', changefreq: 'never', priority: 0.1 },
    // { url: '/cancel', changefreq: 'never', priority: 0.1 },
  ];

const sitemap = new SitemapStream({ hostname: 'https://clawanddecay.com' });

// This line is key: it writes the file to the public directory
streamToPromise(sitemap).then((data) =>
    fs.writeFileSync('./public/sitemap.xml', data.toString())
  );

links.forEach(link => sitemap.write(link));
sitemap.end();