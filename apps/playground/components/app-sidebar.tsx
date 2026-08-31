'use client';

import { useAuth } from '@timonwa/firebase-hooks/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GROUPS, toAnchor } from '@/lib/hooks-map';
import { useFirebase } from './firebase-provider';

export function AppSidebar() {
  const pathname = usePathname();
  const { config } = useFirebase();
  const { firebaseUser, isLoading } = useAuth();

  // `self-start` is what makes sticky work here: flex items stretch to the
  // container's full height by default, so the aside was already as tall as the
  // page and had nothing to stick against.
  return (
    <aside className="border-line bg-surface w-full shrink-0 border-b lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:self-start lg:overflow-y-auto lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-6 p-5">
        <div>
          <Link href="/" className="font-mono text-sm font-semibold">
            firebase-hooks
          </Link>
          <p className="text-muted mt-1 text-xs">playground</p>
        </div>

        {/* Connection state sits at the top because nothing below it works
            until a project is connected. */}
        <div className="surface p-3 text-xs">
          {config ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-muted">
                Project <span className="text-fg font-mono">{config.projectId}</span>
              </span>
              <span className="text-muted">
                {isLoading
                  ? 'checking…'
                  : firebaseUser
                    ? `Signed in — ${firebaseUser.email ?? `anon ${firebaseUser.uid.slice(0, 6)}`}`
                    : 'Signed out'}
              </span>
            </div>
          ) : (
            <Link href="/" className="text-accent font-medium">
              Set up .env.local →
            </Link>
          )}
        </div>

        <nav className="flex flex-col gap-5">
          {GROUPS.map((group) => {
            const active = pathname === group.href;
            return (
              <div key={group.href}>
                <Link
                  href={group.href}
                  className={`mb-2 block text-xs font-semibold tracking-wider uppercase ${
                    active ? 'text-fg' : 'text-muted hover:text-fg'
                  }`}
                >
                  {group.label}
                </Link>
                <ul className="border-line flex flex-col gap-0.5 border-l pl-3">
                  {group.hooks.map((hook) => (
                    <li key={hook}>
                      <Link
                        href={`${group.href}#${toAnchor(hook)}`}
                        className="text-muted hover:text-accent block py-0.5 font-mono text-xs"
                      >
                        {hook}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <a
          href="https://firebase-hooks.vercel.app/docs"
          target="_blank"
          rel="noreferrer noopener"
          className="text-muted hover:text-fg text-xs underline underline-offset-4"
        >
          Read the docs ↗
        </a>
      </div>
    </aside>
  );
}
