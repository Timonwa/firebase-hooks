/**
 * @description Anonymous (guest) sign-in. The resulting user is upgradeable to
 * a real account later without losing data — pair with `useLinkProvider`.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @returns `{ signIn, loading, error }`
 *
 * @example
 * const { signIn } = useAnonymousSignIn(auth);
 * <button onClick={signIn}>Continue as guest</button>
 */

"use client";

import { type Auth, signInAnonymously, type User } from "firebase/auth";
import {
  type AuthErrorOptions,
  type AuthResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
} from "./_shared";

interface UseAnonymousSignInOptionsProps extends AuthErrorOptions {
  onIdToken?: OnIdToken;
}

export function useAnonymousSignIn(
  auth: Auth | null,
  options: UseAnonymousSignInOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);

  const signIn = (): Promise<AuthResult<{ user: User }>> =>
    run("Sign-in failed", async () => {
      const credential = await signInAnonymously(requireAuth(auth));
      await runOnIdToken(options.onIdToken, credential.user);
      return { user: credential.user };
    });

  return { signIn, loading, error };
}
