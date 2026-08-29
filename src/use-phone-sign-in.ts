/**
 * @description Phone-number sign-in, two steps: `sendCode` verifies the caller
 * via an invisible reCAPTCHA and texts the SMS code; `confirmCode` completes
 * sign-in with the code the user typed. The reCAPTCHA verifier is created and
 * cleaned up for you — pass the id (or element) of an empty container node.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @param options.formatErrorMessage - Override the user-facing error message
 * @returns `{ sendCode, confirmCode, codeSent, loading, error }`
 *
 * @example
 * const { sendCode, confirmCode, codeSent } = usePhoneSignIn(auth, { onIdToken: createSession });
 * <div id="recaptcha-container" />
 * await sendCode("+2348012345678", "recaptcha-container");
 * // then, after the user types the SMS code:
 * const result = await confirmCode(smsCode);
 */

"use client";

import {
  type Auth,
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type User,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  type AuthErrorOptions,
  type AuthResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
} from "./_shared";

interface UsePhoneSignInOptionsProps extends AuthErrorOptions {
  onIdToken?: OnIdToken;
}

export function usePhoneSignIn(
  auth: Auth | null,
  options: UsePhoneSignInOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);
  const [codeSent, setCodeSent] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  const sendCode = (
    phoneNumber: string,
    recaptchaContainer: string | HTMLElement,
  ): Promise<AuthResult> =>
    run("Failed to send verification code", async () => {
      const instance = requireAuth(auth);
      verifierRef.current ??= new RecaptchaVerifier(instance, recaptchaContainer, {
        size: "invisible",
      });
      confirmationRef.current = await signInWithPhoneNumber(
        instance,
        phoneNumber,
        verifierRef.current,
      );
      setCodeSent(true);
      return {};
    });

  const confirmCode = (code: string): Promise<AuthResult<{ user: User }>> =>
    run("Invalid verification code", async () => {
      if (!confirmationRef.current) throw new Error("Send a verification code first");
      const credential = await confirmationRef.current.confirm(code);
      await runOnIdToken(options.onIdToken, credential.user);
      return { user: credential.user };
    });

  return { sendCode, confirmCode, codeSent, loading, error };
}
