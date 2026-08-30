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
  type HookErrorOptions,
  type HookResult,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

export function useUnlinkProvider(auth: Auth | null, options: HookErrorOptions = {}) {
  const { loading, error, run } = useAuthTask(options);

  const unlinkProvider = (providerId: string): Promise<HookResult<{ user: User }>> =>
    run("unlink-provider", "Failed to unlink provider", async () => {
      const user = await unlink(requireCurrentUser(auth), providerId);
      return { user };
    });

  return { unlinkProvider, loading, error };
}
