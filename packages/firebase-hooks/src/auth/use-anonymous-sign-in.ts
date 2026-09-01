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

import {
  type Auth,
  signInAnonymously,
  type User,
  type UserCredential,
} from "firebase/auth";
import {
  type HookErrorOptions,
  type HookResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthArgs,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseAnonymousSignInOptionsProps extends HookErrorOptions {
  /**
   * Called with a freshly minted ID token after sign-in — mint your server
   * session here. Throwing aborts the flow. Overrides the provider; `null` opts out.
   */
  onIdToken?: OnIdToken | null;
}

export function useAnonymousSignIn(
  options?: UseAnonymousSignInOptionsProps,
): ReturnType<typeof useAnonymousSignInBase>;
export function useAnonymousSignIn(
  auth: Auth | null,
  options?: UseAnonymousSignInOptionsProps,
): ReturnType<typeof useAnonymousSignInBase>;
export function useAnonymousSignIn(
  authOrOptions?: Auth | null | UseAnonymousSignInOptionsProps,
  maybeOptions?: UseAnonymousSignInOptionsProps,
) {
  return useAnonymousSignInBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useAnonymousSignInBase(
  auth: Auth | null,
  options: UseAnonymousSignInOptionsProps,
) {
  const { loading, error, run } = useAuthTask(options);
  const onIdToken = useResolvedConfig("onIdToken", options.onIdToken);

  const signIn = (): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("anonymous-sign-in", "Sign-in failed", async () => {
      const credential = await signInAnonymously(requireAuth(auth));
      await runOnIdToken(onIdToken, credential.user);
      return { user: credential.user, credential };
    });

  return { signIn, loading, error };
}
