/**
 * @description Email/password sign-in. Signs in with Firebase, then hands the
 * fresh ID token to the optional `onIdToken` callback — mint your server
 * session there; throwing inside it aborts the flow and surfaces the error.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @param options.formatErrorMessage - Override the user-facing error message
 * @returns `{ login, loading, error }`
 *
 * @example
 * const { login, loading, error } = useLogin(auth, {
 *   onIdToken: (idToken) => createSession(idToken), // your Server Action / API call
 * });
 * const result = await login(email, password);
 * if (result.success) router.push("/dashboard");
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
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

interface UseLoginOptionsProps extends HookErrorOptions {
  onIdToken?: OnIdToken | null;
}

export function useLogin(auth: Auth | null, options: UseLoginOptionsProps = {}) {
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
