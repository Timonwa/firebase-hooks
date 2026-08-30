/**
 * @description The curated `auth/*` code → message catalogue for
 * `formatFirebaseError`. Copy is security-conscious: credential failures never
 * reveal whether an account exists. Spread and override per code for i18n or
 * your own voice — `{ ...AUTH_ERROR_MESSAGES, "auth/invalid-credential": "…" }`.
 *
 * @example
 * formatFirebaseError(cause, { messages: AUTH_ERROR_MESSAGES })
 */

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Credentials — deliberately identical so account existence is never revealed.
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",

  // Email / password quality
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/weak-password": "That password is too weak — use at least 6 characters.",
  "auth/email-already-in-use": "An account with this email already exists.",

  // Account state
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-token-expired": "Your session has expired. Please sign in again.",
  "auth/invalid-user-token": "Your session is no longer valid. Please sign in again.",
  "auth/requires-recent-login": "For security, please sign in again before doing this.",

  // Action codes (password reset, email verification, email link)
  "auth/expired-action-code": "This link has expired. Request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",

  // OAuth popups / redirects
  "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
  "auth/popup-blocked":
    "The browser blocked the sign-in window — allow popups and try again.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled for this app.",
  "auth/unauthorized-domain": "Sign-in isn't allowed from this domain.",

  // Provider linking
  "auth/credential-already-in-use":
    "This sign-in method is already linked to another account.",
  "auth/provider-already-linked":
    "This sign-in method is already linked to your account.",
  "auth/no-such-provider": "This sign-in method isn't linked to your account.",

  // Phone / SMS
  "auth/invalid-phone-number": "That doesn't look like a valid phone number.",
  "auth/missing-phone-number": "Please enter a phone number.",
  "auth/invalid-verification-code": "That code is incorrect. Check it and try again.",
  "auth/code-expired": "That code has expired. Request a new one.",
  "auth/captcha-check-failed": "The reCAPTCHA check failed — try again.",

  // Rate limiting / infrastructure
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/quota-exceeded": "Too many requests right now — try again later.",
  "auth/network-request-failed": "Network error — check your connection and try again.",
  "auth/timeout": "The request timed out. Try again.",
  "auth/internal-error": "Something went wrong. Please try again.",

  // Multi-factor (flows land in a later minor; the error can surface today)
  "auth/multi-factor-auth-required": "Additional verification is required to sign in.",
};
