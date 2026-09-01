'use client';

import { useSignup } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import {
  hookSnippet,
  useBooleanOption,
  useErrorFormat,
  useFlowCallback,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseSignupSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const sendVerificationEmail = useBooleanOption({
    name: 'sendVerificationEmail',
    defaultValue: true,
    hint: 'Off, and the account is created without the email going out.',
  });
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'Signup aborts after the account exists — try signing in with it.',
  });
  const { signup, loading, error } = useSignup(auth, {
    sendVerificationEmail: sendVerificationEmail.value,
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSignup"
      why={
        <>
          Three Firebase calls in the right order — create the account, set the profile,
          send the verification email — behind one call. Turn{' '}
          <code>sendVerificationEmail</code> off in Options to send it yourself.
        </>
      }
      snippet={hookSnippet({
        hook: 'useSignup',
        returns: 'signup, loading, error',
        lines: [sendVerificationEmail.line, onIdToken.line, errorFormat.line],
        body: 'await signup(email, password, { displayName });',
      })}
      options={
        <>
          {sendVerificationEmail.control}
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
          <Field
            label="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(
                await signup(email, password, displayName ? { displayName } : undefined),
              )
            }
          >
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
