'use client';

import { useSendPasswordResetEmail } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import {
  hookSnippet,
  useActionCodeSettings,
  useErrorFormat,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseSendPasswordResetEmailSection() {
  const errorFormat = useErrorFormat();
  const actionCodeSettings = useActionCodeSettings();
  const { send, status, isPending, isSuccess, error, reset } = useSendPasswordResetEmail({
    actionCodeSettings: actionCodeSettings.value,
    formatErrorMessage: errorFormat.value,
  });
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSendPasswordResetEmail"
      why={
        <>
          <code>isSuccess</code> and <code>reset()</code> exist for the form that has to
          say “check your inbox”, then let someone try a different address without a stale
          success message sitting underneath.
        </>
      }
      snippet={hookSnippet({
        hook: 'useSendPasswordResetEmail',
        returns: 'send, isSuccess, reset',
        lines: [actionCodeSettings.line, errorFormat.line],
        body: `await send(email);
// success === true → "if an account exists, a link is on its way"`,
      })}
      options={
        <>
          {actionCodeSettings.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-2">
            <Button
              disabled={isPending}
              onClick={async () => setResult(await send(email))}
            >
              {isPending ? 'Sending…' : 'Send reset email'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                reset();
                setResult(undefined);
              }}
            >
              reset()
            </Button>
          </div>
          {isSuccess ? (
            <p className="text-sm text-green-600">
              If an account exists for {email}, a reset link is on its way.
            </p>
          ) : null}
        </>
      }
      result={result}
      error={error}
      status={status}
    />
  );
}
