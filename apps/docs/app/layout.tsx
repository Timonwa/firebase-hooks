import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { JsonLd } from '@/components/json-ld';
import { siteGraph } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { packageName } from '@/lib/shared';
import { siteConfig } from '@/lib/site';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// Spread first, explicit keys after, so the title template can't be wiped by
// the spread. metadataBase resolves every relative canonical and OG path.
export const metadata: Metadata = {
  ...buildMetadata(),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${packageName} — Typed React hooks for Firebase`,
    template: `%s · ${packageName}`,
  },
  authors: [{ name: siteConfig.author, url: siteConfig.socials[0] }],
  creator: siteConfig.author,
  keywords: [
    'react',
    'firebase',
    'firebase auth',
    'react hooks',
    'typescript',
    'authentication',
    'nextjs',
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider>{children}</RootProvider>
        <JsonLd data={siteGraph()} />
      </body>
    </html>
  );
}
