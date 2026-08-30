import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { FirebaseProvider } from '@/components/firebase-provider';
import { SiteNav } from '@/components/site-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Demo · @timonwa/firebase-hooks',
  description:
    'Try every hook against your own Firebase project. Nothing is sent anywhere — your config stays in this browser.',
  // A scratch app for trying hooks has no business in search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <FirebaseProvider>
          <SiteNav />
          <main className="mx-auto w-full max-w-3xl px-6 py-10">{children}</main>
        </FirebaseProvider>
      </body>
    </html>
  );
}
