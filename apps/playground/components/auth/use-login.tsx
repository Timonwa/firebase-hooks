'use client';

import { useLogin } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseLoginSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'Sign-in aborts — the result comes back as a failure.',
  });
  const { login, loading, error } = useLogin(auth, {
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useLogin"
      why={
        <>
          By hand this is <code>useState</code> for loading and error, <code>try</code>/
          <code>catch</code>/<code>finally</code>, and the token exchange. The part that
          matters is that <code>onIdToken</code> runs <em>inside</em> the flow — throw in
          it and the sign-in aborts, so a user can't land on a protected page without a
          server session.
        </>
      }
      snippet={hookSnippet({
        hook: 'useLogin',
        returns: 'login, loading, error',
        lines: [onIdToken.line, errorFormat.line],
        body: `const result = await login(email, password);
if (result.success) router.push("/dashboard");`,
      })}
      options={
        <>
          {onIdToken.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () => setResult(await login(email, password))}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
