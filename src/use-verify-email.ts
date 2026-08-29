/**
 * @description Applies an email-verification `oobCode` on mount and reports a
 * status the page renders from. Guards against React Strict Mode's double
 * effect — the code is single-use. After verifying, the current user (if any)
 * is reloaded and the token refreshed so `emailVerified` propagates, then the
 * optional `onVerified` callback runs — refresh your server session there.
 *
 * @param auth - Firebase `Auth` instance, or null while it initialises
 * @param oobCode - The code from the verification link, or null while parsing the URL
 * @param options.onVerified - Runs after a successful verification (e.g. refresh the session)
 * @returns `{ status, error, code, cause }` — status is "processing" | "success" | "failed";
 * `code`/`cause` carry the raw failure like every other hook
 *
 * @example
 * const oobCode = searchParams.get("oobCode");
 * const { status, error } = useVerifyEmail(auth, oobCode, { onVerified: refreshSession });
 * if (status === "processing") return <Spinner />;
 * if (status === "failed") return <ErrorState message={error} />;
 * return <SuccessState />;
 */

"use client";

import { type Auth, applyActionCode, type User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  getFirebaseErrorCode,
  type HookErrorOptions,
  useAuthErrorObserver,
  useErrorMessageResolver,
} from "./_shared";

type VerifyEmailStatusType = "processing" | "success" | "failed";

interface UseVerifyEmailOptionsProps extends HookErrorOptions {
  onVerified?: (user: User | null) => void | Promise<void>;
}

export function useVerifyEmail(
  auth: Auth | null,
  oobCode: string | null,
  options: UseVerifyEmailOptionsProps = {},
) {
  const [status, setStatus] = useState<VerifyEmailStatusType>("processing");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [cause, setCause] = useState<unknown>(null);
  const appliedRef = useRef(false);
  const resolveMessage = useErrorMessageResolver(options);
  const notifyError = useAuthErrorObserver();
  const onVerifiedRef = useRef(options.onVerified);
  onVerifiedRef.current = options.onVerified;

  useEffect(() => {
    if (!auth) return;
    if (!oobCode) {
      setStatus("failed");
      setError("Verification code is missing");
      return;
    }
    // The oobCode is single-use — never apply it twice (Strict Mode re-runs effects).
    if (appliedRef.current) return;
    appliedRef.current = true;

    applyActionCode(auth, oobCode)
      .then(async () => {
        if (auth.currentUser) {
          try {
            await auth.currentUser.reload();
            await auth.currentUser.getIdToken(true);
          } catch {
            /* best-effort — verification itself already succeeded */
          }
        }
        await onVerifiedRef.current?.(auth.currentUser);
        setStatus("success");
      })
      .catch((err: unknown) => {
        const message = resolveMessage(err, "Failed to verify email");
        setStatus("failed");
        setError(message);
        setCode(getFirebaseErrorCode(err));
        setCause(err);
        notifyError(err, {
          action: "verify-email",
          code: getFirebaseErrorCode(err),
          message,
        });
      });
  }, [auth, oobCode, resolveMessage, notifyError]);

  return { status, error, code, cause };
}
