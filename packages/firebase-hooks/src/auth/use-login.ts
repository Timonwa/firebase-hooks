/**
 * @description Email/password sign-in. Signs in with Firebase, then hands the
 * fresh ID token to the optional `onIdToken` callback — mint your server
 * session there; throwing inside it aborts the flow and surfaces the error.
 *
 * @param auth - Firebase `Auth` instance. Optional below an `AuthProvider`,
 * which supplies its own; pass `null` while yours is still initialising.
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @param options.formatErrorMessage - Override the user-facing error message
 * @returns `{ login, loading, error }`
 *
 * @example
 * // Below an <AuthProvider>
 * const { login, loading, error } = useLogin({
 *   onIdToken: (idToken) => createSession(idToken), // your Server Action / API call
 * });
 * const result = await login(email, password);
 * if (result.success) router.push("/dashboard");
 *
 * @example
 * // Without a provider, or against a second Firebase project
 * const { login } = useLogin(auth);
 */

"use client";

import {
  type Auth,
  signInWithEmailAndPassword,
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

export interface UseLoginOptionsProps extends HookErrorOptions {
  /**
   * Called with a freshly minted ID token after sign-in — mint your server
   * session here. Throwing aborts the flow. Overrides the provider; `null` opts out.
   */
  onIdToken?: OnIdToken | null;
}

// Overloads give the two call styles; the return type is inferred from the
// implementation below rather than restated, so it cannot drift from it.
export function useLogin(options?: UseLoginOptionsProps): ReturnType<typeof useLoginBase>;
export function useLogin(
  auth: Auth | null,
  options?: UseLoginOptionsProps,
): ReturnType<typeof useLoginBase>;
export function useLogin(
  authOrOptions?: Auth | null | UseLoginOptionsProps,
  maybeOptions?: UseLoginOptionsProps,
) {
  return useLoginBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useLoginBase(auth: Auth | null, options: UseLoginOptionsProps) {
  const { loading, error, run } = useAuthTask(options);
  const onIdToken = useResolvedConfig("onIdToken", options.onIdToken);

  const login = (
    email: string,
    password: string,
  ): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("login", "Login failed", async () => {
      const credential = await signInWithEmailAndPassword(
        requireAuth(auth),
        email,
        password,
      );
      await runOnIdToken(onIdToken, credential.user);
      return { user: credential.user, credential };
    });

  return { login, loading, error };
}
