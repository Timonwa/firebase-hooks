/**
 * The sidebar, mirroring the docs site's grouping exactly — same four groups in
 * the same order, so someone moving between the docs and the playground finds the
 * same shape.
 */
export const GROUPS = [
  {
    label: 'Signing in and out',
    href: '/signing-in',
    hooks: [
      // Signup leads: a fresh project has no accounts, so it is the only thing
      // here that can succeed on a first run.
      'useSignup',
      'useLogin',
      'useLogout',
      'useOAuthSignIn',
      'useEmailLinkSignIn',
      'usePhoneSignIn',
      'useAnonymousSignIn',
      'useCustomTokenSignIn',
    ],
  },
  {
    label: 'Passwords',
    href: '/passwords',
    hooks: ['useSendPasswordResetEmail', 'useConfirmPasswordReset', 'useUpdatePassword'],
  },
  {
    label: 'Email',
    href: '/email',
    hooks: ['useSendEmailVerification', 'useVerifyEmail', 'useUpdateEmail'],
  },
  {
    label: 'Account and linking',
    href: '/account',
    hooks: [
      'useAuth',
      'useUpdateProfile',
      'useReauthenticate',
      'useLinkProvider',
      'useUnlinkProvider',
      'useDeleteAccount',
    ],
  },
] as const;

/** `useLogin` → `use-login`, matching the docs' page slugs. */
export function toAnchor(hook: string) {
  return hook.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function docsUrl(hook: string) {
  return `https://firebase-hooks.vercel.app/docs/auth/${toAnchor(hook)}`;
}
