"use client";

import { type ReactNode, useState } from "react";
import { docsUrl, toAnchor } from "@/lib/hooks-map";
import { CodeBlock } from "./code-block";
import { ErrorComparison } from "./error-comparison";

/**
 * The three-pane API-reference layout: the sidebar is the site map, this centre
 * column explains the hook, and the right column is the console you run it in.
 * The console sticks while the explanation scrolls, so the result stays visible
 * next to whatever you are reading.
 */
export function HookSection({
  hook,
  why,
  snippet,
  notes,
  options,
  form,
  result,
  error,
  status,
}: {
  hook: string;
  why: ReactNode;
  snippet: string;
  notes?: ReactNode;
  /** Controls for the hook's own options — the snippet above reflects them. */
  options?: ReactNode;
  form: ReactNode;
  result?: unknown;
  error?: string | null;
  /** The hook's own status, shown live in the console. */
  status?: string;
}) {
  const failure =
    result &&
    typeof result === "object" &&
    "success" in result &&
    !result.success
      ? (result as unknown as { error: string; cause: unknown })
      : null;

  return (
    <section
      id={toAnchor(hook)}
      className="grid scroll-mt-24 gap-8 border-b border-line py-10 lg:grid-cols-[1fr_minmax(0,24rem)]">
      {/* Centre — what it is and why it exists. It is the shorter column, so it
          is the one that sticks: the console grows with the result, and a
          sticky element taller than the viewport can never scroll to its own
          bottom. */}
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="font-mono text-lg font-semibold text-accent">
            {hook}
          </h2>
          <a
            href={docsUrl(hook)}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs text-muted underline underline-offset-4 hover:text-fg">
            docs ↗
          </a>
        </div>

        <p className="mt-3 text-sm text-pretty text-muted">{why}</p>

        <div className="mt-4">
          <CodeBlock code={snippet} />
        </div>

        {notes ? (
          <div className="mt-4 text-sm text-pretty text-muted">{notes}</div>
        ) : null}
      </div>

      {/* Right — the console. */}
      <div className="min-w-0">
        <div className="overflow-hidden surface">
          {options ? (
            <>
              <p className="border-b border-line px-4 py-2 text-xs font-medium tracking-wider text-muted uppercase">
                Options
              </p>
              <div className="flex flex-col gap-3 p-4">{options}</div>
            </>
          ) : null}

          <p
            className={`border-line px-4 py-2 text-xs font-medium tracking-wider text-muted uppercase ${
              options ? "border-y" : "border-b"
            }`}>
            Try it
          </p>
          <div className="flex flex-col gap-3 p-4">{form}</div>

          {/* The hook's own state, live. Watching `status` move is the clearest
              demonstration that the hook owns this rather than you. */}
          <dl className="flex flex-col gap-1 border-t border-b border-line px-4 py-2 font-mono text-xs text-muted">
            <div className="flex gap-1.5">
              <dt>status</dt>
              <dd
                className={
                  status === "pending" ? "font-semibold text-accent" : "text-fg"
                }>
                {status ?? "idle"}
              </dd>
            </div>
            {/* Its own row, wrapping: a Firebase message is long enough that
                sharing a line with `status` truncated it to nothing useful. */}
            <div className="flex min-w-0 gap-1.5">
              <dt className="shrink-0">error</dt>
              <dd
                className={`wrap-break-word ${error ? "text-danger" : "text-fg"}`}>
                {error ? `"${error}"` : "null"}
              </dd>
            </div>
          </dl>

          <p className="border-b border-line px-4 py-2 text-xs font-medium tracking-wider text-muted uppercase">
            Response
          </p>
          <div className="p-4">
            {status === "pending" ? (
              <p className="text-sm text-accent">Running…</p>
            ) : result === undefined && !error ? (
              <p className="text-sm text-muted">Run it to see the result.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <CodeBlock
                  code={safeStringify(result)}
                  lang="json"
                  tone="inset"
                />
                {failure?.cause !== undefined ? (
                  <ErrorComparison
                    cause={failure.cause}
                    applied={failure.error}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Firebase objects are deeply circular, so only the useful fields are kept. */
function safeStringify(value: unknown) {
  return JSON.stringify(
    value,
    (key, val) => {
      if (key === "cause" && val instanceof Error)
        return `${val.name}: ${val.message}`;
      if (
        val &&
        typeof val === "object" &&
        "uid" in val &&
        "providerData" in val
      ) {
        const user = val as Record<string, unknown>;
        return {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          isAnonymous: user.isAnonymous,
        };
      }
      if (val && typeof val === "object" && "operationType" in val) {
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
