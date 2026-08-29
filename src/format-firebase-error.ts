/**
 * @description Opt-in error formatter. Precedence: a match in `messages` wins;
 * an unmapped Firebase error gets its own message cleaned (the "Firebase: "
 * prefix and trailing "(auth/…)" code stripped — Firebase's words, not ours);
 * any other error passes through raw. Never unwraps HTTP envelopes — an error
 * thrown from your own callback is yours and passes through untouched.
 *
 * Works for every Firebase service (auth/*, firestore/*, storage/* codes all
 * share one error shape); pair it with the service's catalogue.
 *
 * @param error - Whatever was thrown
 * @param options.messages - Code → copy map, e.g. `AUTH_ERROR_MESSAGES` (spread and override for i18n)
 * @param options.fallback - Returned when nothing usable can be extracted (default: "Something went wrong")
 * @returns The display message
 *
 * @example
 * formatFirebaseError(cause, { messages: AUTH_ERROR_MESSAGES }) // "Incorrect email or password."
 *
 * @example
 * // i18n: spread the catalogue and override per code
 * formatFirebaseError(cause, { messages: { ...AUTH_ERROR_MESSAGES, "auth/invalid-credential": "Email ou mot de passe incorrect." } })
 */

import { getFirebaseErrorCode } from "./_shared";

export interface FormatFirebaseErrorOptions {
  messages?: Record<string, string>;
  fallback?: string;
}

const DEFAULT_FALLBACK = "Something went wrong";

/** Strips Firebase's framing ("Firebase: … (auth/x).") and keeps its words. */
function cleanFirebaseMessage(message: string, code: string): string | null {
  let cleaned = message.replace(/^Firebase:\s*/, "");
  const codePattern = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  cleaned = cleaned.replace(new RegExp(`\\s*\\(${codePattern}\\)\\.?\\s*$`), "").trim();
  // "Firebase: Error (auth/x)." cleans down to "Error" — no words worth keeping.
  if (!cleaned || cleaned === "Error") return null;
  return cleaned;
}

export function formatFirebaseError(
  error: unknown,
  options: FormatFirebaseErrorOptions = {},
): string {
  const code = getFirebaseErrorCode(error);

  if (code) {
    const mapped = options.messages?.[code];
    if (mapped) return mapped;
    if (error instanceof Error && error.message) {
      const cleaned = cleanFirebaseMessage(error.message, code);
      if (cleaned) return cleaned;
    }
    // No mapping and no usable words — the code itself beats a vague fallback.
    return options.fallback ?? code;
  }

  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return options.fallback ?? DEFAULT_FALLBACK;
}
