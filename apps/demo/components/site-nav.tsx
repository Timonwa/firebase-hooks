'use client';

import { useAuth } from '@timonwa/firebase-hooks/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebase } from './firebase-provider';

const LINKS = [
  { href: '/', label: 'Setup' },
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-in/phone', label: 'Phone' },
  { href: '/forgot-password', label: 'Password' },
  { href: '/account', label: 'Account' },
];

export function SiteNav() {
  const pathname = usePathname();
  const { config, ready, disconnect, formatErrors, setFormatErrors } = useFirebase();
  const { firebaseUser, isLoading } = useAuth();

  return (
    <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
        <span className="font-mono text-sm font-semibold">firebase-hooks demo</span>

        <nav className="flex flex-wrap gap-3 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-xs">
          {/* `ready` gates this so it doesn't flash "Not connected" before
              localStorage has been read. */}
          {ready && config ? (
            <>
              <label className="flex items-center gap-1.5 text-neutral-500">
                <input
                  type="checkbox"
                  checked={formatErrors}
                  onChange={(event) => setFormatErrors(event.target.checked)}
                />
                Format errors
              </label>
              <span className="text-neutral-500">
                {isLoading
                  ? 'checking…'
                  : firebaseUser
                    ? (firebaseUser.email ?? `anon ${firebaseUser.uid.slice(0, 6)}`)
                    : 'signed out'}
              </span>
              <button
                type="button"
                onClick={disconnect}
                className="text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Disconnect
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
