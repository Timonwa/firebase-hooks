'use client';

import { useReauthenticate } from '@timonwa/firebase-hooks/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseReauthenticateSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const { reauthenticateWithPassword, reauthenticateWithProvider, loading, error } =
    useReauthenticate(auth, { formatErrorMessage: errorFormat.value });
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useReauthenticate"
      why={
        <>
          The recent-sign-in check on its own, for sensitive flows the built-in{' '}
          <code>currentPassword</code> shortcut doesn't cover — and the provider variant
          is how you reauthenticate an OAuth-only account, which has no password to check.
        </>
      }
      snippet={hookSnippet({
        hook: 'useReauthenticate',
        returns: 'reauthenticateWithPassword, reauthenticateWithProvider',
        lines: [errorFormat.line],
        body: `const check = await reauthenticateWithPassword(currentPassword);
if (check.success) await performSensitiveOperation();`,
      })}
      options={errorFormat.control}
      form={
        <>
          <Field
            label="Current password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={loading}
              onClick={async () => setResult(await reauthenticateWithPassword(password))}
            >
              With password
            </Button>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={async () =>
                setResult(await reauthenticateWithProvider(new GoogleAuthProvider()))
              }
            >
              With Google
            </Button>
          </div>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
