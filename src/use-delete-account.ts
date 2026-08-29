/**
 * @description Deletes the signed-in user's account. Pass the current password
 * for email/password accounts — Firebase requires a recent sign-in for
 * deletion, so the hook reauthenticates first (OAuth-only accounts can omit it
 * and reauthenticate via `useReauthenticate` beforehand). The optional
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
 * const result = await deleteAccount(currentPassword);
 * if (result.success) router.push("/goodbye");
 */

"use client";

import { type Auth, deleteUser, type User } from "firebase/auth";
import {
  type AuthErrorOptions,
  type AuthResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

interface UseDeleteAccountOptionsProps extends AuthErrorOptions {
  onBeforeDelete?: (user: User) => void | Promise<void>;
}

export function useDeleteAccount(
  auth: Auth | null,
  options: UseDeleteAccountOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);

  const deleteAccount = (currentPassword?: string): Promise<AuthResult> =>
    run("Failed to delete account", async () => {
      const user = requireCurrentUser(auth);
      if (currentPassword) await reauthenticateUserWithPassword(user, currentPassword);
      await options.onBeforeDelete?.(user);
      await deleteUser(user);
      return {};
    });

  return { deleteAccount, loading, error };
}
