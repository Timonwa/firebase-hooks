import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteConfig } from '@/lib/site';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();

  return [
    { url: url('/'), changeFrequency: 'monthly', priority: 1 },
    // Every docs page, straight from the same source the navigation uses, so a
    // new page is listed the moment it exists — no second list to maintain.
    ...source.getPages().map((page) => ({
      url: url(page.url),
      changeFrequency: 'monthly' as const,
      // The reference is the reason people arrive, but getting started should
      // outrank an individual hook page.
      priority: page.url === '/docs' || page.url.split('/').length <= 3 ? 0.8 : 0.6,
    })),
  ];
}
