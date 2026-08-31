'use client';

import { useSendEmailVerification, useUpdateEmail } from '@timonwa/firebase-hooks/auth';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { HookSection } from '@/components/hook-section';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

export default function EmailPage() {
  const { auth, config } = useFirebase();
  if (!config) return <NeedsConfig />;

  return (
    <>
      <PageIntro
        title="Email"
        lead="Proving an address belongs to the user, and changing it safely. Both round-trip through an email, so they finish on the action page."
      />
      <SendVerification auth={auth} />
      <VerifyEmail />
      <UpdateEmail auth={auth} />
    </>
  );
}

type WithAuth = { auth: Parameters<typeof useUpdateEmail>[0] };

function SendVerification({ auth }: WithAuth) {
  const { send, loading, error, success } = useSendEmailVerification(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSendEmailVerification"
      why="The resend button. Firebase rate-limits these hard, so the loading and success flags are what you build the cooldown around."
      snippet={`const { send, loading, success } = useSendEmailVerification(auth);

<button onClick={send} disabled={loading}>Resend</button>;`}
      form={
        <>
          <Button disabled={loading} onClick={async () => setResult(await send())}>
            {loading ? 'Sending…' : 'Send verification email'}
          </Button>
          {success ? (
            <p className="text-sm text-green-600">Verification email sent.</p>
          ) : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function VerifyEmail() {
  return (
    <HookSection
      hook="useVerifyEmail"
      why={
        <>
          Runs on mount and reports a status you render from. It's guarded against React
          Strict Mode's double effect — the code is single-use, so without that guard the
          second run always fails and the user sees an error on a successful verification.
        </>
      }
      snippet={`const { status, error } = useVerifyEmail(auth, oobCode, {
  onVerified: refreshSession,
});

if (status === "processing") return <Spinner />;`}
      form={
        <div className="text-muted flex flex-col gap-2 text-sm">
          <p>
            Needs a real <code>oobCode</code> from a verification email, so it lives on
            the action page.
          </p>
          <Link href="/auth/action" className="text-accent underline underline-offset-4">
            Open /auth/action →
          </Link>
        </div>
      }
    />
  );
}

function UpdateEmail({ auth }: WithAuth) {
  const { update, loading, error, success } = useUpdateEmail(auth);
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
      snippet={`await update({ newEmail, currentPassword });
// success === true → "check <newEmail> to confirm"`}
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
