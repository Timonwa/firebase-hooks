'use client';

import { usePhoneSignIn } from '@timonwa/firebase-hooks/auth';
import { useState } from 'react';
import { Button, Field, Select } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { hookSnippet, useErrorFormat, useFlowCallback } from '@/components/hook-options';
import { HookSection } from '@/components/hook-section';

export function UsePhoneSignInSection() {
  const { auth } = useFirebase();
  const errorFormat = useErrorFormat();
  const [recaptchaSize, setRecaptchaSize] = useState<'invisible' | 'normal'>('normal');
  const onIdToken = useFlowCallback({
    name: 'onIdToken',
    signature: '(idToken)',
    body: 'createSession(idToken)',
    throwsHint: 'Aborts once the code is confirmed.',
  });
  const { sendCode, confirmCode, codeSent, loading, error } = usePhoneSignIn(auth, {
    recaptchaSize,
    formatErrorMessage: errorFormat.value,
    onIdToken: onIdToken.value,
  });
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="usePhoneSignIn"
      why={
        <>
          The <code>RecaptchaVerifier</code> is built and torn down for you — you supply
          an empty container and nothing else. Any real number works and gets a real SMS;
          a <strong>test number</strong> registered in the console verifies with a code
          you pick instead, which is easier to repeat.
        </>
      }
      snippet={hookSnippet({
        hook: 'usePhoneSignIn',
        returns: 'sendCode, confirmCode, codeSent',
        lines: [
          recaptchaSize === 'invisible' ? null : `recaptchaSize: "${recaptchaSize}",`,
          onIdToken.line,
          errorFormat.line,
        ],
        body: `<div id="recaptcha-container" />;
await sendCode("+2348012345678", "recaptcha-container");
await confirmCode(smsCode);`,
      })}
      options={
        <>
          <Select
            label="recaptchaSize"
            hint="Invisible solves itself unless Google wants a challenge; normal always shows the widget."
            value={recaptchaSize}
            onChange={(event) =>
              setRecaptchaSize(event.target.value as 'invisible' | 'normal')
            }
            options={[
              { value: 'normal', label: 'normal' },
              { value: 'invisible', label: 'invisible (the default)' },
            ]}
          />
          {onIdToken.control}
          {errorFormat.control}
        </>
      }
      form={
        <>
          <Field
            label="Phone number (E.164)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                disabled={loading}
                onClick={async () => setResult(await confirmCode(code))}
              >
                Confirm code
              </Button>
            </>
          ) : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
