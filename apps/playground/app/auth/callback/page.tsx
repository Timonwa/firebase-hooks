'use client';

import { useEmailLinkSignIn } from '@timonwa/firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { HookSection } from '@/components/hook-section';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

export default function EmailLinkCallbackPage() {
  const { auth, config } = useFirebase();
  const { completeSignIn, loading, error } = useEmailLinkSignIn(auth);
  const [result, setResult] = useState<
    (Awaited<ReturnType<typeof completeSignIn>> & { needsEmail?: boolean }) | undefined
  >();
  const [email, setEmail] = useState('');
  const [attempted, setAttempted] = useState(false);

  // Waits for auth rather than firing on mount: the config arrives from
  // localStorage after the first paint.
  useEffect(() => {
    if (!auth || attempted) return;
    setAttempted(true);
    completeSignIn(window.location.href).then(setResult);
  }, [auth, attempted, completeSignIn]);

  if (!config) return <NeedsConfig />;

  const needsEmail =
    result && !result.success && 'needsEmail' in result && result.needsEmail;

  return (
    <>
      <PageIntro
        title="Email link callback"
        lead="The page your magic link lands on. Completion runs automatically when you arrive."
      />
      <HookSection
        hook="useEmailLinkSignIn"
        why={
          <>
            Opened on a different device, the address isn’t in this browser’s{' '}
            <code>localStorage</code>. Firebase’s own guide reaches for{' '}
            <code>window.prompt</code> here; this returns <code>needsEmail: true</code> so
            you can render a real input in your own UI.
          </>
        }
        snippet={`const result = await completeSignIn(window.location.href);

if (!result.success && result.needsEmail) {
  // ask for the address, then call again
  await completeSignIn(window.location.href, email);
}`}
        form={
          loading ? (
            <p className="text-muted text-sm">Completing sign-in…</p>
          ) : needsEmail ? (
            <>
              <p className="text-muted text-sm">
                This link was opened somewhere the address wasn’t stored.
              </p>
              <Field
                label="Email this link was sent to"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button
                onClick={async () =>
                  setResult(await completeSignIn(window.location.href, email))
                }
              >
                Complete sign-in
              </Button>
            </>
          ) : (
            <p className="text-muted text-sm">
              Open this page from a sign-in link to see it run.
            </p>
          )
        }
        result={result}
        error={error}
        loading={loading}
      />
    </>
  );
}
