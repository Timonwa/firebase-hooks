/**
 * @description Sends (or re-sends) the verification email to the signed-in
 * user — the "Resend email" button. Pair with a cooldown (e.g. react-hooks'
 * `useCountdown`) to stop rapid re-sends.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed verification link lands
 * @param options.sendEmail - Replace the client-side sender, called with the user's address
 * @returns `{ send, loading, error, success }`
 *
 * @example
 * const { send, loading, success } = useSendEmailVerification();
 * <button onClick={send} disabled={loading}>Resend verification email</button>
 *
 * @example
 * // Sent by your own API, so the flow goes through your rate limiter
 * const { send } = useSendEmailVerification({
 *   sendEmail: (email) => requestVerification(email),
 * });
 */

"use client";

import { type ActionCodeSettings, type Auth, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseSendEmailVerificationOptionsProps extends HookErrorOptions {
  /** Where the emailed link points back to. Overrides the provider; `null` opts out. */
  actionCodeSettings?: ActionCodeSettings | null;
  /**
   * Replace the sender — e.g. your own API emails the link instead of Firebase.
   * Called with the signed-in user's address.
   */
  sendEmail?: (email: string) => Promise<void>;
}

export function useSendEmailVerification(
  options?: UseSendEmailVerificationOptionsProps,
): ReturnType<typeof useSendEmailVerificationBase>;
export function useSendEmailVerification(
  auth: Auth | null,
  options?: UseSendEmailVerificationOptionsProps,
): ReturnType<typeof useSendEmailVerificationBase>;
export function useSendEmailVerification(
  authOrOptions?: Auth | null | UseSendEmailVerificationOptionsProps,
  maybeOptions?: UseSendEmailVerificationOptionsProps,
) {
  return useSendEmailVerificationBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useSendEmailVerificationBase(
  auth: Auth | null,
  options: UseSendEmailVerificationOptionsProps,
) {
  const { loading, error, run } = useAuthTask(options);
  const actionCodeSettings = useResolvedConfig(
    "actionCodeSettings",
    options.actionCodeSettings,
  );
  const [success, setSuccess] = useState(false);

  const send = async (): Promise<HookResult> => {
    setSuccess(false);
    const result = await run(
      "send-email-verification",
      "Failed to send verification email",
      async () => {
        const user = requireCurrentUser(auth);
        if (options.sendEmail) {
          // `send()` takes no arguments, so the address comes off the user.
          if (!user.email) throw new Error("This account has no email address");
          await options.sendEmail(user.email);
        } else {
          await sendEmailVerification(user, actionCodeSettings);
        }
        return {};
      },
    );
    if (result.success) setSuccess(true);
    return result;
  };

  return { send, loading, error, success };
}
