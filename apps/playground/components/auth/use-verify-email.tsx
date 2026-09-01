'use client';

import Link from 'next/link';
import { HookSection } from '@/components/hook-section';

/** Needs a real `oobCode`; the working version lives on `/auth/action`. */
export function UseVerifyEmailSection() {
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
