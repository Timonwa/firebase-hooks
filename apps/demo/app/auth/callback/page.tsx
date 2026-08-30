'use client';

import { useEmailLinkSignIn } from '@timonwa/firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { Button, DemoCard, Field, ResultView } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

export default function EmailLinkCallbackPage() {
  const { auth, ready, config } = useFirebase();
  const { completeSignIn, loading, error } = useEmailLinkSignIn(auth);
  const [result, setResult] = useState<
    (Awaited<ReturnType<typeof completeSignIn>> & { needsEmail?: boolean }) | undefined
  >();
  const [email, setEmail] = useState('');
  const [attempted, setAttempted] = useState(false);

  // Runs once auth exists — the config arrives from localStorage after the first
  // paint, so this can't be a plain mount effect.
  useEffect(() => {
    if (!auth || attempted) return;
    setAttempted(true);
    completeSignIn(window.location.href).then(setResult);
  }, [auth, attempted, completeSignIn]);

  if (ready && !config) return <NeedsConfig />;

  const needsEmail =
    result && !result.success && 'needsEmail' in result && result.needsEmail;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Email link callback</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          The page your magic link lands on.
        </p>
      </header>

      <DemoCard
        hook="useEmailLinkSignIn"
        summary="completeSignIn reads the URL and finishes the sign-in. Opened on a different device, the address isn't in storage — so the result reports needsEmail instead of calling window.prompt."
      >
        {loading ? <p className="text-sm text-neutral-500">Completing sign-in…</p> : null}

        {needsEmail ? (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              This link was opened somewhere the address wasn’t stored. Confirm it to
              continue.
            </p>
            <Field
              label="Email this link was sent to"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              disabled={loading}
              onClick={async () =>
                setResult(await completeSignIn(window.location.href, email))
              }
            >
              Complete sign-in
            </Button>
          </>
        ) : null}

        <ResultView result={result} error={error} />
      </DemoCard>
    </div>
  );
}
