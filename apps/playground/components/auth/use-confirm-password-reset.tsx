'use client';

import Link from 'next/link';
import { HookSection } from '@/components/hook-section';

/**
 * No console here: the hook needs a real `oobCode`, which only exists in a link
 * Firebase emails. The working version lives on `/auth/action`.
 */
export function UseConfirmPasswordResetSection() {
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
