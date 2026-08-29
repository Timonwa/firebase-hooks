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
import { type AuthErrorOptions, type AuthResult, useAuthTask } from "./_shared";

interface UseLogoutOptionsProps extends AuthErrorOptions {
  onBeforeSignOut?: () => void | Promise<void>;
}

export function useLogout(auth: Auth | null, options: UseLogoutOptionsProps = {}) {
  const { loading, error, run } = useAuthTask(options);

  const logout = (): Promise<AuthResult> =>
    run("Logout failed", async () => {
      await options.onBeforeSignOut?.();
      if (auth) await signOut(auth);
      return {};
    });

  return { logout, loading, error };
}
