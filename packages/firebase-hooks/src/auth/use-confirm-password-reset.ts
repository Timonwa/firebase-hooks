/**
 * @description Completes a password reset with the `oobCode` from the reset
 * email. `verifyCode` optionally checks the code first and returns the account
 * email, so the page can show whose password is being reset before asking for
 * the new one. Runs entirely client-side; Firebase invalidates the code after use.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ confirm, verifyCode, loading, error, success, resetState }`
 *
 * @example
 * const oobCode = searchParams.get("oobCode");
 * const { confirm, verifyCode, success, error } = useConfirmPasswordReset(auth);
 * const check = await verifyCode(oobCode);          // { success: true, email: "a@b.c" }
 * await confirm(oobCode, newPassword);
 */

"use client";

import { type Auth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useState } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  requireAuth,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

export function useConfirmPasswordReset(
  options?: HookErrorOptions,
): ReturnType<typeof useConfirmPasswordResetBase>;
export function useConfirmPasswordReset(
  auth: Auth | null,
  options?: HookErrorOptions,
): ReturnType<typeof useConfirmPasswordResetBase>;
export function useConfirmPasswordReset(
  authOrOptions?: Auth | null | HookErrorOptions,
  maybeOptions?: HookErrorOptions,
) {
  return useConfirmPasswordResetBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useConfirmPasswordResetBase(auth: Auth | null, options: HookErrorOptions) {
  const { loading, error, setError, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const verifyCode = (oobCode: string): Promise<HookResult<{ email: string }>> =>
    run(
      "verify-password-reset-code",
      "This reset link is invalid or has expired",
      async () => {
        const email = await verifyPasswordResetCode(requireAuth(auth), oobCode);
        return { email };
      },
    );

  const confirm = async (oobCode: string, newPassword: string): Promise<HookResult> => {
    setSuccess(false);
    const result = await run(
      "confirm-password-reset",
      "Failed to reset password",
      async () => {
        await confirmPasswordReset(requireAuth(auth), oobCode, newPassword);
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

  return { confirm, verifyCode, loading, error, success, resetState };
}
