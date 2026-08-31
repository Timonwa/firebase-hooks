'use client';

import { formatFirebaseError } from '@timonwa/firebase-hooks';
import { AUTH_ERROR_MESSAGES } from '@timonwa/firebase-hooks/auth';

/**
 * Both renderings of the same failure, derived from `cause`.
 *
 * The hook resolves `error` once, at the moment it catches, so toggling the
 * provider's formatter never rewrites an error already on screen. Because the
 * result keeps `cause` untouched, both versions can be produced from a single
 * failed call instead — which is the whole reason `cause` is preserved.
 */
export function ErrorComparison({ cause, applied }: { cause: unknown; applied: string }) {
  const raw = cause instanceof Error ? cause.message : String(cause);
  const formatted = formatFirebaseError(cause, { messages: AUTH_ERROR_MESSAGES });
  const stripped = formatFirebaseError(cause);

  const rows = [
    { label: 'Firebase’s own message', value: raw },
    { label: 'Framing stripped (no catalogue)', value: stripped },
    { label: 'With AUTH_ERROR_MESSAGES', value: formatted },
  ];

  return (
    <div className="border-line rounded-md border">
      <p className="border-line text-muted border-b px-3 py-2 text-xs font-medium">
        The same failure, three ways — all derived from{' '}
        <code className="font-mono">result.cause</code>
      </p>
      <dl className="flex flex-col">
        {rows.map((row) => {
          const isApplied = row.value === applied;
          return (
            <div
              key={row.label}
              className="border-line flex flex-col gap-0.5 border-b px-3 py-2 last:border-b-0"
            >
              <dt className="text-muted flex items-center gap-2 text-xs">
                {row.label}
                {isApplied ? (
                  <span className="bg-accent/10 text-accent rounded px-1.5 py-0.5 text-[10px] font-medium">
                    what the hook returned
                  </span>
                ) : null}
              </dt>
              <dd className="text-sm">{row.value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
