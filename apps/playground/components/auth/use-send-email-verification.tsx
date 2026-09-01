'use client';

import { useSendEmailVerification } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import {
  hookSnippet,
  useActionCodeSettings,
  useErrorFormat,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseSendEmailVerificationSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const actionCodeSettings = useActionCodeSettings();
  const { send, loading, error, success } = useSendEmailVerification(auth, {
    actionCodeSettings: actionCodeSettings.value,
    formatErrorMessage: errorFormat.value,
  });
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSendEmailVerification"
      why="The resend button. Firebase rate-limits these hard, so the loading and success flags are what you build the cooldown around."
      snippet={hookSnippet({
        hook: 'useSendEmailVerification',
        returns: 'send, loading, success',
        lines: [actionCodeSettings.line, errorFormat.line],
        body: '<button onClick={send} disabled={loading}>Resend</button>;',
      })}
      options={
        <>
          {actionCodeSettings.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Button disabled={loading} onClick={async () => setResult(await send())}>
            {loading ? 'Sending…' : 'Send verification email'}
          </Button>
          {success ? (
            <p className="text-sm text-green-600">Verification email sent.</p>
          ) : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
