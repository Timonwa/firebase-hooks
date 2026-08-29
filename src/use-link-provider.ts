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
  type AuthErrorOptions,
  type AuthResult,
  requireCurrentUser,
  useAuthTask,
} from "./_shared";

export function useLinkProvider(auth: Auth | null, options: AuthErrorOptions = {}) {
  const { loading, error, run } = useAuthTask(options);

  const linkWithProvider = (
    provider: FirebaseAuthProvider,
  ): Promise<AuthResult<{ user: User; credential: UserCredential }>> =>
    run("Failed to link account", async () => {
      const credential = await linkWithPopup(requireCurrentUser(auth), provider);
      return { user: credential.user, credential };
    });

  const linkWithPassword = (
    email: string,
    password: string,
  ): Promise<AuthResult<{ user: User; credential: UserCredential }>> =>
    run("Failed to link account", async () => {
      const credential = await linkWithCredential(
        requireCurrentUser(auth),
        EmailAuthProvider.credential(email, password),
      );
      return { user: credential.user, credential };
    });

  return { linkWithProvider, linkWithPassword, loading, error };
}
