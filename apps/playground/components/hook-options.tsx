'use client';

import { formatFirebaseError } from '@timonwa/firebase-hooks';
import { AUTH_ERROR_MESSAGES } from '@timonwa/firebase-hooks/auth';
import { useCallback, useState } from 'react';
import { Select, Toggle } from './controls';

/**
 * Options a hook takes, as controls you can set before running it.
 *
 * Each of these returns the value to spread into the hook *and* the source line
 * that produces it, so the snippet beside the console always shows the config
 * that the result came from — the question "how would I get this?" is answered
 * on the page rather than left to the reader.
 *
 * Every value is defined at module scope. A formatter re-created each render
 * would be a new function identity every time, which is exactly the mistake
 * these hooks' option handling is meant to survive.
 */

const stripped = (error: unknown) => formatFirebaseError(error);
const catalogued = (error: unknown) =>
  formatFirebaseError(error, { messages: AUTH_ERROR_MESSAGES });

type ErrorFormat = 'inherit' | 'stripped' | 'catalogue';

const ERROR_FORMATS: Record<
  ErrorFormat,
  { label: string; value: ((error: unknown) => string) | undefined; line: string | null }
> = {
  inherit: {
    label: 'not set — follows “Format errors” above',
    value: undefined,
    line: null,
  },
  stripped: {
    label: 'formatFirebaseError',
    value: stripped,
    line: 'formatErrorMessage: formatFirebaseError,',
  },
  catalogue: {
    label: 'formatFirebaseError + AUTH_ERROR_MESSAGES',
    value: catalogued,
    line: 'formatErrorMessage: (error) =>\n    formatFirebaseError(error, { messages: AUTH_ERROR_MESSAGES }),',
  },
};

export function useErrorFormat() {
  const [format, setFormat] = useState<ErrorFormat>('inherit');
  const entry = ERROR_FORMATS[format];

  return {
    value: entry.value,
    line: entry.line,
    control: (
      <Select
        label="formatErrorMessage"
        hint="Setting it here overrides the provider for this hook only. Cause a failure to see it."
        value={format}
        onChange={(event) => setFormat(event.target.value as ErrorFormat)}
        options={Object.entries(ERROR_FORMATS).map(([value, { label }]) => ({
          value,
          label,
        }))}
      />
    ),
  };
}

type CallbackMode = 'off' | 'run' | 'throw';

/**
 * `onIdToken` / `onBeforeSignOut` / `onBeforeDelete` — the callbacks that run
 * inside the flow. `throw` is the one worth trying: the operation aborts, which
 * is the whole reason they run inside it rather than after.
 */
export function useFlowCallback({
  name,
  signature = '()',
  body,
  throwsHint,
}: {
  name: string;
  signature?: string;
  body: string;
  throwsHint: string;
}) {
  const [mode, setMode] = useState<CallbackMode>('off');
  const [events, setEvents] = useState<string[]>([]);

  const record = useCallback((entry: string) => {
    setEvents((current) => [...current.slice(-4), entry]);
  }, []);

  const value =
    mode === 'off'
      ? undefined
      : (...args: unknown[]) => {
          const arg = typeof args[0] === 'string' ? `${args[0].slice(0, 12)}…` : '';
          record(`${new Date().toLocaleTimeString()} — ${name}(${arg})`);
          if (mode === 'throw') throw new Error(`${name} failed`);
        };

  const line =
    mode === 'off'
      ? null
      : mode === 'throw'
        ? `${name}: ${signature} => { throw new Error("${name} failed"); },`
        : `${name}: ${signature} => ${body},`;

  return {
    value,
    line,
    control: (
      <div className="flex flex-col gap-2">
        <Select
          label={name}
          hint={mode === 'throw' ? throwsHint : undefined}
          value={mode}
          onChange={(event) => setMode(event.target.value as CallbackMode)}
          options={[
            { value: 'off', label: 'not set' },
            { value: 'run', label: 'set — logs when it runs' },
            { value: 'throw', label: 'set — throws' },
          ]}
        />
        {events.length > 0 ? (
          <ul className="border-line text-muted rounded-md border px-2 py-1.5 font-mono text-[11px]">
            {events.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        ) : null}
      </div>
    ),
  };
}

type ActionCodeMode = 'inherit' | 'app' | 'off';

/**
 * `actionCodeSettings` — where the emailed link comes back to.
 *
 * `null` is not the same as leaving it out: it opts out of the provider's
 * setting, so Firebase's own hosted page handles the link.
 */
export function useActionCodeSettings(path = '/auth/action') {
  const [mode, setMode] = useState<ActionCodeMode>('inherit');
  const url =
    typeof window === 'undefined'
      ? `http://localhost:3000${path}`
      : `${window.location.origin}${path}`;

  const value =
    mode === 'inherit'
      ? undefined
      : mode === 'off'
        ? null
        : { url, handleCodeInApp: false };

  const line =
    mode === 'inherit'
      ? null
      : mode === 'off'
        ? 'actionCodeSettings: null,'
        : `actionCodeSettings: { url: "${url}" },`;

  return {
    value,
    line,
    control: (
      <Select
        label="actionCodeSettings"
        hint="Only takes effect once the console's action URL points here."
        value={mode}
        onChange={(event) => setMode(event.target.value as ActionCodeMode)}
        options={[
          { value: 'inherit', label: 'not set — follows the provider' },
          { value: 'app', label: `come back to ${path}` },
          { value: 'off', label: 'null — opt out, use Firebase’s page' },
        ]}
      />
    ),
  };
}

/** A plain boolean option, with the source line it produces. */
export function useBooleanOption({
  name,
  defaultValue,
  hint,
}: {
  name: string;
  defaultValue: boolean;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return {
    value,
    // Only emitted when it differs from the hook's own default — the snippet
    // should show what you had to write, not every option that exists.
    line: value === defaultValue ? null : `${name}: ${String(value)},`,
    control: (
      <Toggle
        label={<span className="font-mono">{name}</span>}
        hint={hint}
        checked={value}
        onChange={setValue}
      />
    ),
  };
}

/** A string option, with the source line it produces. */
export function useStringOption({
  name,
  defaultValue,
  label,
  hint,
}: {
  name: string;
  defaultValue: string;
  label?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return {
    value,
    line: value === defaultValue ? null : `${name}: ${JSON.stringify(value)},`,
    control: (
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-fg font-mono">{label ?? name}</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="border-line bg-bg focus:border-accent rounded-md border px-2 py-1.5 text-xs outline-none"
        />
        {hint ? <span className="text-muted">{hint}</span> : null}
      </label>
    ),
  };
}

/**
 * The call as you would write it, with only the options actually set.
 *
 * Regenerated on every change so the snippet and the console can never drift
 * apart — the code shown is the code that ran.
 */
export function hookSnippet({
  hook,
  returns,
  lines,
  body,
}: {
  hook: string;
  returns: string;
  lines: (string | null)[];
  body?: string;
}) {
  const set = lines.filter((line): line is string => Boolean(line));

  // No `auth` argument: the playground runs below an AuthProvider, so the hooks
  // take theirs from it. The snippet shows what you would actually write here.
  const call = set.length
    ? `const { ${returns} } = ${hook}({\n${set.map((line) => `  ${line}`).join('\n')}\n});`
    : `const { ${returns} } = ${hook}();`;

  return body ? `${call}\n\n${body}` : call;
}
