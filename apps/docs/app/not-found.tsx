import { ArrowRight, BookOpen, Home } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { appName, packageName } from '@/lib/shared';

export const metadata: Metadata = buildMetadata({
  title: 'Page not found',
  description: 'That page does not exist. The hook reference and guides are still here.',
  noIndex: true,
});

const SUGGESTIONS = [
  {
    icon: BookOpen,
    title: 'Getting started',
    body: 'Install the package and sign a user in.',
    href: '/docs/getting-started',
  },
  {
    icon: ArrowRight,
    title: 'Auth reference',
    body: 'All twenty hooks, grouped by flow.',
    href: '/docs/auth',
  },
];

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">
        {/* Names the project up front: a 404 is often someone's first page on a
            site, arriving from a stale link with no idea where they landed. */}
        <Link
          href="/"
          className="text-fd-muted-foreground hover:text-fd-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <span className="bg-fd-primary size-1.5 rounded-full" />
          <span className="font-mono">{packageName}</span>
        </Link>

        <p className="text-fd-primary mt-8 font-mono text-sm font-medium">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          That page doesn’t exist
        </h1>
        <p className="text-fd-muted-foreground mt-3 text-pretty">
          The link may be out of date, or the page moved when the docs were reorganised.
          You’re on the {appName} documentation — try one of these.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {SUGGESTIONS.map(({ icon: Icon, title, body, href }) => (
            <Link
              key={href}
              href={href}
              className="surface group hover:border-fd-primary/40 flex items-center gap-4 px-4 py-3 transition-colors"
            >
              <span className="icon-tile size-9 shrink-0">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{title}</span>
                <span className="text-fd-muted-foreground text-sm">{body}</span>
              </span>
              <ArrowRight className="text-fd-muted-foreground ml-auto size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="text-fd-muted-foreground hover:text-fd-foreground mt-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <Home className="size-3.5" aria-hidden />
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
