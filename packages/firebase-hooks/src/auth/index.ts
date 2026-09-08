// The ./auth entry — everything Firebase Auth, including its error catalogue.
// Shared shapes (HookResult, HookErrorOptions, HookErrorContext) live in the
// core entry, not here: every service returns them, so they have one home.
//
// Each hook's options interface is re-exported so an app can type a wrapper
// around it without restating the shape.

export type { OnIdToken } from "./_shared.js";
export { AUTH_ERROR_MESSAGES } from "./auth-error-messages.js";
export {
  type AuthContextValueProps,
  AuthProvider,
  type AuthProviderProps,
  useAuth,
} from "./auth-provider.js";
export {
  type UseAnonymousSignInOptionsProps,
  useAnonymousSignIn,
} from "./use-anonymous-sign-in.js";
export { useConfirmPasswordReset } from "./use-confirm-password-reset.js";
export {
  type UseCustomTokenSignInOptionsProps,
  useCustomTokenSignIn,
} from "./use-custom-token-sign-in.js";
export {
  type UseDeleteAccountOptionsProps,
  useDeleteAccount,
} from "./use-delete-account.js";
export {
  type UseEmailLinkSignInOptionsProps,
  useEmailLinkSignIn,
} from "./use-email-link-sign-in.js";
export { useLinkProvider } from "./use-link-provider.js";
export { type UseLoginOptionsProps, useLogin } from "./use-login.js";
export { type UseLogoutOptionsProps, useLogout } from "./use-logout.js";
export { type UseOAuthSignInOptionsProps, useOAuthSignIn } from "./use-oauth-sign-in.js";
export { type UsePhoneSignInOptionsProps, usePhoneSignIn } from "./use-phone-sign-in.js";
export { useReauthenticate } from "./use-reauthenticate.js";
export {
  type UseSendEmailVerificationOptionsProps,
  useSendEmailVerification,
} from "./use-send-email-verification.js";
export {
  type UseSendPasswordResetEmailOptionsProps,
  useSendPasswordResetEmail,
} from "./use-send-password-reset-email.js";
export { type UseSignupOptionsProps, useSignup } from "./use-signup.js";
export { useUnlinkProvider } from "./use-unlink-provider.js";
export { type UseUpdateEmailOptionsProps, useUpdateEmail } from "./use-update-email.js";
export { useUpdatePassword } from "./use-update-password.js";
export { useUpdateProfile } from "./use-update-profile.js";
export { type UseVerifyEmailOptionsProps, useVerifyEmail } from "./use-verify-email.js";
