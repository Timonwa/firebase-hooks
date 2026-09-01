'use client';

import { useAnonymousSignIn } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button } from '@/components/controls';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseAnonymousSignInSection() {
  const errorFormat = useErrorFormat();
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'The guest session is not created.',
  });
  const { signIn, loading, error } = useAnonymousSignIn({
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useAnonymousSignIn"
      why={
        <>
          A guest session you can upgrade later with <code>useLinkProvider</code> — the
          uid survives, so everything they created while anonymous still belongs to them.
        </>
      }
      snippet={hookSnippet({
        hook: 'useAnonymousSignIn',
        returns: 'signIn, loading, error',
        lines: [onIdToken.line, errorFormat.line],
        body: 'await signIn();',
      })}
      options={
        <>
          {onIdToken.control}
          {errorFormat.control}
        </>
      }
      form={
        <Button disabled={loading} onClick={async () => setResult(await signIn())}>
          {loading ? 'Signing in…' : 'Continue as guest'}
        </Button>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
