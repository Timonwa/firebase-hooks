// The public surface — one explicit export line per file.
export {
  type AuthErrorOptions,
  type AuthResult,
  getFirebaseErrorCode,
  type OnIdToken,
} from "./_shared.js";
export { AUTH_ERROR_MESSAGES } from "./auth-error-messages.js";
export { AuthProvider, useAuth } from "./auth-provider.js";
export {
  type FormatFirebaseErrorOptions,
  formatFirebaseError,
} from "./format-firebase-error.js";
export { useAnonymousSignIn } from "./use-anonymous-sign-in.js";
export { useConfirmPasswordReset } from "./use-confirm-password-reset.js";
export { useCustomTokenSignIn } from "./use-custom-token-sign-in.js";
export { useDeleteAccount } from "./use-delete-account.js";
export { useEmailLinkSignIn } from "./use-email-link-sign-in.js";
export { useLinkProvider } from "./use-link-provider.js";
export { useLogin } from "./use-login.js";
export { useLogout } from "./use-logout.js";
export { useOAuthSignIn } from "./use-oauth-sign-in.js";
export { usePhoneSignIn } from "./use-phone-sign-in.js";
export { useReauthenticate } from "./use-reauthenticate.js";
export { useSendEmailVerification } from "./use-send-email-verification.js";
export { useSendPasswordResetEmail } from "./use-send-password-reset-email.js";
export { useSignup } from "./use-signup.js";
export { useUnlinkProvider } from "./use-unlink-provider.js";
export { useUpdateEmail } from "./use-update-email.js";
export { useUpdatePassword } from "./use-update-password.js";
export { useUpdateProfile } from "./use-update-profile.js";
export { useVerifyEmail } from "./use-verify-email.js";
