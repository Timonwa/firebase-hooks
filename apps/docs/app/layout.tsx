import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { appName } from '@/lib/shared';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  // Without this, OG and Twitter image URLs resolve against localhost in production.
  metadataBase: new URL('https://firebase-hooks.vercel.app'),
  title: {
    default: `${appName} — Typed React hooks for Firebase`,
    template: `%s · ${appName}`,
  },
  description:
    'Typed React hooks for Firebase — one hook per flow, with its state, errors, and callbacks handled. Every action returns a result you can branch on.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
