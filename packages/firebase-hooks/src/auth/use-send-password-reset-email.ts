/**
 * @description The "forgot password" flow: sends Firebase's password-reset
 * email. `success` flips true after a send, and `resetState` clears both flags
 * — for forms the user can retry with a different address.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.actionCodeSettings - Where the emailed reset link lands
 * @returns `{ send, loading, error, success, resetState }`
 *
 * @example
 * const { send, loading, success } = useSendPasswordResetEmail(auth);
 * await send(email);
 * {success && <p>If an account exists for {email}, a reset link is on its way.</p>}
 */

"use client";

import {
  type ActionCodeSettings,
  type Auth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useState } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  requireAuth,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseSendPasswordResetEmailOptionsProps extends HookErrorOptions {
  /** Where the emailed link points back to. Overrides the provider; `null` opts out. */
  actionCodeSettings?: ActionCodeSettings | null;
}

export function useSendPasswordResetEmail(
  options?: UseSendPasswordResetEmailOptionsProps,
): ReturnType<typeof useSendPasswordResetEmailBase>;
export function useSendPasswordResetEmail(
  auth: Auth | null,
  options?: UseSendPasswordResetEmailOptionsProps,
): ReturnType<typeof useSendPasswordResetEmailBase>;
export function useSendPasswordResetEmail(
  authOrOptions?: Auth | null | UseSendPasswordResetEmailOptionsProps,
  maybeOptions?: UseSendPasswordResetEmailOptionsProps,
) {
  return useSendPasswordResetEmailBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useSendPasswordResetEmailBase(
  auth: Auth | null,
  options: UseSendPasswordResetEmailOptionsProps,
) {
  const { loading, error, setError, run } = useAuthTask(options);
  const actionCodeSettings = useResolvedConfig(
    "actionCodeSettings",
    options.actionCodeSettings,
  );
  const [success, setSuccess] = useState(false);

  const send = async (email: string): Promise<HookResult> => {
    setSuccess(false);
    const result = await run(
      "send-password-reset-email",
      "Failed to send reset email",
      async () => {
        await sendPasswordResetEmail(requireAuth(auth), email, actionCodeSettings);
        return {};
      },
    );
    if (result.success) setSuccess(true);
    return result;
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return { send, loading, error, success, resetState };
}
