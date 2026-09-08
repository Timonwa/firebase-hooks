// The ./auth entry — everything Firebase Auth, including its error catalogue
// and each hook's options interface.
//
// Shared shapes (HookResult, HookErrorOptions, HookErrorContext, AsyncStatus)
// ship from the core entry instead: every service returns them.

export type { AuthSenders, EmailSender, OnIdToken } from "./_shared.js";
export { AUTH_ERROR_MESSAGES } from "./auth-error-messages.js";
export {
  AuthProvider,
  type AuthProviderProps,
  type UseAuthResult,
  useAuth,
} from "./auth-provider.js";
export {
  type UseAnonymousSignInOptions,
  useAnonymousSignIn,
} from "./use-anonymous-sign-in.js";
export { useConfirmPasswordReset } from "./use-confirm-password-reset.js";
export {
  type UseCustomTokenSignInOptions,
  useCustomTokenSignIn,
} from "./use-custom-token-sign-in.js";
export {
  type UseDeleteAccountOptions,
  useDeleteAccount,
} from "./use-delete-account.js";
export {
  type CompleteSignInResult,
  type UseEmailLinkSignInOptions,
  useEmailLinkSignIn,
} from "./use-email-link-sign-in.js";
export { useLinkProvider } from "./use-link-provider.js";
export { type UseLoginOptions, useLogin } from "./use-login.js";
export { type UseLogoutOptions, useLogout } from "./use-logout.js";
export { type UseOAuthSignInOptions, useOAuthSignIn } from "./use-oauth-sign-in.js";
export { type UsePhoneSignInOptions, usePhoneSignIn } from "./use-phone-sign-in.js";
export { useReauthenticate } from "./use-reauthenticate.js";
export {
  type UseSendEmailVerificationOptions,
  useSendEmailVerification,
} from "./use-send-email-verification.js";
export {
  type UseSendPasswordResetEmailOptions,
  useSendPasswordResetEmail,
} from "./use-send-password-reset-email.js";
export { type UseSignupOptions, useSignup } from "./use-signup.js";
export { useUnlinkProvider } from "./use-unlink-provider.js";
export { type UseUpdateEmailOptions, useUpdateEmail } from "./use-update-email.js";
export { useUpdatePassword } from "./use-update-password.js";
export { useUpdateProfile } from "./use-update-profile.js";
export {
  type UseVerifyEmailOptions,
  useVerifyEmail,
  type VerifyEmailStatus,
} from "./use-verify-email.js";
