/**
 * @description Email/password signup — the standard client-side flow:
 * `createUserWithEmailAndPassword`, an optional display name, a verification
 * email (on by default), and the optional `onIdToken` callback for minting a
 * server session. Server-first signups (API creates the record, client signs
 * in after) compose `useLogin` instead.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.displayName - Set on the profile right after the account is created
 * @param options.sendVerificationEmail - Send the verification mail after signup (default: true)
 * @param options.onIdToken - Called with the ID token + user after signup
 * @param options.formatErrorMessage - Override the user-facing error message
 * @returns `{ signup, loading, error }`
 *
 * @example
 * const { signup, loading, error } = useSignup(auth, { onIdToken: createSession });
 * const result = await signup(email, password, { displayName: fullName });
 * if (result.success) router.push("/verify-email");
 */

"use client";

import {
  type Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  type User,
  type UserCredential,
  updateProfile,
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

export interface UseSignupOptionsProps extends HookErrorOptions {
  /**
   * Send the verification email once the account is created.
   * @defaultValue true
   */
  sendVerificationEmail?: boolean;
  /**
   * Called with a freshly minted ID token after sign-in — mint your server
   * session here. Throwing aborts the flow. Overrides the provider; `null` opts out.
   */
  onIdToken?: OnIdToken | null;
}

export function useSignup(
  options?: UseSignupOptionsProps,
): ReturnType<typeof useSignupBase>;
export function useSignup(
  auth: Auth | null,
  options?: UseSignupOptionsProps,
): ReturnType<typeof useSignupBase>;
export function useSignup(
  authOrOptions?: Auth | null | UseSignupOptionsProps,
  maybeOptions?: UseSignupOptionsProps,
) {
  return useSignupBase(...useAuthArgs(authOrOptions, maybeOptions));
}

function useSignupBase(auth: Auth | null, options: UseSignupOptionsProps) {
  const { sendVerificationEmail = true } = options;
  const { loading, error, run } = useAuthTask(options);
  const onIdToken = useResolvedConfig("onIdToken", options.onIdToken);

  const signup = (
    email: string,
    password: string,
    profile: { displayName?: string; photoURL?: string } = {},
  ): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("signup", "Signup failed", async () => {
      const credential = await createUserWithEmailAndPassword(
        requireAuth(auth),
        email,
        password,
      );
      if (profile.displayName || profile.photoURL) {
        await updateProfile(credential.user, profile);
      }
      if (sendVerificationEmail) {
        await sendEmailVerification(credential.user);
      }
      await runOnIdToken(onIdToken, credential.user);
      return { user: credential.user, credential };
    });

  return { signup, loading, error };
}
