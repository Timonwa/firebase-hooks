/**
 * @description Sign-in with a server-minted custom token (Admin SDK
 * `createCustomToken`) — for bridging your own auth system into Firebase.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @returns `{ signIn, loading, error }`
 *
 * @example
 * const { signIn } = useCustomTokenSignIn(auth);
 * const { token } = await fetchCustomTokenFromYourApi();
 * await signIn(token);
 */

"use client";

import { type Auth, signInWithCustomToken, type User } from "firebase/auth";
import {
  type AuthErrorOptions,
  type AuthResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
} from "./_shared";

interface UseCustomTokenSignInOptionsProps extends AuthErrorOptions {
  onIdToken?: OnIdToken;
}

export function useCustomTokenSignIn(
  auth: Auth | null,
  options: UseCustomTokenSignInOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);

  const signIn = (customToken: string): Promise<AuthResult<{ user: User }>> =>
    run("Sign-in failed", async () => {
      const credential = await signInWithCustomToken(requireAuth(auth), customToken);
      await runOnIdToken(options.onIdToken, credential.user);
      return { user: credential.user };
    });

  return { signIn, loading, error };
}
