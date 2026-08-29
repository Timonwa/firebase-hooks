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
  updateProfile,
} from "firebase/auth";
import {
  type AuthErrorOptions,
  type AuthResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
} from "./_shared";

interface UseSignupOptionsProps extends AuthErrorOptions {
  sendVerificationEmail?: boolean;
  onIdToken?: OnIdToken;
}

export function useSignup(auth: Auth | null, options: UseSignupOptionsProps = {}) {
  const { sendVerificationEmail = true, onIdToken } = options;
  const { loading, error, run } = useAuthTask(options);

  const signup = (
    email: string,
    password: string,
    profile: { displayName?: string; photoURL?: string } = {},
  ): Promise<AuthResult<{ user: User }>> =>
    run("Signup failed", async () => {
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
      return { user: credential.user };
    });

  return { signup, loading, error };
}
