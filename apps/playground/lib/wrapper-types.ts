/**
 * Type-only. Resolves the package's public types through its exports map the
 * way an installed app does, so `typecheck` fails if one stops being reachable.
 */

import type { AsyncStatus, HookResult } from '@timonwa/firebase-hooks';
import type {
  AuthContextValueProps,
  AuthProviderProps,
  CompleteSignInResult,
  VerifyEmailStatusType,
  UseAnonymousSignInOptionsProps,
  UseCustomTokenSignInOptionsProps,
  UseDeleteAccountOptionsProps,
  UseEmailLinkSignInOptionsProps,
  UseLoginOptionsProps,
  UseLogoutOptionsProps,
  UseOAuthSignInOptionsProps,
  UsePhoneSignInOptionsProps,
  UseSendEmailVerificationOptionsProps,
  UseSendPasswordResetEmailOptionsProps,
  UseSignupOptionsProps,
  UseUpdateEmailOptionsProps,
  UseVerifyEmailOptionsProps,
} from '@timonwa/firebase-hooks/auth';

/** The wrapper shape the docs recommend for server-fetched user records. */
export type AppAuth = AuthContextValueProps & { record: { plan: string } | null };

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
export const VERIFY_STATES: VerifyEmailStatusType[] = ['pending', 'error', 'success'];

/** Every option interface, reachable by name from the auth entry. */
export type AuthOptions = {
  anonymousSignIn: UseAnonymousSignInOptionsProps;
  customTokenSignIn: UseCustomTokenSignInOptionsProps;
  deleteAccount: UseDeleteAccountOptionsProps;
  emailLinkSignIn: UseEmailLinkSignInOptionsProps;
  login: UseLoginOptionsProps;
  logout: UseLogoutOptionsProps;
  oauthSignIn: UseOAuthSignInOptionsProps;
  phoneSignIn: UsePhoneSignInOptionsProps;
  sendEmailVerification: UseSendEmailVerificationOptionsProps;
  sendPasswordResetEmail: UseSendPasswordResetEmailOptionsProps;
  signup: UseSignupOptionsProps;
  updateEmail: UseUpdateEmailOptionsProps;
  verifyEmail: UseVerifyEmailOptionsProps;
};
