'use client';

import { useAuth } from '@timonwa/firebase-hooks/auth';
import { Menu, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from './firebase-provider';
import { Popover } from './popover';
import { ThemeToggle } from './theme';

/**
 * Which project you're pointed at, and the page settings.
 *
 * The bar is chrome, not content: one line, low contrast, controls as quiet
 * icons. What earns weight here is the project name — every button on the page
 * below mutates that project, so it is the one thing worth reading twice.
 */
export function TopBar({
  onMenuClick,
  navOpen = false,
}: {
  onMenuClick?: () => void;
  navOpen?: boolean;
}) {
  const { config, formatErrors, setFormatErrors, wrapCode, setWrapCode } = useFirebase();
  const { firebaseUser, isLoading } = useAuth();

  const status = isLoading
    ? 'Checking…'
    : firebaseUser
      ? (firebaseUser.email ?? `Anonymous · ${firebaseUser.uid.slice(0, 6)}`)
      : 'Signed out';

  return (
    <header className="border-line bg-bg/80 sticky top-0 z-20 border-b backdrop-blur">
      {/* Same shape as <main>: padding on the outside, the width cap inside.
          Padding within the cap would inset this row past the content below. */}
      <div className="px-6 lg:px-10">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            className="text-muted hover:text-fg hover:bg-fg/5 -ml-2 grid size-8 shrink-0 place-items-center rounded-md transition-colors lg:hidden"
          >
            <Menu className="size-4" strokeWidth={1.75} aria-hidden />
          </button>

        {config ? (
          <>
            {/* Signed-in state reads as a dot plus words, never colour alone. */}
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                firebaseUser ? 'bg-accent' : 'bg-muted/50'
              }`}
              aria-hidden
            />
            {/* Stacked until there's room for one line. Which account you are
                testing with matters as much as the project, and inline it was
                the half that got truncated away. */}
            <div className="flex min-w-0 flex-col lg:flex-row lg:items-baseline lg:gap-1.5">
              <span className="truncate font-mono text-sm leading-tight font-medium">
                {config.projectId}
              </span>
              <span className="text-muted truncate text-xs leading-tight lg:text-sm">
                <span className="hidden lg:inline">· </span>
                {status}
              </span>
            </div>
          </>
        ) : (
          <Link href="/" className="text-accent text-sm font-medium">
            Set up .env.local →
          </Link>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <ThemeToggle />
          <Popover
            label="Settings"
            trigger={<Settings2 className="size-4" strokeWidth={1.75} aria-hidden />}
          >
            <SettingRow
              label="Format errors"
              hint="Apply AUTH_ERROR_MESSAGES on the provider. Any hook's own Options overrides it."
              checked={formatErrors}
              onChange={setFormatErrors}
            />
            <SettingRow
              label="Wrap code"
              hint="Soft-wrap every snippet and response instead of scrolling sideways."
              checked={wrapCode}
              onChange={setWrapCode}
            />
          </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}

function SettingRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="hover:bg-fg/5 flex cursor-pointer gap-2.5 rounded-lg p-2.5 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-accent mt-0.5 shrink-0"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-none font-medium">{label}</span>
        <span className="text-muted text-xs leading-snug text-pretty">{hint}</span>
      </span>
    </label>
  );
}
