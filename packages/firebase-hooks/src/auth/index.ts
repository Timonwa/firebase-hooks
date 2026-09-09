// The ./auth entry — everything Firebase Auth, including its error catalogue,
// each hook's options interface, and the type each hook returns.
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
  type UseAnonymousSignInResult,
  useAnonymousSignIn,
} from "./use-anonymous-sign-in.js";
export {
  type UseConfirmPasswordResetResult,
  useConfirmPasswordReset,
} from "./use-confirm-password-reset.js";
export {
  type UseCustomTokenSignInOptions,
  type UseCustomTokenSignInResult,
  useCustomTokenSignIn,
} from "./use-custom-token-sign-in.js";
export {
  type UseDeleteAccountOptions,
  type UseDeleteAccountResult,
  useDeleteAccount,
} from "./use-delete-account.js";
export {
  type CompleteSignInResult,
  type UseEmailLinkSignInOptions,
  type UseEmailLinkSignInResult,
  useEmailLinkSignIn,
} from "./use-email-link-sign-in.js";
export {
  type UseLinkProviderResult,
  useLinkProvider,
} from "./use-link-provider.js";
export {
  type UseLoginOptions,
  type UseLoginResult,
  useLogin,
} from "./use-login.js";
export {
  type UseLogoutOptions,
  type UseLogoutResult,
  useLogout,
} from "./use-logout.js";
export {
  type UseOAuthSignInOptions,
  type UseOAuthSignInResult,
  useOAuthSignIn,
} from "./use-oauth-sign-in.js";
export {
  type UsePhoneSignInOptions,
  type UsePhoneSignInResult,
  usePhoneSignIn,
} from "./use-phone-sign-in.js";
export {
  type UseReauthenticateResult,
  useReauthenticate,
} from "./use-reauthenticate.js";
export {
  type UseSendEmailVerificationOptions,
  type UseSendEmailVerificationResult,
  useSendEmailVerification,
} from "./use-send-email-verification.js";
export {
  type UseSendPasswordResetEmailOptions,
  type UseSendPasswordResetEmailResult,
  useSendPasswordResetEmail,
} from "./use-send-password-reset-email.js";
export {
  type UseSignupOptions,
  type UseSignupResult,
  useSignup,
} from "./use-signup.js";
export {
  type UseUnlinkProviderResult,
  useUnlinkProvider,
} from "./use-unlink-provider.js";
export {
  type UseUpdateEmailOptions,
  type UseUpdateEmailResult,
  useUpdateEmail,
} from "./use-update-email.js";
export {
  type UseUpdatePasswordResult,
  useUpdatePassword,
} from "./use-update-password.js";
export {
  type UseUpdateProfileResult,
  useUpdateProfile,
} from "./use-update-profile.js";
export {
  type UseVerifyEmailOptions,
  type UseVerifyEmailResult,
  useVerifyEmail,
  type VerifyEmailStatus,
} from "./use-verify-email.js";
