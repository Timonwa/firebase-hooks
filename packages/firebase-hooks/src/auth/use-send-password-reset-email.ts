/**
 * @description The "forgot password" flow: sends Firebase's password-reset
 * email. `success` flips true after a send, and `resetState` clears both flags
 * — for forms the user can retry with a different address.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed reset link lands
 * @param options.sendEmail - Replace the client-side sender (e.g. your API emails the link instead)
 * @returns `{ send, loading, error, success, resetState }`
 *
 * @example
 * const { send, loading, success } = useSendPasswordResetEmail();
 * await send(email);
 * {success && <p>If an account exists for {email}, a reset link is on its way.</p>}
 *
 * @example
 * // Sent by your own API, so the flow goes through your rate limiter
 * const { send } = useSendPasswordResetEmail({
 *   sendEmail: ({ email }) => requestPasswordReset(email),
 * });
 */

"use client";

import {
  type ActionCodeSettings,
  type Auth,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  type EmailSender,
  type HookErrorOptions,
  type HookResult,
  requireAuth,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseSendPasswordResetEmailOptions extends HookErrorOptions {
  /** Where the emailed link points back to. Overrides the provider; `null` opts out. */
  actionCodeSettings?: ActionCodeSettings | null;
  /** Replace the sender — e.g. your own API emails the reset link instead of Firebase. */
  sendEmail?: EmailSender | null;
}

/** What `useSendPasswordResetEmail` returns. */
export type UseSendPasswordResetEmailResult = ReturnType<
  typeof useSendPasswordResetEmailBase
>;

export function useSendPasswordResetEmail(
  options?: UseSendPasswordResetEmailOptions,
): UseSendPasswordResetEmailResult;
export function useSendPasswordResetEmail(
  auth: Auth | null,
  options?: UseSendPasswordResetEmailOptions,
): UseSendPasswordResetEmailResult;
export function useSendPasswordResetEmail(
  authOrOptions?: Auth | null | UseSendPasswordResetEmailOptions,
  maybeOptions?: UseSendPasswordResetEmailOptions,
) {
  return useSendPasswordResetEmailBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useSendPasswordResetEmailBase(
  auth: Auth | null,
  options: UseSendPasswordResetEmailOptions,
) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);
  const actionCodeSettings = useResolvedConfig(
    "actionCodeSettings",
    options.actionCodeSettings,
  );
  const sendEmail = useResolvedConfig("sendPasswordReset", options.sendEmail);

  const send = async (email: string): Promise<HookResult> => {
    const result = await run(
      "send-password-reset-email",
      "Failed to send reset email",
      async () => {
        if (sendEmail) {
          await sendEmail({ email, actionCodeSettings });
        } else {
          await sendPasswordResetEmail(requireAuth(auth), email, actionCodeSettings);
        }
        return {};
      },
    );
    return result;
  };

  return { send, status, isIdle, isPending, isSuccess, isError, error, reset };
}
