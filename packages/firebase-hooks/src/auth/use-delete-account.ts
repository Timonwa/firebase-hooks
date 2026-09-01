/**
 * @description Deletes the signed-in user's account. Pass `currentPassword`
 * and the hook reauthenticates automatically first (deletion requires a recent
 * sign-in); omit it — OAuth-only accounts, or your own reauth policy via
 * `useReauthenticate` — and a stale session surfaces
 * `auth/requires-recent-login` through `code`/`cause`. The optional
 * `onBeforeDelete` callback runs while the user is still authenticated — clean
 * up server-side data there; throwing aborts the deletion.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onBeforeDelete - Server-side cleanup; throw to abort
 * @returns `{ deleteAccount, loading, error }`
 *
 * @example
 * const { deleteAccount, loading, error } = useDeleteAccount(auth, {
 *   onBeforeDelete: (user) => deleteUserRecord(user.uid),
 * });
 * const result = await deleteAccount({ currentPassword });
 * if (result.success) router.push("/goodbye");
 */

"use client";

import { type Auth, deleteUser, type User } from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

export interface UseDeleteAccountOptionsProps extends HookErrorOptions {
  /**
   * Runs while the user is still authenticated — clean up server-side data
   * here. Throwing aborts the deletion.
   */
  onBeforeDelete?: (user: User) => void | Promise<void>;
}

export function useDeleteAccount(
  options?: UseDeleteAccountOptionsProps,
): ReturnType<typeof useDeleteAccountBase>;
export function useDeleteAccount(
  auth: Auth | null,
  options?: UseDeleteAccountOptionsProps,
): ReturnType<typeof useDeleteAccountBase>;
export function useDeleteAccount(
  authOrOptions?: Auth | null | UseDeleteAccountOptionsProps,
  maybeOptions?: UseDeleteAccountOptionsProps,
) {
  return useDeleteAccountBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useDeleteAccountBase(auth: Auth | null, options: UseDeleteAccountOptionsProps) {
  const { loading, error, run } = useAuthTask(options);

  const deleteAccount = ({
    currentPassword,
  }: {
    currentPassword?: string;
  } = {}): Promise<HookResult> =>
    run("delete-account", "Failed to delete account", async () => {
      const user = requireCurrentUser(auth);
      if (currentPassword) await reauthenticateUserWithPassword(user, currentPassword);
      await options.onBeforeDelete?.(user);
      await deleteUser(user);
      return {};
    });

  return { deleteAccount, loading, error };
}
