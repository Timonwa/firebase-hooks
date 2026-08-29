/**
 * @description The `code` of a Firebase error ("auth/invalid-credential",
 * "firestore/permission-denied", …), or null for anything that isn't one —
 * the same extraction that fills every failure result's `code` field. Works
 * for every Firebase service; the error shape is shared across the SDK.
 *
 * @example getFirebaseErrorCode(cause) // "auth/invalid-credential"
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
