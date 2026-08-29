/**
 * @description Removes a sign-in method from the current user by provider id
 * ("google.com", "password", "github.com", …). Firebase refuses to unlink the
 * last remaining method, so the account can't be locked out this way.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ unlinkProvider, loading, error }`
 *
 * @example
 * const { unlinkProvider } = useUnlinkProvider(auth);
 * await unlinkProvider("google.com");
 */

"use client";

import { type Auth, type User, unlink } from "firebase/auth";
import {
  type AuthErrorOptions,
  type AuthResult,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

export function useUnlinkProvider(auth: Auth | null, options: AuthErrorOptions = {}) {
  const { loading, error, run } = useAuthTask(options);

  const unlinkProvider = (providerId: string): Promise<AuthResult<{ user: User }>> =>
    run("Failed to unlink provider", async () => {
      const user = await unlink(requireCurrentUser(auth), providerId);
      return { user };
    });

  return { unlinkProvider, loading, error };
}
