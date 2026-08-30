import { Heart } from 'lucide-react';
import Link from 'next/link';
import {
  authorName,
  authorUrl,
  gitConfig,
  npmUrl,
  packageName,
  packageVersion,
  supportUrl,
} from '@/lib/shared';

const REPO_URL = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

type FooterLink = { text: string; href: string; external?: boolean };

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Docs',
    links: [
      { text: 'Getting started', href: '/docs/getting-started' },
      { text: 'How every hook works', href: '/docs/how-hooks-work' },
      { text: 'Guides', href: '/docs/guides' },
      { text: 'Auth reference', href: '/docs/auth' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { text: 'GitHub', href: REPO_URL, external: true },
      { text: 'npm', href: npmUrl, external: true },
      { text: 'Changelog', href: `${REPO_URL}/releases`, external: true },
      {
        text: 'Contributing',
        href: `${REPO_URL}/blob/main/CONTRIBUTING.md`,
        external: true,
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-fd-border mt-auto border-t">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-medium">{packageName}</p>
            <p className="text-fd-muted-foreground mt-2 max-w-xs text-sm text-pretty">
              Typed React hooks for Firebase — one hook per flow, with its state, errors
              and callbacks handled.
            </p>
            <a
              href={supportUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="border-fd-border hover:border-fd-primary/40 hover:text-fd-primary mt-5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <Heart className="size-3.5" aria-hidden />
              Sponsor this project
            </a>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="mb-3 text-xs font-semibold tracking-wider uppercase">
                {column.heading}
              </h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.text}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors"
                      >
                        {link.text}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors"
                      >
                        {link.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-fd-border text-fd-muted-foreground mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-sm">
          <p className="inline-flex items-center gap-1.5">
            Built with
            <Heart
              className="text-fd-primary size-3.5 fill-current"
              aria-label="love"
              role="img"
            />
            by{' '}
            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-fd-foreground font-medium underline underline-offset-4 transition-colors"
            >
              {authorName}
            </a>
          </p>
          <p className="font-mono text-xs">v{packageVersion} · MIT</p>
        </div>
      </div>
    </footer>
  );
}
