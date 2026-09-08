/**
 * @description Sends (or re-sends) the verification email to the signed-in
 * user — the "Resend email" button. Pair with a cooldown (e.g. react-hooks'
 * `useCountdown`) to stop rapid re-sends.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed verification link lands
 * @param options.sendEmail - Replace the client-side sender; gets the signed-in user's address
 * @returns `{ send, loading, error, success }`
 *
 * @example
 * const { send, loading, success } = useSendEmailVerification();
 * <button onClick={send} disabled={loading}>Resend verification email</button>
 *
 * @example
 * // Sent by your own API, so the flow goes through your rate limiter
 * const { send } = useSendEmailVerification({
 *   sendEmail: ({ email }) => requestVerification(email),
 * });
 */

"use client";

import { type ActionCodeSettings, type Auth, sendEmailVerification } from "firebase/auth";
import {
  type EmailSender,
  type HookErrorOptions,
  type HookResult,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseSendEmailVerificationOptions extends HookErrorOptions {
  /** Where the emailed link points back to. Overrides the provider; `null` opts out. */
  actionCodeSettings?: ActionCodeSettings | null;
  /**
   * Replace the sender — e.g. your own API emails the link instead of Firebase.
   * `email` is the signed-in user's address.
   */
  sendEmail?: EmailSender | null;
}

/** What `useSendEmailVerification` returns. */
export type UseSendEmailVerificationResult = ReturnType<
  typeof useSendEmailVerificationBase
>;

export function useSendEmailVerification(
  options?: UseSendEmailVerificationOptions,
): UseSendEmailVerificationResult;
export function useSendEmailVerification(
  auth: Auth | null,
  options?: UseSendEmailVerificationOptions,
): UseSendEmailVerificationResult;
export function useSendEmailVerification(
  authOrOptions?: Auth | null | UseSendEmailVerificationOptions,
  maybeOptions?: UseSendEmailVerificationOptions,
) {
  return useSendEmailVerificationBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useSendEmailVerificationBase(
  auth: Auth | null,
  options: UseSendEmailVerificationOptions,
) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);
  const actionCodeSettings = useResolvedConfig(
    "actionCodeSettings",
    options.actionCodeSettings,
  );
  const sendEmail = useResolvedConfig("sendEmailVerification", options.sendEmail);

  const send = async (): Promise<HookResult> => {
    const result = await run(
      "send-email-verification",
      "Failed to send verification email",
      async () => {
        const user = requireCurrentUser(auth);
        if (sendEmail) {
          // `send()` takes no arguments, so the address comes off the user.
          if (!user.email) throw new Error("This account has no email address");
          await sendEmail({ email: user.email, actionCodeSettings });
        } else {
          await sendEmailVerification(user, actionCodeSettings);
        }
        return {};
      },
    );
    return result;
  };

  return { send, status, isIdle, isPending, isSuccess, isError, error, reset };
}
