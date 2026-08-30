import type { Metadata } from 'next';
import { isIndexableEnv, siteConfig } from './site';

type BuildMetadataInput = {
  title?: string;
  description?: string;
  /** Becomes the self-referencing canonical, e.g. "/docs/auth/use-login". */
  path?: string;
  imageUrl?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

/**
 * Absolute on purpose: JSON-LD and feeds can't resolve relative image URLs.
 * Absolute URLs pass through `metadataBase` untouched, so metadata stays
 * consistent either way.
 */
export function getOgImageUrl({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
} = {}): string {
  const query = new URLSearchParams();
  if (title) query.set('title', title);
  if (subtitle) query.set('subtitle', subtitle);
  const suffix = query.toString();
  return `${siteConfig.url}/og${suffix ? `?${suffix}` : ''}`;
}

export function buildMetadata(input: BuildMetadataInput = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    path = '/',
    imageUrl,
    imageAlt = siteConfig.defaultImageAlt,
    noIndex = false,
    type = 'website',
  } = input;

  const image = {
    url: imageUrl ?? getOgImageUrl(),
    alt: imageAlt,
    width: 1200,
    height: 630,
  };
  const indexable = isIndexableEnv && !noIndex;

  return {
    // Added conditionally so spreading this never overwrites the root layout's
    // title template with `undefined`.
    ...(title !== undefined && { title }),
    description,
    alternates: { canonical: path },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        }
      : {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false, noarchive: true },
        },
    openGraph: {
      type,
      url: path,
      siteName: siteConfig.name,
      ...(title !== undefined && { title }),
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      ...(title !== undefined && { title }),
      description,
      images: [image],
    },
  };
}
