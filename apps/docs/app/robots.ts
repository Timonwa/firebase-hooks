import type { MetadataRoute } from 'next';
import { isIndexableEnv, siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments get a blanket disallow so Vercel's per-commit URLs
  // never compete with the production site for the same content.
  if (!isIndexableEnv) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    // AI crawlers are deliberately allowed: being cited by an answer engine is
    // how a library like this gets found, and the docs are public anyway.
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/og/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
