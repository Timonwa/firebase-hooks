'use client';

import { useUnlinkProvider } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseUnlinkProviderSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const { unlinkProvider, loading, error } = useUnlinkProvider(auth, {
    formatErrorMessage: errorFormat.value,
  });
  const [providerId, setProviderId] = useState('google.com');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useUnlinkProvider"
      why="Firebase refuses to unlink the last remaining method, so an account can't be locked out this way — the refusal arrives as an ordinary failure result you can show."
      snippet={hookSnippet({
        hook: 'useUnlinkProvider',
        returns: 'unlinkProvider, loading, error',
        lines: [errorFormat.line],
        body: 'await unlinkProvider("google.com");',
      })}
      options={errorFormat.control}
      form={
        <>
          <Field
            label="Provider id"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          />
          <Button
            variant="secondary"
            disabled={loading}
            onClick={async () => setResult(await unlinkProvider(providerId))}
          >
            Unlink
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
