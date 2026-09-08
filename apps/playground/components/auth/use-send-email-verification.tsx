'use client';

import { useSendEmailVerification } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button } from '@/components/controls';
import {
  hookSnippet,
  useActionCodeSettings,
  useErrorFormat,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseSendEmailVerificationSection() {
  const errorFormat = useErrorFormat();
  const actionCodeSettings = useActionCodeSettings();
  const { send, status, isPending, isSuccess, error } = useSendEmailVerification({
    actionCodeSettings: actionCodeSettings.value,
    formatErrorMessage: errorFormat.value,
  });
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSendEmailVerification"
      why="The resend button. Firebase rate-limits these hard, so `isPending` and `isSuccess` are what you build the cooldown around."
      snippet={hookSnippet({
        hook: 'useSendEmailVerification',
        returns: 'send, isPending, isSuccess',
        lines: [actionCodeSettings.line, errorFormat.line],
        body: '<button onClick={send} disabled={isPending}>Resend</button>;',
      })}
      options={
        <>
          {actionCodeSettings.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Button disabled={isPending} onClick={async () => setResult(await send())}>
            {isPending ? 'Sending…' : 'Send verification email'}
          </Button>
          {isSuccess ? (
            <p className="text-sm text-green-600">Verification email sent.</p>
          ) : null}
        </>
      }
      result={result}
      error={error}
      status={status}
    />
  );
}
