'use client';

import { useConfirmPasswordReset, useVerifyEmail } from '@timonwa/firebase-hooks/auth';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button, DemoCard, Field, ResultView } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

/**
 * Firebase points every emailed action at one URL and distinguishes them with a
 * `mode` param, so this page routes on it the way a real app has to.
 */
export default function AuthActionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
      <AuthAction />
    </Suspense>
  );
}

function AuthAction() {
  const { auth, ready, config } = useFirebase();
  const params = useSearchParams();
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');

  if (ready && !config) return <NeedsConfig />;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Email action</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {mode ? (
            <>
              Handling <code className="font-mono">mode={mode}</code>.
            </>
          ) : (
            'Open this page from a Firebase email — it needs mode and oobCode in the URL.'
          )}
        </p>
      </header>

      {mode === 'verifyEmail' ? <VerifyEmailDemo auth={auth} oobCode={oobCode} /> : null}
      {mode === 'resetPassword' ? (
        <ConfirmResetDemo auth={auth} oobCode={oobCode} />
      ) : null}

      {!mode ? (
        <p className="text-sm text-neutral-500">
          Set your action URL to this page in <strong>Authentication → Templates</strong>,
          then click a link from a verification or reset email.
        </p>
      ) : null}
    </div>
  );
}

type Props = { auth: Parameters<typeof useVerifyEmail>[0]; oobCode: string | null };

function VerifyEmailDemo({ auth, oobCode }: Props) {
  const { status, error } = useVerifyEmail(auth, oobCode);

  return (
    <DemoCard
      hook="useVerifyEmail"
      summary="Applies the code on mount and reports a status. Guarded against Strict Mode's double effect, because the code is single-use."
    >
      <p className="text-sm">
        Status:{' '}
        <code className="font-mono text-violet-600 dark:text-violet-400">{status}</code>
      </p>
      <ResultView error={error} />
    </DemoCard>
  );
}

function ConfirmResetDemo({ auth, oobCode }: Props) {
  const { confirm, verifyCode, loading, error, success } = useConfirmPasswordReset(auth);
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useConfirmPasswordReset"
      summary="verifyCode checks the code and returns the account email, so you can show whose password is being reset before asking for a new one."
    >
      <Button
        variant="secondary"
        disabled={loading || !oobCode}
        onClick={async () => setResult(await verifyCode(oobCode ?? ''))}
      >
        Verify code first
      </Button>

      <Field
        label="New password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button
        disabled={loading || !oobCode}
        onClick={async () => setResult(await confirm(oobCode ?? '', password))}
      >
        {loading ? 'Saving…' : 'Set new password'}
      </Button>

      {success ? <p className="text-sm text-green-600">Password updated.</p> : null}
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}
