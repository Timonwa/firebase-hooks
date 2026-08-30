# demo

A scratch app for exercising every hook in [`@timonwa/firebase-hooks`](../../packages/firebase-hooks) against a real Firebase project.

```bash
pnpm install          # from the repo root
pnpm build            # build the library first — the demo imports it via its exports map
pnpm --filter demo dev
```

## Bring your own Firebase project

The demo has **no Firebase credentials of its own**. On first load it asks for your web config, keeps it in `localStorage`, and initialises Firebase with it in the browser.

That's deliberate: `usePhoneSignIn` sends real SMS and the email hooks consume send quota, so a demo running on the maintainer's project would be a standing invitation to run up their bill. Your project, your quota.

Firebase web config is public by design — it identifies a project, it doesn't authorise anything. Security rules and authorized domains are what protect it.

### Before the flows will work

In the Firebase console for your project:

- **Authentication → Sign-in method** — enable the providers you want to try
- **Authentication → Settings → Authorized domains** — add wherever you're running it (`localhost` is there by default), or OAuth and email links are rejected
- **Sign-in method → Phone → Test numbers** — add one, so phone auth doesn't send billable SMS
- **Authentication → Templates** — point the action URL at `/auth/action` to try email verification and password reset

## Routes

| Route              | Hooks                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Config setup and status                                                                                                                                                           |
| `/sign-in`         | `useLogin`, `useSignup`, `useOAuthSignIn`, `useEmailLinkSignIn`, `useAnonymousSignIn`, `useCustomTokenSignIn`, `useLogout`                                                        |
| `/sign-in/phone`   | `usePhoneSignIn`                                                                                                                                                                  |
| `/auth/callback`   | `useEmailLinkSignIn` completion, including the `needsEmail` path                                                                                                                  |
| `/auth/action`     | `useVerifyEmail`, `useConfirmPasswordReset` — routed on Firebase's `mode` param                                                                                                   |
| `/forgot-password` | `useSendPasswordResetEmail`                                                                                                                                                       |
| `/account`         | `useAuth`, `useUpdateProfile`, `useSendEmailVerification`, `useUpdateEmail`, `useUpdatePassword`, `useReauthenticate`, `useLinkProvider`, `useUnlinkProvider`, `useDeleteAccount` |

Several of these need real routes rather than inline widgets — OAuth redirect needs a return URL, and the `oobCode` flows need a page Firebase can link to.

**Format errors** in the header toggles `formatErrorMessage` on the provider, so you can see the same failure as Firebase's raw message and as the shipped `AUTH_ERROR_MESSAGES` copy.

Every action renders the literal result it resolved to, which is the most direct way to see the `{ success, error, code, cause }` contract.
