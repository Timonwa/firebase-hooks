/**
 * @description Sign-out. The optional `onBeforeSignOut` callback runs FIRST —
 * clear your server session there. The order is deliberate: if the server call
 * throws, the Firebase session is preserved so the user can retry, instead of
 * being half signed out.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onBeforeSignOut - Clear the server session; throw to abort the sign-out
 * @returns `{ logout, loading, error }`
 *
 * @example
 * const { logout, loading } = useLogout(auth, { onBeforeSignOut: clearSession });
 * <button onClick={logout} disabled={loading}>Sign out</button>
 */

"use client";

import { type Auth, signOut } from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseLogoutOptionsProps extends HookErrorOptions {
  /**
   * Runs before Firebase clears the session — clear your server session here.
   * Throwing leaves the user signed in. Overrides the provider; `null` opts out.
   */
  onBeforeSignOut?: (() => void | Promise<void>) | null;
}

export function useLogout(auth: Auth | null, options: UseLogoutOptionsProps = {}) {
  const { loading, error, run } = useAuthTask(options);
  const onBeforeSignOut = useResolvedConfig("onBeforeSignOut", options.onBeforeSignOut);

  const logout = (): Promise<HookResult> =>
    run("logout", "Logout failed", async () => {
      await onBeforeSignOut?.();
      if (auth) await signOut(auth);
      return {};
    });

  return { logout, loading, error };
}
