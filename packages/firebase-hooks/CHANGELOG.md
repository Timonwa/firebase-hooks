# @timonwa/firebase-hooks

## 0.1.0

### Minor Changes

- [#11](https://github.com/Timonwa/firebase-hooks/pull/11) [`fe2779c`](https://github.com/Timonwa/firebase-hooks/commit/fe2779c17ae632d87f29430f208c56a718818e11) Thanks [@Timonwa](https://github.com/Timonwa)! - Initial release. Typed React hooks for Firebase, one import per service. This release covers the shared core and the Auth service; Firestore and Storage follow.
  
  **Auth — `@timonwa/firebase-hooks/auth`**
  
  - `AuthProvider` / `useAuth` — live user and custom claims via `onIdTokenChanged`, plus app-wide defaults.
  - Sign in — `useLogin`, `useSignup`, `useOAuthSignIn` (popup or redirect, redirect completed on return), `useEmailLinkSignIn` (`needsEmail` instead of `window.prompt`), `usePhoneSignIn` (managed reCAPTCHA, `recaptchaSize` option), `useAnonymousSignIn`, `useCustomTokenSignIn`, `useLogout` (your session teardown runs first).
  - Passwords — `useSendPasswordResetEmail`, `useConfirmPasswordReset` (with `verifyCode`), `useUpdatePassword`.
  - Email — `useVerifyEmail`, `useSendEmailVerification`, `useUpdateEmail`.
  - Account — `useUpdateProfile`, `useDeleteAccount`, `useReauthenticate`, `useLinkProvider`, `useUnlinkProvider`.
  - `AUTH_ERROR_MESSAGES` — a curated `auth/*` message catalogue, applied only if you opt in.
  
  **Core — `@timonwa/firebase-hooks`**
  
  `formatFirebaseError`, `getFirebaseErrorCode`, and the shared `HookResult`, `HookErrorOptions`, `HookErrorContext`, `FormatFirebaseErrorOptions`, and `OnIdToken` types.
  
  **How it behaves**
  
  - Actions never throw. Each resolves to `{ success: true, ... }` or `{ success: false, error, code, cause }`, where `error` is Firebase's own message unless you opt into formatting, and `cause` is the untouched error.
  - Sign-in successes hand back Firebase's raw `UserCredential` alongside the user.
  - Server sessions plug in through `onIdToken` and `onBeforeSignOut`; throw inside either to abort the flow.
  - `onIdToken`, `onBeforeSignOut`, `actionCodeSettings`, `formatErrorMessage`, and a fire-and-forget `onError(error, { action, code, message })` observer are set once on `AuthProvider`; any hook can override them or opt out with `null`.
  - Sensitive operations reauthenticate when given `currentPassword`, and work without it for OAuth-only accounts.
  
  Zero dependencies — `firebase` and `react` are peers. Ships ESM and CJS with type declarations and a `"use client"` banner.
