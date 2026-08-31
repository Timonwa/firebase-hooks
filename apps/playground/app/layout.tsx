import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { FirebaseProvider } from '@/components/firebase-provider';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Playground · @timonwa/firebase-hooks',
  description:
    'Run every hook in @timonwa/firebase-hooks against a live Firebase project.',
  // A scratch app for trying hooks has no business in search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <FirebaseProvider>
          <div className="flex min-h-dvh flex-col lg:flex-row">
            <AppSidebar />
            <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
              <div className="mx-auto w-full max-w-4xl">{children}</div>
            </main>
          </div>
        </FirebaseProvider>
      </body>
    </html>
  );
}
