'use client';

import { useSendPasswordResetEmail } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, DemoCard, Field, ResultView } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

export default function ForgotPasswordPage() {
  const { auth, ready, config } = useFirebase();
  const { send, loading, error, success, resetState } = useSendPasswordResetEmail(auth);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<unknown>();

  if (ready && !config) return <NeedsConfig />;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Sends the email. The link lands on{' '}
          <code className="font-mono">/auth/action</code>, which completes it.
        </p>
      </header>

      <DemoCard
        hook="useSendPasswordResetEmail"
        summary="resetState clears success and error, for a form that lets someone retry with a different address."
      >
        <Field
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
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
            Reset state
          </Button>
        </div>

        {success ? (
          <p className="text-sm text-green-600">
            If an account exists for {email}, a reset link is on its way.
          </p>
        ) : null}

        <ResultView result={result} error={error} />
      </DemoCard>
    </div>
  );
}
