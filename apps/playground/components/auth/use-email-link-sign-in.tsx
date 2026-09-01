'use client';

import { useEmailLinkSignIn } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import {
  hookSnippet,
  useErrorFormat,
  useFlowCallback,
  useStringOption,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseEmailLinkSignInSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const storageKey = useStringOption({
    name: 'storageKey',
    defaultValue: 'emailForSignIn',
    hint: 'The localStorage key holding the address between send and complete.',
  });
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'Aborts on the callback page, not here.',
  });
  const returnUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';
  const { sendLink, loading, error } = useEmailLinkSignIn(auth, {
    actionCodeSettings: { url: returnUrl, handleCodeInApp: true },
    storageKey: storageKey.value,
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useEmailLinkSignIn"
      why={
        <>
          Firebase's own guide tells you to call <code>window.prompt</code> when the link
          is opened on another device. This reports <code>needsEmail</code> instead, so
          you render your own input. Try it at{' '}
          <a className="underline underline-offset-4" href="/auth/callback">
            /auth/callback
          </a>
          .
        </>
      }
      snippet={hookSnippet({
        hook: 'useEmailLinkSignIn',
        returns: 'sendLink, loading, error',
        lines: [
          `actionCodeSettings: { url: "${returnUrl}", handleCodeInApp: true },`,
          storageKey.line,
          onIdToken.line,
          errorFormat.line,
        ],
        body: `await sendLink(email);

// on the callback page
const result = await completeSignIn(window.location.href);
if (!result.success && result.needsEmail) showEmailField();`,
      })}
      options={
        <>
          {storageKey.control}
          {onIdToken.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button
            disabled={loading}
            onClick={async () => setResult(await sendLink(email))}
          >
            {loading ? 'Sending…' : 'Send sign-in link'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
