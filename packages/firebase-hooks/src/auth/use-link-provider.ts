/**
 * @description Adds a sign-in method to the current user — link an OAuth
 * provider via popup, or an email/password credential. The classic use is
 * upgrading an anonymous guest to a real account without losing their data.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @returns `{ linkWithProvider, linkWithPassword, loading, error }`
 *
 * @example
 * const { linkWithProvider, linkWithPassword } = useLinkProvider(auth);
 * await linkWithProvider(new GoogleAuthProvider());   // guest -> Google account
 * await linkWithPassword(email, password);            // guest -> email/password account
 */

"use client";

import {
  type Auth,
  EmailAuthProvider,
  type AuthProvider as FirebaseAuthProvider,
  linkWithCredential,
  linkWithPopup,
  type User,
  type UserCredential,
} from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  requireCurrentUser,
  useAuthArgs,
  useAuthTask,
} from "./_shared";

/** What `useLinkProvider` returns. */
export type UseLinkProviderResult = ReturnType<typeof useLinkProviderBase>;

export function useLinkProvider(options?: HookErrorOptions): UseLinkProviderResult;
export function useLinkProvider(
  auth: Auth | null,
  options?: HookErrorOptions,
): UseLinkProviderResult;
export function useLinkProvider(
  authOrOptions?: Auth | null | HookErrorOptions,
  maybeOptions?: HookErrorOptions,
) {
  return useLinkProviderBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useLinkProviderBase(auth: Auth | null, options: HookErrorOptions) {
  const { status, isIdle, isPending, isSuccess, isError, error, reset, run } =
    useAuthTask(options);

  const linkWithProvider = (
    provider: FirebaseAuthProvider,
  ): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("link-provider", "Failed to link account", async () => {
      const credential = await linkWithPopup(requireCurrentUser(auth), provider);
      return { user: credential.user, credential };
    });

  const linkWithPassword = (
    email: string,
    password: string,
  ): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("link-provider", "Failed to link account", async () => {
      const credential = await linkWithCredential(
        requireCurrentUser(auth),
        EmailAuthProvider.credential(email, password),
      );
      return { user: credential.user, credential };
    });

  return {
    linkWithProvider,
    linkWithPassword,
    status,
    isIdle,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
