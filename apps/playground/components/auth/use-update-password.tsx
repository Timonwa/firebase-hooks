'use client';

import { useUpdatePassword } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { hookSnippet, useErrorFormat } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseUpdatePasswordSection() {
  const errorFormat = useErrorFormat();
  const { update, loading, error, success } = useUpdatePassword({
    formatErrorMessage: errorFormat.value,
  });
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useUpdatePassword"
      why={
        <>
          Pass <code>currentPassword</code> and the reauthentication happens first. Leave
          it blank on a stale session and you'll see{' '}
          <code>auth/requires-recent-login</code> come back in <code>code</code> — the
          hook doesn't hide it, it just saves you from wiring the reauth step when you
          don't want to.
        </>
      }
      snippet={hookSnippet({
        hook: 'useUpdatePassword',
        returns: 'update, loading, error, success',
        lines: [errorFormat.line],
        body: `await update(newPassword, { currentPassword }); // reauthenticates first
await update(newPassword);                      // your own policy`,
      })}
      options={errorFormat.control}
      form={
        <>
          <Field
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Field
            label="Current password (leave blank to see the stale-session error)"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(
                await update(
                  newPassword,
                  currentPassword ? { currentPassword } : undefined,
                ),
              )
            }
          >
            {loading ? 'Saving…' : 'Update password'}
          </Button>
          {success ? <p className="text-sm text-green-600">Password updated.</p> : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
