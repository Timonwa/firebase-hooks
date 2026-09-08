/**
 * Type-only. Resolves the package's public types through its exports map the
 * way an installed app does, so `typecheck` fails if one stops being reachable.
 */

import type { AsyncStatus, HookResult } from '@timonwa/firebase-hooks';
import type {
  UseAuthResult,
  AuthProviderProps,
  CompleteSignInResult,
  VerifyEmailStatus,
  UseAnonymousSignInOptions,
  UseAnonymousSignInResult,
  UseConfirmPasswordResetResult,
  UseCustomTokenSignInResult,
  UseDeleteAccountResult,
  UseEmailLinkSignInResult,
  UseLinkProviderResult,
  UseLoginResult,
  UseLogoutResult,
  UseOAuthSignInResult,
  UsePhoneSignInResult,
  UseReauthenticateResult,
  UseSendEmailVerificationResult,
  UseSendPasswordResetEmailResult,
  UseSignupResult,
  UseUnlinkProviderResult,
  UseUpdateEmailResult,
  UseUpdatePasswordResult,
  UseUpdateProfileResult,
  UseVerifyEmailResult,
  UseCustomTokenSignInOptions,
  UseDeleteAccountOptions,
  UseEmailLinkSignInOptions,
  UseLoginOptions,
  UseLogoutOptions,
  UseOAuthSignInOptions,
  UsePhoneSignInOptions,
  UseSendEmailVerificationOptions,
  UseSendPasswordResetEmailOptions,
  UseSignupOptions,
  UseUpdateEmailOptions,
  UseVerifyEmailOptions,
} from '@timonwa/firebase-hooks/auth';

/** The wrapper shape the docs recommend for server-fetched user records. */
export type AppAuth = UseAuthResult & { record: { plan: string } | null };

/** An app provider layered on top, reusing the package's own props. */
export type AppAuthProviderProps = Omit<AuthProviderProps, 'auth'> & {
  auth: AuthProviderProps['auth'];
};

/** A wrapper stating what it resolves to, rather than redeclaring the shape. */
export type WrappedLogin = (
  email: string,
  password: string,
) => Promise<HookResult<{ uid: string }>>;

/** A page rendering the link-completion result without redeclaring its shape. */
export type CallbackState =
  | { phase: Exclude<AsyncStatus, 'error'> }
  | { phase: 'error'; result: Extract<CompleteSignInResult, { success: false }> };

/** The status vocabulary, shared rather than respelled per hook. */
export const VERIFY_STATES: VerifyEmailStatus[] = ['pending', 'error', 'success'];

/** Every option interface, reachable by name from the auth entry. */
export type AuthOptions = {
  anonymousSignIn: UseAnonymousSignInOptions;
  customTokenSignIn: UseCustomTokenSignInOptions;
  deleteAccount: UseDeleteAccountOptions;
  emailLinkSignIn: UseEmailLinkSignInOptions;
  login: UseLoginOptions;
  logout: UseLogoutOptions;
  oauthSignIn: UseOAuthSignInOptions;
  phoneSignIn: UsePhoneSignInOptions;
  sendEmailVerification: UseSendEmailVerificationOptions;
  sendPasswordResetEmail: UseSendPasswordResetEmailOptions;
  signup: UseSignupOptions;
  updateEmail: UseUpdateEmailOptions;
  verifyEmail: UseVerifyEmailOptions;
};

/** Every hook's return type, reachable by name from the auth entry. */
export type AuthResults = {
  anonymousSignIn: UseAnonymousSignInResult;
  confirmPasswordReset: UseConfirmPasswordResetResult;
  customTokenSignIn: UseCustomTokenSignInResult;
  deleteAccount: UseDeleteAccountResult;
  emailLinkSignIn: UseEmailLinkSignInResult;
  linkProvider: UseLinkProviderResult;
  login: UseLoginResult;
  logout: UseLogoutResult;
  oAuthSignIn: UseOAuthSignInResult;
  phoneSignIn: UsePhoneSignInResult;
  reauthenticate: UseReauthenticateResult;
  sendEmailVerification: UseSendEmailVerificationResult;
  sendPasswordResetEmail: UseSendPasswordResetEmailResult;
  signup: UseSignupResult;
  unlinkProvider: UseUnlinkProviderResult;
  updateEmail: UseUpdateEmailResult;
  updatePassword: UseUpdatePasswordResult;
  updateProfile: UseUpdateProfileResult;
  verifyEmail: UseVerifyEmailResult;
};
