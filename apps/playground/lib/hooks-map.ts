/**
 * The playground's contents: one page per service, groups as sections on it.
 *
 * Mirrors the docs site's grouping exactly, so someone moving between the two
 * finds the same shape. A new service is a new entry here plus a page at
 * `/[slug]` — nothing else in the shell needs to know about it.
 */
export const SERVICES = [
  {
    slug: 'auth',
    label: 'Auth',
    href: '/auth',
    groups: [
      {
        label: 'Signing in and out',
        hooks: [
          // Signup leads: a fresh project has no accounts, so it is the only
          // thing here that can succeed on a first run.
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
        hooks: [
          'useSendPasswordResetEmail',
          'useConfirmPasswordReset',
          'useUpdatePassword',
        ],
      },
      {
        label: 'Email',
        hooks: ['useSendEmailVerification', 'useVerifyEmail', 'useUpdateEmail'],
      },
      {
        label: 'Account and linking',
        hooks: [
          'useAuth',
          'useUpdateProfile',
          'useReauthenticate',
          'useLinkProvider',
          'useUnlinkProvider',
          'useDeleteAccount',
        ],
      },
    ],
  },
] as const;

/** `useLogin` → `use-login`, matching the docs' page slugs. */
export function toAnchor(hook: string) {
  return hook.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/** `Signing in and out` → `signing-in-and-out`, for the group headings. */
export function toGroupAnchor(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function docsUrl(hook: string) {
  return `https://firebase-hooks.vercel.app/docs/auth/${toAnchor(hook)}`;
}
