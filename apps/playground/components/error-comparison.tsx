'use client';

import { formatFirebaseError } from '@timonwa/firebase-hooks';
import { AUTH_ERROR_MESSAGES } from '@timonwa/firebase-hooks/auth';

/**
 * What each `formatErrorMessage` setting would have produced for the failure
 * that just happened.
 *
 * The hook resolves `error` once, at the moment it catches, so changing the
 * setting never rewrites a message already on screen. Because the result keeps
 * `cause` untouched, the other settings can be evaluated against the same
 * failure instead — which is the whole reason `cause` is preserved.
 */
export function ErrorComparison({ cause, applied }: { cause: unknown; applied: string }) {
  const rows = [
    {
      config: 'not set',
      value: cause instanceof Error ? cause.message : String(cause),
    },
    {
      config: 'formatErrorMessage: formatFirebaseError',
      value: formatFirebaseError(cause),
    },
    {
      config:
        'formatErrorMessage: (e) => formatFirebaseError(e, { messages: AUTH_ERROR_MESSAGES })',
      value: formatFirebaseError(cause, { messages: AUTH_ERROR_MESSAGES }),
    },
  ];

  return (
    <div className="border-line rounded-md border">
      <p className="border-line text-muted border-b px-3 py-2 text-xs font-medium">
        What each <code className="font-mono">formatErrorMessage</code> would give for
        this failure. Set it in <strong>Options</strong> above, then run again.
      </p>
      <dl className="flex flex-col">
        {rows.map((row) => {
          const isApplied = row.value === applied;
          return (
            <div
              key={row.config}
              className="border-line flex flex-col gap-1 border-b px-3 py-2 last:border-b-0"
            >
              <dt className="flex flex-wrap items-center gap-2">
                <code className="text-muted font-mono text-[11px] wrap-break-word">
                  {row.config}
                </code>
                {isApplied ? (
                  <span className="bg-accent/10 text-accent rounded px-1.5 py-0.5 text-[10px] font-medium">
                    what you got
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
