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
  type AuthErrorOptions,
  type AuthResult,
  requireAuth,
  useAuthTask,
} from "./_shared";

export function useConfirmPasswordReset(
  auth: Auth | null,
  options: AuthErrorOptions = {},
) {
  const { loading, error, setError, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const verifyCode = (oobCode: string): Promise<AuthResult<{ email: string }>> =>
    run("This reset link is invalid or has expired", async () => {
      const email = await verifyPasswordResetCode(requireAuth(auth), oobCode);
      return { email };
    });

  const confirm = async (oobCode: string, newPassword: string): Promise<AuthResult> => {
    setSuccess(false);
    const result = await run("Failed to reset password", async () => {
      await confirmPasswordReset(requireAuth(auth), oobCode, newPassword);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return { confirm, verifyCode, loading, error, success, resetState };
}
