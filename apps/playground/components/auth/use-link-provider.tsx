'use client';

import { useLinkProvider } from '@timonwa/firebase-hooks/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { hookSnippet, useErrorFormat } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseLinkProviderSection() {
  const errorFormat = useErrorFormat();
  const { linkWithProvider, linkWithPassword, loading, error } = useLinkProvider({
    formatErrorMessage: errorFormat.value,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useLinkProvider"
      why={
        <>
          The guest-upgrade path. Sign in anonymously, then link — the uid stays the same,
          so everything created while anonymous still belongs to them. Without it you'd
          have to migrate their data to a new account.
        </>
      }
      snippet={hookSnippet({
        hook: 'useLinkProvider',
        returns: 'linkWithProvider, linkWithPassword',
        lines: [errorFormat.line],
        body: `await linkWithProvider(new GoogleAuthProvider()); // guest → Google
await linkWithPassword(email, password);          // guest → password`,
      })}
      options={errorFormat.control}
      form={
        <>
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(await linkWithProvider(new GoogleAuthProvider()))
            }
          >
            Link Google
          </Button>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="secondary"
            disabled={loading}
            onClick={async () => setResult(await linkWithPassword(email, password))}
          >
            Link email and password
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
