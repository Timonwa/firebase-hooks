'use client';

import { useUpdateProfile } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { hookSnippet, useErrorFormat } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseUpdateProfileSection() {
  const errorFormat = useErrorFormat();
  const { update, loading, error, success } = useUpdateProfile({
    formatErrorMessage: errorFormat.value,
  });
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useUpdateProfile"
      why="Firebase treats profile fields as non-sensitive, so this is the one account operation that needs no reauthentication."
      snippet={hookSnippet({
        hook: 'useUpdateProfile',
        returns: 'update, loading, error, success',
        lines: [errorFormat.line],
        body: 'await update({ displayName, photoURL });',
      })}
      options={errorFormat.control}
      form={
        <>
          <Field
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Field
            label="Photo URL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(
                await update({
                  ...(displayName && { displayName }),
                  ...(photoURL && { photoURL }),
                }),
              )
            }
          >
            {loading ? 'Saving…' : 'Update profile'}
          </Button>
          {success ? <p className="text-sm text-green-600">Profile updated.</p> : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
