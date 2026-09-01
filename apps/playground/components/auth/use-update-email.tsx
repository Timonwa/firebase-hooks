'use client';

import { useUpdateEmail } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import {
  hookSnippet,
  useActionCodeSettings,
  useErrorFormat,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseUpdateEmailSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const actionCodeSettings = useActionCodeSettings();
  const { update, loading, error, success } = useUpdateEmail(auth, {
    actionCodeSettings: actionCodeSettings.value,
    formatErrorMessage: errorFormat.value,
  });
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useUpdateEmail"
      why={
        <>
          Uses <code>verifyBeforeUpdateEmail</code>, so <code>success</code> means “we
          sent the email”, <strong>not</strong> “the address changed” — it changes when
          the link is clicked. Wording your UI as though it already changed is the bug
          this distinction prevents.
        </>
      }
      snippet={hookSnippet({
        hook: 'useUpdateEmail',
        returns: 'update, loading, error, success',
        lines: [actionCodeSettings.line, errorFormat.line],
        body: `await update({ newEmail, currentPassword });
// success === true → "check <newEmail> to confirm"`,
      })}
      options={
        <>
          {actionCodeSettings.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field
            label="New email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Field
            label="Current password (omit for OAuth-only accounts)"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(
                await update({ newEmail, ...(currentPassword && { currentPassword }) }),
              )
            }
          >
            {loading ? 'Sending…' : 'Update email'}
          </Button>
          {success ? (
            <p className="text-sm text-green-600">
              Check {newEmail} to confirm the change.
            </p>
          ) : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
