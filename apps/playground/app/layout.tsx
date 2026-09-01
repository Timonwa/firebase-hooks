import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { FirebaseProvider } from '@/components/firebase-provider';
import { Shell } from '@/components/shell';
import { ThemeProvider, themeScript } from '@/components/theme';
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
      <head>
        {/* Sets data-theme before the first paint. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a constant in
            this repo, not user input. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <FirebaseProvider>
            <Shell>{children}</Shell>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
