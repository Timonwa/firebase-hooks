// The root entry — the service-agnostic core every subpath shares. Nothing
// service-specific lives here: auth is at ./auth, future services get their
// own subpath (./firestore, ./storage).
export {
  type FormatFirebaseErrorOptions,
  formatFirebaseError,
} from "./format-firebase-error.js";
export { getFirebaseErrorCode } from "./get-firebase-error-code.js";
export type {
  HookErrorContext,
  HookErrorOptions,
  HookResult,
} from "./types.js";
