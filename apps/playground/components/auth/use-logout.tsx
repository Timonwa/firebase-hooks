'use client';

import { useLogout } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UseLogoutSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const onBeforeSignOut = useFlowCallback({
    name: 'onBeforeSignOut',
    body: 'clearSession()',
    throwsHint: 'You stay signed in — check the header, the session is still there.',
  });
  const { logout, loading, error } = useLogout(auth, {
    formatErrorMessage: errorFormat.value,
    onBeforeSignOut: onBeforeSignOut.value,
  });
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useLogout"
      why={
        <>
          <code>onBeforeSignOut</code> runs <strong>first</strong>. If clearing your
          server session fails, the Firebase session is left intact and the user can retry
          — rather than being stranded signed-out locally but still live on your server.
        </>
      }
      snippet={hookSnippet({
        hook: 'useLogout',
        returns: 'logout, loading, error',
        lines: [onBeforeSignOut.line, errorFormat.line],
        body: 'await logout();',
      })}
      options={
        <>
          {onBeforeSignOut.control}
          {errorFormat.control}
        </>
      }
      form={
        <Button
          variant="secondary"
          disabled={loading}
          onClick={async () => setResult(await logout())}
        >
          {loading ? 'Signing out…' : 'Sign out'}
        </Button>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
