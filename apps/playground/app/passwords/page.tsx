'use client';

import {
  useSendPasswordResetEmail,
  useUpdatePassword,
} from '@timonwa/firebase-hooks/auth';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import {
  hookSnippet,
  useActionCodeSettings,
  useErrorFormat,
} from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

export default function PasswordsPage() {
  const { auth, config } = useFirebase();
  if (!config) return <NeedsConfig />;

  return (
    <>
      <PageIntro
        title="Passwords"
        lead="The forgot-password journey end to end, plus changing a password from inside the app. The reset finishes on the page Firebase emails a link to."
      />
      <SendReset auth={auth} />
      <ConfirmReset />
      <UpdatePassword auth={auth} />
    </>
  );
}

type WithAuth = { auth: Parameters<typeof useUpdatePassword>[0] };

function SendReset({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const actionCodeSettings = useActionCodeSettings();
  const { send, loading, error, success, resetState } = useSendPasswordResetEmail(auth, {
    actionCodeSettings: actionCodeSettings.value,
    formatErrorMessage: errorFormat.value,
  });
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSendPasswordResetEmail"
      why={
        <>
          <code>success</code> and <code>resetState</code> exist for the form that has to
          say “check your inbox”, then let someone try a different address without a stale
          success message sitting underneath.
        </>
      }
      snippet={hookSnippet({
        hook: 'useSendPasswordResetEmail',
        returns: 'send, success, resetState',
        lines: [actionCodeSettings.line, errorFormat.line],
        body: `await send(email);
// success === true → "if an account exists, a link is on its way"`,
      })}
      options={
        <>
          {actionCodeSettings.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-2">
            <Button disabled={loading} onClick={async () => setResult(await send(email))}>
              {loading ? 'Sending…' : 'Send reset email'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetState();
                setResult(undefined);
              }}
            >
              resetState()
            </Button>
          </div>
          {success ? (
            <p className="text-sm text-green-600">
              If an account exists for {email}, a reset link is on its way.
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

function ConfirmReset() {
  return (
    <HookSection
      hook="useConfirmPasswordReset"
      why={
        <>
          <code>verifyCode</code> checks the emailed code{' '}
          <em>and returns the account email</em>, so the page can say whose password is
          being reset before asking for a new one — rather than accepting a new password
          and failing afterwards.
        </>
      }
      snippet={`const check = await verifyCode(oobCode);
// { success: true, email: "a@b.c" }

await confirm(oobCode, newPassword);`}
      form={
        <div className="text-muted flex flex-col gap-2 text-sm">
          <p>
            This one needs a real <code>oobCode</code> from a reset email, so it lives on
            the action page Firebase links to.
          </p>
          <Link href="/auth/action" className="text-accent underline underline-offset-4">
            Open /auth/action →
          </Link>
        </div>
      }
    />
  );
}

function UpdatePassword({ auth }: WithAuth) {
  const errorFormat = useErrorFormat();
  const { update, loading, error, success } = useUpdatePassword(auth, {
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
        body: `await update({ newPassword, currentPassword }); // reauthenticates first
await update({ newPassword });                  // your own policy`,
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
                await update({
                  newPassword,
                  ...(currentPassword && { currentPassword }),
                }),
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
