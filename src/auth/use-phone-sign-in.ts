/**
 * @description Phone-number sign-in, two steps: `sendCode` verifies the caller
 * via reCAPTCHA and texts the SMS code; `confirmCode` completes sign-in with
 * the code the user typed. The reCAPTCHA verifier is created and cleaned up
 * for you — pass the id (or element) of an empty container node, and choose
 * `recaptchaSize: "invisible"` (default) or `"normal"` for the visible widget.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param options.recaptchaSize - "invisible" (default) or "normal" (visible widget)
 * @param options.onIdToken - Called with the ID token + user after sign-in
 * @param options.formatErrorMessage - Override the error message for this hook
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
  type UserCredential,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  type HookErrorOptions,
  type HookResult,
  type OnIdToken,
  requireAuth,
  runOnIdToken,
  useAuthTask,
  useResolvedConfig,
} from "./_shared";

interface UsePhoneSignInOptionsProps extends HookErrorOptions {
  recaptchaSize?: "invisible" | "normal";
  onIdToken?: OnIdToken | null;
}

export function usePhoneSignIn(
  auth: Auth | null,
  options: UsePhoneSignInOptionsProps = {},
) {
  const { loading, error, run } = useAuthTask(options);
  const onIdToken = useResolvedConfig("onIdToken", options.onIdToken);
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
  ): Promise<HookResult> =>
    run("send-phone-code", "Failed to send verification code", async () => {
      const instance = requireAuth(auth);
      verifierRef.current ??= new RecaptchaVerifier(instance, recaptchaContainer, {
        size: options.recaptchaSize ?? "invisible",
      });
      confirmationRef.current = await signInWithPhoneNumber(
        instance,
        phoneNumber,
        verifierRef.current,
      );
      setCodeSent(true);
      return {};
    });

  const confirmCode = (
    code: string,
  ): Promise<HookResult<{ user: User; credential: UserCredential }>> =>
    run("confirm-phone-code", "Invalid verification code", async () => {
      if (!confirmationRef.current) throw new Error("Send a verification code first");
      const credential = await confirmationRef.current.confirm(code);
      await runOnIdToken(onIdToken, credential.user);
      return { user: credential.user, credential };
    });

  return { sendCode, confirmCode, codeSent, loading, error };
}
