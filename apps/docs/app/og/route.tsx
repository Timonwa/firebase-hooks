import { ImageResponse } from 'next/og';
import { OgImage } from '@/components/og-image';
import { siteConfig } from '@/lib/site';

/**
 * The default OG card, for the home page, 404 and anything without its own.
 * Docs pages have a prerendered variant at /og/docs/[...slug].
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return new ImageResponse(
    <OgImage
      title={searchParams.get('title') ?? siteConfig.name}
      subtitle={searchParams.get('subtitle') ?? siteConfig.description}
    />,
    { width: 1200, height: 630 },
  );
}
