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
import { getFirebaseErrorCode } from "../core/get-firebase-error-code";
import type { HookErrorContext, HookErrorOptions, HookResult } from "../core/types";

export type { HookErrorContext, HookErrorOptions, HookResult };
// Re-exported so every hook in this module imports its shared shapes from one
// place; the public copies live in the core entry.
export { getFirebaseErrorCode };

/**
 * Where a server session integrates: called with a fresh ID token after a
 * successful sign-in. Throw inside it to abort the flow — the hook surfaces
 * the error and reports failure.
 */
export type OnIdToken = (idToken: string, user: User) => void | Promise<void>;

/** The raw message, untouched — no rewording, no guessing. */
function rawErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/** Provider-level configuration shared with every hook below the provider. */
export interface AuthConfigContextValueProps {
  /** The provider's own `Auth`, for hooks called without one. */
  auth?: Auth | null;
  formatErrorMessage?: (error: unknown) => string;
  onIdToken?: OnIdToken;
  onBeforeSignOut?: () => void | Promise<void>;
  actionCodeSettings?: ActionCodeSettings;
  onError?: (error: unknown, context: HookErrorContext) => void;
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

/**
 * Is this the SDK's `Auth`, or an options object?
 *
 * Structural rather than `instanceof`: the SDK exports `Auth` as a type only.
 * `currentUser` is the discriminator — always present on a real instance, and
 * not a field any options interface declares, so the two can never be confused.
 */
function isAuthInstance(value: unknown): value is Auth {
  return typeof value === "object" && value !== null && "currentUser" in value;
}

/**
 * Splits `(auth?, options?)` from `(options?)`, falling back to the provider's
 * `auth` when the hook was called without one.
 *
 * `undefined` and an options object both mean "use the provider". An explicit
 * `null` keeps its existing meaning — auth is not ready yet, so don't run —
 * and must not be treated as "inherit", or a hook would start acting during
 * the window a consumer is deliberately holding it back.
 */
export function useAuthArgs<O extends object>(
  authOrOptions: Auth | null | O | undefined,
  maybeOptions: O | undefined,
): [Auth | null, O] {
  const config = useContext(AuthConfigContext);
  const passedAuth = isAuthInstance(authOrOptions) || authOrOptions === null;

  const auth = passedAuth ? (authOrOptions as Auth | null) : (config?.auth ?? null);
  // Falls through to the second slot when the first holds no options: hooks
  // with an extra positional argument resolve their own and call with
  // `(undefined, options)`.
  const options =
    (passedAuth ? maybeOptions : ((authOrOptions as O | undefined) ?? maybeOptions)) ??
    ({} as O);

  return [auth, options];
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
export function useErrorMessageResolver(options?: HookErrorOptions) {
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
 * The global observer, fire-and-forget: a throwing observer can never break
 * or alter a flow — it runs in addition to the result, never instead of it.
 */
export function useAuthErrorObserver() {
  const config = useContext(AuthConfigContext);
  const ref = useRef(config?.onError);
  ref.current = config?.onError;
  return useCallback((error: unknown, context: HookErrorContext) => {
    try {
      ref.current?.(error, context);
    } catch {
      /* observers never affect the flow */
    }
  }, []);
}

/**
 * The loading/error/try-catch skeleton every action hook repeats. `run` never
 * throws: failures come back as `{ success: false, error, code, cause }` with
 * the `error` state set to the same message.
 */
export function useAuthTask(options?: HookErrorOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolveMessage = useErrorMessageResolver(options);
  const notifyError = useAuthErrorObserver();

  const run = useCallback(
    async <T extends object>(
      action: string,
      fallback: string,
      task: () => Promise<T>,
    ): Promise<HookResult<T>> => {
      setLoading(true);
      setError(null);
      try {
        const value = await task();
        return { success: true, ...value };
      } catch (cause) {
        const message = resolveMessage(cause, fallback);
        const code = getFirebaseErrorCode(cause);
        setError(message);
        notifyError(cause, { action, code, message });
        return { success: false, error: message, code, cause };
      } finally {
        setLoading(false);
      }
    },
    [resolveMessage, notifyError],
  );

  return { loading, error, setError, run };
}
