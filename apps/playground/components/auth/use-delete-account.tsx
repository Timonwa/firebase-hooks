'use client';

import { useDeleteAccount } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseDeleteAccountSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const onBeforeDelete = useFlowCallback({
    name: 'onBeforeDelete',
    signature: '(user)',
    body: 'deleteUserRecord(user.uid)',
    throwsHint: 'The account survives — cleanup failing cannot orphan its records.',
  });
  const { deleteAccount, loading, error } = useDeleteAccount(auth, {
    formatErrorMessage: errorFormat.value,
    onBeforeDelete: onBeforeDelete.value,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useDeleteAccount"
      why={
        <>
          <code>onBeforeDelete</code> runs while the user still exists — the only moment
          your security rules will still let you delete their data. Throwing in it aborts
          the deletion, so failed cleanup can't orphan records.
        </>
      }
      snippet={hookSnippet({
        hook: 'useDeleteAccount',
        returns: 'deleteAccount, loading, error',
        lines: [onBeforeDelete.line, errorFormat.line],
        body: 'await deleteAccount({ currentPassword });',
      })}
      options={
        <>
          {onBeforeDelete.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field
            label="Current password (optional)"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Button
            variant="danger"
            disabled={loading}
            onClick={async () =>
              setResult(
                await deleteAccount(currentPassword ? { currentPassword } : undefined),
              )
            }
          >
            {loading ? 'Deleting…' : 'Delete account'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
