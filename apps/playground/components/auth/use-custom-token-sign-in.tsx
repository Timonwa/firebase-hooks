'use client';

import { useCustomTokenSignIn } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseCustomTokenSignInSection() {
  const errorFormat = useErrorFormat();
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'The exchange is rolled back into a failed result.',
  });
  const { signIn, loading, error } = useCustomTokenSignIn({
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [token, setToken] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useCustomTokenSignIn"
      why="Bridges an existing auth system into Firebase — your server mints a token with the Admin SDK, this exchanges it for a Firebase session."
      snippet={hookSnippet({
        hook: 'useCustomTokenSignIn',
        returns: 'signIn, loading, error',
        lines: [onIdToken.line, errorFormat.line],
        body: `const { token } = await fetch("/api/firebase-token").then((r) => r.json());
await signIn(token);`,
      })}
      options={
        <>
          {onIdToken.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field
            label="Custom token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button disabled={loading} onClick={async () => setResult(await signIn(token))}>
            {loading ? 'Signing in…' : 'Sign in with token'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
