/**
 * @description Sends (or re-sends) the verification email to the signed-in
 * user — the "Resend email" button. Pair with a cooldown (e.g. react-hooks'
 * `useCountdown`) to stop rapid re-sends.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed verification link lands
 * @returns `{ send, loading, error, success }`
 *
 * @example
 * const { send, loading, success } = useSendEmailVerification(auth);
 * <button onClick={send} disabled={loading}>Resend verification email</button>
 */

"use client";

import { type ActionCodeSettings, type Auth, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import {
  type AuthErrorOptions,
  type AuthResult,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

interface UseSendEmailVerificationOptionsProps extends AuthErrorOptions {
  actionCodeSettings?: ActionCodeSettings;
}

export function useSendEmailVerification(
  auth: Auth | null,
  options: UseSendEmailVerificationOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const send = async (): Promise<AuthResult> => {
    setSuccess(false);
    const result = await run("Failed to send verification email", async () => {
      await sendEmailVerification(requireCurrentUser(auth), options.actionCodeSettings);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { send, loading, error, success };
}
