/**
 * Proof that a consumer can type a wrapper without restating the package's
 * shapes — it resolves through the exports map exactly as an installed app
 * does, so `pnpm --filter playground typecheck` fails if any of these stop
 * being reachable from `@timonwa/firebase-hooks/auth`.
 *
 * Type-only, so nothing here ships in the bundle.
 */

import type { HookResult } from '@timonwa/firebase-hooks';
import type {
  AuthContextValueProps,
  AuthProviderProps,
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
