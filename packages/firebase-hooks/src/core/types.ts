/**
 * @description The shared shapes every service's hooks use — results, error
 * options, and the observer context. Service-agnostic by design.
 */

/**
 * Result shape every action in this package resolves to — never throws.
 * Failures carry three layers so processing can never gate the raw
 * information: `error` (the processed message), `code` (Firebase's raw error
 * code, extracted for convenience), and `cause` (the complete untouched error).
 */
export type HookResult<T extends object = Record<never, never>> =
  | ({ success: true } & T)
  | { success: false; error: string; code: string | null; cause: unknown };

export interface HookErrorOptions {
  /**
   * Override the `error` message for this hook. Takes precedence over the
   * provider-level config; the default (no config anywhere) is the raw error's
   * own message, untouched.
   */
  formatErrorMessage?: (error: unknown) => string;
}

/** What failed, for the global `onError` observer. */
export interface HookErrorContext {
  /** Stable id of the operation: "login", "oauth-sign-in", "update-password", … */
  action: string;
  /** Firebase's raw error code, or null. */
  code: string | null;
  /** The resolved display message the user saw. */
  message: string;
}
