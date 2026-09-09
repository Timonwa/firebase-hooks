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
 * const { update, loading, error, success } = useUpdatePassword();
 * await update(newPassword, { currentPassword }); // reauthenticates first
 * await update(newPassword);                      // no reauth — your call
 */

"use client";

import { type Auth, updatePassword } from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

/** What `useUpdatePassword` returns. */
export type UseUpdatePasswordResult = ReturnType<typeof useUpdatePasswordBase>;

export function useUpdatePassword(options?: HookErrorOptions): UseUpdatePasswordResult;
export function useUpdatePassword(
  auth: Auth | null,
  options?: HookErrorOptions,
): UseUpdatePasswordResult;
export function useUpdatePassword(
  authOrOptions?: Auth | null | HookErrorOptions,
  maybeOptions?: HookErrorOptions,
) {
  return useUpdatePasswordBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useUpdatePasswordBase(auth: Auth | null, options: HookErrorOptions) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);

  // Shaped like the SDK's `updatePassword(user, newPassword)` — the required
  // value leads, and the reauthentication this hook adds on top goes in the
  // options bag after it.
  const update = async (
    newPassword: string,
    { currentPassword }: { currentPassword?: string } = {},
  ): Promise<HookResult> => {
    const result = await run("update-password", "Failed to update password", async () => {
      const user = requireCurrentUser(auth);
      if (currentPassword) await reauthenticateUserWithPassword(user, currentPassword);
      await updatePassword(user, newPassword);
      return {};
    });
    return result;
  };

  return { update, status, isIdle, isPending, isSuccess, isError, error, reset };
}
