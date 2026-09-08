/**
 * @description Reauthentication on its own — for custom sensitive flows beyond
 * what `useUpdatePassword` / `useUpdateEmail` / `useDeleteAccount` build in.
 * Firebase rejects sensitive operations when the sign-in is stale
 * (`auth/requires-recent-login`); run one of these first, then retry.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ reauthenticateWithPassword, reauthenticateWithProvider, loading, error }`
 *
 * @example
 * const { reauthenticateWithPassword } = useReauthenticate(auth);
 * const check = await reauthenticateWithPassword(currentPassword);
 * if (check.success) await performSensitiveOperation();
 *
 * @example
 * // OAuth-only account — reauthenticate with the original provider's popup
 * await reauthenticateWithProvider(new GoogleAuthProvider());
 */

"use client";

import {
  type Auth,
  type AuthProvider as FirebaseAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  reauthenticateUserWithPassword,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

/** What `useReauthenticate` returns. */
export type UseReauthenticateResult = ReturnType<typeof useReauthenticateBase>;

export function useReauthenticate(options?: HookErrorOptions): UseReauthenticateResult;
export function useReauthenticate(
  auth: Auth | null,
  options?: HookErrorOptions,
): UseReauthenticateResult;
export function useReauthenticate(
  authOrOptions?: Auth | null | HookErrorOptions,
  maybeOptions?: HookErrorOptions,
) {
  return useReauthenticateBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useReauthenticateBase(auth: Auth | null, options: HookErrorOptions) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);

  const reauthenticateWithPassword = (currentPassword: string): Promise<HookResult> =>
    run("reauthenticate", "Reauthentication failed", async () => {
      await reauthenticateUserWithPassword(requireCurrentUser(auth), currentPassword);
      return {};
    });

  const reauthenticateWithProvider = (
    provider: FirebaseAuthProvider,
  ): Promise<HookResult> =>
    run("reauthenticate", "Reauthentication failed", async () => {
      await reauthenticateWithPopup(requireCurrentUser(auth), provider);
      return {};
    });

  return {
    reauthenticateWithPassword,
    reauthenticateWithProvider,
    status,
    isIdle,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
