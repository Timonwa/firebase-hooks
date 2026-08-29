/**
 * @description Changes the signed-in user's password. Pass `currentPassword`
 * and the hook reauthenticates automatically before the change (Firebase
 * rejects sensitive operations on stale sessions); omit it and the change runs
 * directly — a stale session then surfaces `auth/requires-recent-login`
 * through `code`/`cause` for your own policy (e.g. `useReauthenticate`).
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ update, loading, error, success }`
 *
 * @example
 * const { update, loading, error, success } = useUpdatePassword(auth);
 * await update({ newPassword, currentPassword }); // reauthenticates first
 * await update({ newPassword });                  // no reauth — your call
 */

"use client";

import { type Auth, updatePassword } from "firebase/auth";
import { useState } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

export function useUpdatePassword(auth: Auth | null, options: HookErrorOptions = {}) {
  const { loading, error, run } = useAuthTask(options);
  const [success, setSuccess] = useState(false);

  const update = async ({
    newPassword,
    currentPassword,
  }: {
    newPassword: string;
    currentPassword?: string;
  }): Promise<HookResult> => {
    setSuccess(false);
    const result = await run("update-password", "Failed to update password", async () => {
      const user = requireCurrentUser(auth);
      if (currentPassword) await reauthenticateUserWithPassword(user, currentPassword);
      await updatePassword(user, newPassword);
      return {};
    });
    if (result.success) setSuccess(true);
    return result;
  };

  return { update, loading, error, success };
}
