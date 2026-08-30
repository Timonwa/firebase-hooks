'use client';

import type { ReactNode } from 'react';

export function DemoCard({
  hook,
  summary,
  children,
}: {
  hook: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="font-mono text-sm font-semibold text-violet-600 dark:text-violet-400">
        {hook}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{summary}</p>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <input
        {...props}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-neutral-700 dark:bg-neutral-950"
      />
    </label>
  );
}

export function Button({
  children,
  variant = 'primary',
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'danger';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500',
    secondary:
      'border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  }[variant];

  return (
    <button
      type="button"
      {...props}
      className={`w-fit rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

/**
 * Renders the raw result. Showing the actual `{ success, error, code, cause }`
 * shape is the clearest possible demonstration of the contract — more direct
 * than any prose about it.
 */
export function ResultView({
  result,
  error,
}: {
  result?: unknown;
  error?: string | null;
}) {
  if (result === undefined && !error) return null;

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      {result !== undefined ? (
        <pre className="overflow-x-auto rounded-md bg-neutral-100 p-3 font-mono text-xs dark:bg-neutral-950">
          {safeStringify(result)}
        </pre>
      ) : null}
    </div>
  );
}

/** Firebase objects are deeply circular, so only the useful fields are kept. */
function safeStringify(value: unknown) {
  return JSON.stringify(
    value,
    (key, val) => {
      if (key === 'cause' && val instanceof Error) return `${val.name}: ${val.message}`;
      if (val && typeof val === 'object' && 'uid' in val && 'providerData' in val) {
        const user = val as Record<string, unknown>;
        return {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          isAnonymous: user.isAnonymous,
        };
      }
      if (val && typeof val === 'object' && 'operationType' in val) {
        const credential = val as Record<string, unknown>;
        return {
          operationType: credential.operationType,
          providerId: credential.providerId,
        };
      }
      return val;
    },
    2,
  );
}
