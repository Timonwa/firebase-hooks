// The root entry — the service-agnostic core every subpath shares. Nothing
// service-specific lives here: auth is at ./auth, future services get their
// own subpath (./firestore, ./storage).
export {
  getFirebaseErrorCode,
  type HookErrorContext,
  type HookErrorOptions,
  type HookResult,
} from "./_shared.js";
export {
  type FormatFirebaseErrorOptions,
  formatFirebaseError,
} from "./format-firebase-error.js";
