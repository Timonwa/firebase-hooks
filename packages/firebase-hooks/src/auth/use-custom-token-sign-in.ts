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

import {
  type Auth,
  signInWithCustomToken,
  type User,
  type UserCredential,
} from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseCustomTokenSignInOptionsProps extends HookErrorOptions {
  /**
   * Called with a freshly minted ID token after sign-in — mint your server
   * session here. Throwing aborts the flow. Overrides the provider; `null` opts out.
   */
  onIdToken?: OnIdToken | null;
}

export function useCustomTokenSignIn(
  auth: Auth | null,
  options: UseCustomTokenSignInOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);
  const onIdToken = useResolvedConfig("onIdToken", options.onIdToken);

  const signIn = (
    customToken: string,
  ): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("custom-token-sign-in", "Sign-in failed", async () => {
      const credential = await signInWithCustomToken(requireAuth(auth), customToken);
      await runOnIdToken(onIdToken, credential.user);
      return { user: credential.user, credential };
    });

  return { signIn, loading, error };
}
