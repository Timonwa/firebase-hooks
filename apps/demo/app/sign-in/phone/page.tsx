'use client';

import { usePhoneSignIn } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, DemoCard, Field, ResultView } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

export default function PhonePage() {
  const { auth, ready, config } = useFirebase();
  const { sendCode, confirmCode, codeSent, loading, error } = usePhoneSignIn(auth, {
    recaptchaSize: 'normal',
  });
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<unknown>();

  if (ready && !config) return <NeedsConfig />;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Phone</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Add a test number under <strong>Sign-in method → Phone → Test numbers</strong>{' '}
          in your Firebase console first. Real numbers send real SMS and cost real money.
        </p>
      </header>

      <DemoCard
        hook="usePhoneSignIn"
        summary="Two steps. The reCAPTCHA verifier is created and cleaned up for you — you just supply an empty container."
      >
        <Field
          label="Phone number (E.164, e.g. +2348012345678)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        {/* Must be empty and present before sendCode runs — the hook mounts the
            widget into it. */}
        <div id="recaptcha-container" />

        <Button
          disabled={loading}
          onClick={async () => setResult(await sendCode(phone, 'recaptcha-container'))}
        >
          {loading ? 'Sending…' : 'Send code'}
        </Button>

        {codeSent ? (
          <>
            <Field
              label="SMS code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <Button
              disabled={loading}
              onClick={async () => setResult(await confirmCode(code))}
            >
              {loading ? 'Confirming…' : 'Confirm code'}
            </Button>
          </>
        ) : null}

        <ResultView result={result} error={error} />
      </DemoCard>
    </div>
  );
}
