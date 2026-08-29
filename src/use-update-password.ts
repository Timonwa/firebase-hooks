/**
 * @description Changes the signed-in user's password, with the required
 * reauthentication built in — Firebase rejects sensitive operations on stale
 * sessions, so the hook reauthenticates with the current password first.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ update, loading, error, success }`
 *
 * @example
 * const { update, loading, error, success } = useUpdatePassword(auth);
 * await update(currentPassword, newPassword);
 */

"use client";

import { type Auth, updatePassword } from "firebase/auth";
import { useState } from "react";
import {
  type AuthErrorOptions,
  type AuthResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

export function useUpdatePassword(auth: Auth | null, options: AuthErrorOptions = {}) {
  const { loading, error, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const update = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResult> => {
    setSuccess(false);
    const result = await run("Failed to update password", async () => {
      const user = requireCurrentUser(auth);
      await reauthenticateUserWithPassword(user, currentPassword);
      await updatePassword(user, newPassword);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { update, loading, error, success };
}
