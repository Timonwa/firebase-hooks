/**
 * @description Internal helpers plus the public result/callback types the
 * hooks share. Only the types and `getFirebaseErrorCode` reach the barrel; the
 * rest stays private.
 */

import {
  type ActionCodeSettings,
  type Auth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useRef, useState } from "react";

/**
 * Result shape every action in this package resolves to — never throws.
 * Failures carry three layers so our processing can never gate the raw
 * information: `error` (the processed message), `code` (Firebase's raw error
 * code, extracted for convenience), and `cause` (the complete untouched error).
 */
export type AuthResult<T extends object = Record<never, never>> =
  | ({ success: true } & T)
  | { success: false; error: string; code: string | null; cause: unknown };

/**
 * Where a server session integrates: called with a fresh ID token after a
 * successful sign-in. Throw inside it to abort the flow — the hook surfaces
 * the error and reports failure.
 */
export type OnIdToken = (idToken: string, user: User) => void | Promise<void>;

export interface AuthErrorOptions {
  /**
   * Override the `error` message for this hook. Takes precedence over the
   * provider-level config; the default (no config anywhere) is the raw error's
   * own message, untouched.
   */
  formatErrorMessage?: (error: unknown) => string;
}

/**
 * The `code` of a Firebase error ("auth/invalid-credential",
 * "firestore/permission-denied", …), or null for anything that isn't one —
 * the same extraction that fills every failure result's `code` field.
 */
export function getFirebaseErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

/** The raw message, untouched — no rewording, no guessing. */
function rawErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/** Provider-level configuration shared with every hook below the provider. */
export interface AuthConfigContextValueProps {
  formatErrorMessage?: (error: unknown) => string;
  onIdToken?: OnIdToken;
  onBeforeSignOut?: () => void | Promise<void>;
  actionCodeSettings?: ActionCodeSettings;
}

export const AuthConfigContext = createContext<AuthConfigContextValueProps | undefined>(
  undefined,
);

/**
 * Resolves a hook option against the provider config: the hook's own value
 * wins, an explicit `null` opts this flow out of an inherited global, and
 * `undefined` inherits.
 */
export function useResolvedConfig<K extends keyof AuthConfigContextValueProps>(
  key: K,
  option: AuthConfigContextValueProps[K] | null | undefined,
): AuthConfigContextValueProps[K] | undefined {
  const config = useContext(AuthConfigContext);
  if (option === null) return undefined;
  return option ?? config?.[key];
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
 * Resolves the `error` message with the agreed precedence: hook option →
 * provider config → the raw message. A throwing formatter falls back to the
 * raw message — formatting must never be able to lose the error.
 */
export function useErrorMessageResolver(options?: AuthErrorOptions) {
  const config = useContext(AuthConfigContext);
  const formatRef = useRef<((error: unknown) => string) | undefined>(undefined);
  formatRef.current = options?.formatErrorMessage ?? config?.formatErrorMessage;

  return useCallback((error: unknown, fallback: string): string => {
    const format = formatRef.current;
    if (format) {
      try {
        return format(error);
      } catch {
        /* fall through to the raw message */
      }
    }
    return rawErrorMessage(error, fallback);
  }, []);
}

/**
 * The loading/error/try-catch skeleton every action hook repeats. `run` never
 * throws: failures come back as `{ success: false, error, code, cause }` with
 * the `error` state set to the same message.
 */
export function useAuthTask(options?: AuthErrorOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolveMessage = useErrorMessageResolver(options);

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
      } catch (cause) {
        const message = resolveMessage(cause, fallback);
        setError(message);
        return {
          success: false,
          error: message,
          code: getFirebaseErrorCode(cause),
          cause,
        };
      } finally {
        setLoading(false);
      }
    },
    [resolveMessage],
  );

  return { loading, error, setError, run };
}
