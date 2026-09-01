'use client';

import { useConfirmPasswordReset, useVerifyEmail } from '@timonwa/firebase-hooks/auth';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { HookSection } from '@/components/hook-section';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

/**
 * Firebase points every emailed action at one URL and tells them apart with a
 * `mode` param, so this page routes on it the way a real app has to.
 */
export default function AuthActionPage() {
  return (
    <Suspense fallback={<p className="text-muted text-sm">Loading…</p>}>
      <AuthAction />
    </Suspense>
  );
}

function AuthAction() {
  const { config } = useFirebase();
  const params = useSearchParams();
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');

  if (!config) return <NeedsConfig />;

  return (
    <>
      <PageIntro
        title="Email action"
        lead={
          mode
            ? `Handling mode=${mode}.`
            : 'Firebase sends every emailed action here with a mode and an oobCode. Open it from a real email to see the hooks run.'
        }
      />

      {mode === 'verifyEmail' ? <VerifyEmail oobCode={oobCode} /> : null}
      {mode === 'resetPassword' ? <ConfirmReset oobCode={oobCode} /> : null}

      {!mode ? (
        <p className="text-muted text-sm">
          Point the action URL at this page in <strong>Authentication → Templates</strong>
          , then click a link from a verification or reset email.
        </p>
      ) : null}
    </>
  );
}

type Props = { oobCode: string | null };

function VerifyEmail({ oobCode }: Props) {
  const { status, error } = useVerifyEmail(oobCode);

  return (
    <HookSection
      hook="useVerifyEmail"
      why={
        <>
          Applies the code on mount and reports a status you render from. It’s guarded
          against React Strict Mode’s double effect — the code is single-use, so without
          that guard the second run fails and the user sees an error on a verification
          that actually succeeded.
        </>
      }
      snippet={`const { status, error } = useVerifyEmail(oobCode, {
  onVerified: refreshSession,
});

if (status === "processing") return <Spinner />;`}
      form={
        <p className="text-sm">
          Status: <code className="text-accent font-mono">{status}</code>
        </p>
      }
      result={{ status }}
      error={error}
      loading={status === 'processing'}
    />
  );
}

function ConfirmReset({ oobCode }: Props) {
  const { confirm, verifyCode, loading, error, success } = useConfirmPasswordReset();
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useConfirmPasswordReset"
      why={
        <>
          <code>verifyCode</code> checks the code <em>and returns the account email</em>,
          so the page can show whose password is being reset before asking for a new one —
          rather than taking a new password and failing afterwards.
        </>
      }
      snippet={`const check = await verifyCode(oobCode);
// { success: true, email: "a@b.c" }

await confirm(oobCode, newPassword);`}
      form={
        <>
          <Button
            variant="secondary"
            disabled={loading || !oobCode}
            onClick={async () => setResult(await verifyCode(oobCode ?? ''))}
          >
            verifyCode()
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
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
