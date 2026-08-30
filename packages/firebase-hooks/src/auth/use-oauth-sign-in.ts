/**
 * @description OAuth sign-in with any provider — Google, Apple, GitHub,
 * Facebook, Microsoft, X, or a custom `OAuthProvider`. Defaults to the popup
 * flow; pass `method: "redirect"` for environments that block popups. The hook
 * also completes a pending redirect on mount (`getRedirectResult`), running
 * the same `onIdToken` callback, so one hook covers both halves of the
 * redirect round-trip.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @param options.formatErrorMessage - Override the user-facing error message
 * @returns `{ signIn, loading, error }`
 *
 * @example
 * const { signIn, loading, error } = useOAuthSignIn(auth, { onIdToken: createSession });
 * <button onClick={() => signIn(new GoogleAuthProvider())}>Continue with Google</button>
 *
 * @example
 * // Popup-hostile environments (in-app browsers)
 * await signIn(new GoogleAuthProvider(), { method: "redirect" });
 */

"use client";

import {
  type Auth,
  type AuthProvider as FirebaseAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type User,
  type UserCredential,
} from "firebase/auth";
import { useEffect, useRef } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

export interface UseOAuthSignInOptionsProps extends HookErrorOptions {
  /**
   * Called with a freshly minted ID token after sign-in — mint your server
   * session here. Throwing aborts the flow. Overrides the provider; `null` opts out.
   */
  onIdToken?: OnIdToken | null;
}

export function useOAuthSignIn(
  auth: Auth | null,
  options: UseOAuthSignInOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);
  // getRedirectResult consumes the pending result — guard Strict Mode's double effect.
  const redirectHandledRef = useRef(false);
  // Read the callback through a ref so an inline option object can't re-trigger the effect.
  const onIdToken = useResolvedConfig("onIdToken", options.onIdToken);
  const onIdTokenRef = useRef(onIdToken);
  onIdTokenRef.current = onIdToken;

  useEffect(() => {
    if (!auth || redirectHandledRef.current) return;
    redirectHandledRef.current = true;
    void run("oauth-redirect", "Sign-in failed", async () => {
      const result = await getRedirectResult(auth);
      if (result) await runOnIdToken(onIdTokenRef.current, result.user);
      return {};
    });
  }, [auth, run]);

  const signIn = (
    provider: FirebaseAuthProvider,
    { method = "popup" }: { method?: "popup" | "redirect" } = {},
  ): Promise<HookResult<{ user: User | null; credential: UserCredential | null }>> =>
    run("oauth-sign-in", "Sign-in failed", async () => {
      const instance = requireAuth(auth);
      if (method === "redirect") {
        // Navigates away; the mount effect completes the flow when we return.
        await signInWithRedirect(instance, provider);
        return { user: null, credential: null };
      }
      const credential = await signInWithPopup(instance, provider);
      await runOnIdToken(onIdTokenRef.current, credential.user);
      return { user: credential.user, credential };
    });

  return { signIn, loading, error };
}
