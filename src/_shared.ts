/**
 * @description Internal helpers and the public result/callback types the hooks
 * share. Only the types reach the barrel; the helpers stay private.
 */

import { formatAuthError } from "@timonwa/app-utilities";
import {
  type Auth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { useCallback, useRef, useState } from "react";

/** Result shape every action in this package resolves to — never throws. */
export type AuthResult<T extends object = Record<never, never>> =
  | ({ success: true } & T)
  | { success: false; error: string };

/**
 * Where a server session integrates: called with a fresh ID token after a
 * successful sign-in. Throw inside it to abort the flow — the hook surfaces
 * the error and reports failure.
 */
export type OnIdToken = (idToken: string, user: User) => void | Promise<void>;

export interface AuthErrorOptions {
  /** Override the user-facing message derived from a Firebase error. */
  formatErrorMessage?: (error: unknown) => string;
}

export function requireAuth(auth: Auth | null): Auth {
  if (!auth) throw new Error("Firebase auth is not initialised");
  return auth;
}

export function requireCurrentUser(auth: Auth | null): User {
  const user = requireAuth(auth).currentUser;
  if (!user) throw new Error("No user is signed in");
  return user;
}

/** The reauthentication dance sensitive operations share. */
export async function reauthenticateUserWithPassword(
  user: User,
  currentPassword: string,
): Promise<void> {
  if (!user.email) throw new Error("This account has no email/password sign-in");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

export async function runOnIdToken(
  onIdToken: OnIdToken | undefined,
  user: User,
): Promise<void> {
  if (!onIdToken) return;
  const idToken = await user.getIdToken(true);
  await onIdToken(idToken, user);
}

/**
 * The loading/error/try-catch skeleton every action hook repeats. `run` never
 * throws: failures come back as `{ success: false, error }` with `error` state
 * set to the same message.
 */
export function useAuthTask(options?: AuthErrorOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Read through a ref so an inline options object doesn't change `run`'s identity.
  const formatRef = useRef(options?.formatErrorMessage);
  formatRef.current = options?.formatErrorMessage;

  const run = useCallback(
    async <T extends object>(
      fallback: string,
      task: () => Promise<T>,
    ): Promise<AuthResult<T>> => {
      setLoading(true);
      setError(null);
      try {
        const value = await task();
        return { success: true, ...value };
      } catch (err) {
        const message = formatRef.current?.(err) ?? formatAuthError(err, { fallback });
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, setError, run };
}
