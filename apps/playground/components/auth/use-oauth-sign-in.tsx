'use client';

import { useOAuthSignIn } from '@timonwa/firebase-hooks/auth';
import {
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';
import { useState } from 'react';
import { Button, Select } from '@/components/controls';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

/**
 * The provider is an argument to `signIn`, not an option on the hook — one hook
 * covers every provider because Firebase's provider object carries its own id.
 * Apple and Microsoft have no dedicated class; they are `OAuthProvider` with
 * the id passed in.
 */
const PROVIDERS = {
  google: { label: 'Google', source: 'new GoogleAuthProvider()', make: () => new GoogleAuthProvider() },
  github: { label: 'GitHub', source: 'new GithubAuthProvider()', make: () => new GithubAuthProvider() },
  facebook: {
    label: 'Facebook',
    source: 'new FacebookAuthProvider()',
    make: () => new FacebookAuthProvider(),
  },
  twitter: { label: 'X (Twitter)', source: 'new TwitterAuthProvider()', make: () => new TwitterAuthProvider() },
  apple: {
    label: 'Apple',
    source: 'new OAuthProvider("apple.com")',
    make: () => new OAuthProvider('apple.com'),
  },
  microsoft: {
    label: 'Microsoft',
    source: 'new OAuthProvider("microsoft.com")',
    make: () => new OAuthProvider('microsoft.com'),
  },
} as const;

type ProviderKey = keyof typeof PROVIDERS;

export function UseOAuthSignInSection() {
  const errorFormat = useErrorFormat();
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'Aborts on the popup path and on the redirect path alike.',
  });
  const { signIn, loading, error } = useOAuthSignIn({
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [provider, setProvider] = useState<ProviderKey>('google');
  const [method, setMethod] = useState<'popup' | 'redirect'>('popup');
  const [result, setResult] = useState<unknown>();

  const chosen = PROVIDERS[provider];

  return (
    <HookSection
      hook="useOAuthSignIn"
      why={
        <>
          One hook covers both halves of a redirect. It calls{' '}
          <code>getRedirectResult</code> on mount and runs the same <code>onIdToken</code>
          , so you don't write a second handler on the page the user comes back to.
        </>
      }
      snippet={hookSnippet({
        hook: 'useOAuthSignIn',
        returns: 'signIn, loading, error',
        lines: [onIdToken.line, errorFormat.line],
        body:
          method === 'popup'
            ? `await signIn(${chosen.source});`
            : `await signIn(${chosen.source}, { method: "redirect" });`,
      })}
      options={
        <>
          <Select
            label="provider"
            hint="Passed to signIn(), not set on the hook. It must be enabled under Authentication → Sign-in method."
            value={provider}
            onChange={(event) => setProvider(event.target.value as ProviderKey)}
            options={Object.entries(PROVIDERS).map(([value, { label }]) => ({
              value,
              label,
            }))}
          />
          <Select
            label="method"
            hint={
              method === 'redirect'
                ? 'Navigates away; the hook completes the flow when you land back here.'
                : undefined
            }
            value={method}
            onChange={(event) => setMethod(event.target.value as 'popup' | 'redirect')}
            options={[
              { value: 'popup', label: 'popup (the default)' },
              { value: 'redirect', label: 'redirect' },
            ]}
          />
          {onIdToken.control}
          {errorFormat.control}
        </>
      }
      form={
        <Button
          disabled={loading}
          onClick={async () => setResult(await signIn(chosen.make(), { method }))}
        >
          {loading ? 'Signing in…' : `Continue with ${chosen.label}`}
        </Button>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
