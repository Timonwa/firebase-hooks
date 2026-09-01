'use client';

import { useAuth } from '@timonwa/firebase-hooks/auth';
import Link from 'next/link';
import { Toggle } from './controls';
import { useFirebase } from './firebase-provider';
import { ThemeToggle } from './theme';

/**
 * Settings and connection state, across the top of every page.
 *
 * These were at the foot of the sidebar, below the hook list, where nothing
 * announced them — you had to scroll a nav you had no reason to scroll. Page
 * level and always visible is where a page-level setting belongs.
 */
export function TopBar() {
  const { config, formatErrors, setFormatErrors, wrapCode, setWrapCode } = useFirebase();
  const { firebaseUser, isLoading } = useAuth();

  return (
    <header className="border-line bg-surface/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3 lg:px-10">
        <div className="flex min-w-0 flex-col text-xs">
          {config ? (
            <>
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
            </>
          ) : (
            <Link href="/" className="text-accent font-medium">
              Set up .env.local →
            </Link>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          <Toggle
            label="Format errors"
            hint="AUTH_ERROR_MESSAGES on the provider"
            checked={formatErrors}
            onChange={setFormatErrors}
          />
          <Toggle
            label="Wrap code"
            hint="Soft-wrap snippets and responses"
            checked={wrapCode}
            onChange={setWrapCode}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
