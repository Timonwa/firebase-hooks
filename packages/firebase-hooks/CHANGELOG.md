# @timonwa/firebase-hooks

## 0.3.0

### Minor Changes

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`fc59c2e`](https://github.com/Timonwa/firebase-hooks/commit/fc59c2e6ccd64fffe63ecd37b8f54cc61bc4937c) Thanks [@Timonwa](https://github.com/Timonwa)! - **Breaking: `useVerifyEmail`'s `status` uses the standard async vocabulary.** `"processing"` is now `"pending"` and `"failed"` is now `"error"`, matching TanStack Query's `QueryStatus` rather than spelling the same three states differently.
  
  ```tsx
  - if (status === 'processing') return <Spinner />;
  - if (status === 'failed') return <ErrorState message={error} />;
  + if (status === 'pending') return <Spinner />;
  + if (status === 'error') return <ErrorState message={error} />;
  ```
  
  **Breaking: `useEmailLinkSignIn`'s `sendLink` option is now `sendEmail`.** All three emailed-link hooks take the same option name. The returned `sendLink` function is unchanged.
  
  ```tsx
  -useEmailLinkSignIn({ sendLink: email => api.send(email) });
  +useEmailLinkSignIn({ sendEmail: ({ email }) => api.send(email) });
  ```

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`23f2e5d`](https://github.com/Timonwa/firebase-hooks/commit/23f2e5dc1f15516061520ee174225eb4eda6fda7) Thanks [@Timonwa](https://github.com/Timonwa)! - `useSendPasswordResetEmail` and `useSendEmailVerification` gain a `sendEmail` option, matching `useEmailLinkSignIn`'s `sendLink`. Both hooks previously sent from the browser with no way to delegate, which put an email-sending path outside an app's own rate limiter — awkward when the same app already rate-limits the sign-in link server-side.
  
  ```tsx
  const { send } = useSendPasswordResetEmail({
    sendEmail: ({ email, actionCodeSettings }) =>
      requestPasswordReset(email, actionCodeSettings),
  });
  ```
  
  The hook keeps its own bookkeeping either way: `status`, `isPending`, `isSuccess`, `error` and `reset` behave identically, and a throwing sender surfaces as an ordinary failure result. The sender receives `{ email, actionCodeSettings }` — the same inputs Firebase's client send takes and the Admin SDK's `generate*Link` wants, so a provider-level `actionCodeSettings` still reaches your server. On `useSendEmailVerification`, `email` is the signed-in user's address, since `send()` takes no arguments; an account without one fails clearly rather than calling your sender with nothing.

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`b45ec5c`](https://github.com/Timonwa/firebase-hooks/commit/b45ec5c4c8c8741e56640b6eee0d7fb28c5d1f53) Thanks [@Timonwa](https://github.com/Timonwa)! - Two result types are no longer module-private:
  
  - `CompleteSignInResult` — what `useEmailLinkSignIn`'s `completeSignIn` resolves to, so a callback page can annotate the function that handles it
  - `VerifyEmailStatus` — `useVerifyEmail`'s status, instead of re-declaring the three states in app code
  
  Both ship from `@timonwa/firebase-hooks/auth`.
  
  The status vocabulary is also now shared. `AsyncStatus` (`"processing" | "success" | "failed"`) ships from the root entry, and `VerifyEmailStatus` is an alias of it, so hooks that act on mount report the same three states rather than each spelling them differently. There is no idle state: the work starts before a render, which is why `processing` is the initial value.

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`c7830aa`](https://github.com/Timonwa/firebase-hooks/commit/c7830aae05a941288d877a524438063371d98458) Thanks [@Timonwa](https://github.com/Timonwa)! - Every type needed to write a wrapper around a hook is now reachable from `@timonwa/firebase-hooks/auth`:
  
  - all 13 `Use*Options` interfaces, so a wrapper can accept and forward a hook's options without restating them
  - `AuthProviderProps` and `UseAuthResult` (what `useAuth` returns), for an app provider layered over this one
  
  ```tsx
  import { useLogin, type UseLoginOptions } from "@timonwa/firebase-hooks/auth";
  
  export function useAppLogin(options?: UseLoginOptions) {
    return useLogin(options);
  }
  ```
  
  `HookResult`, `HookErrorOptions` and `HookErrorContext` are unchanged and still ship from the root entry — every service returns them, so they keep one home rather than being re-exported per service.

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`bac2d4d`](https://github.com/Timonwa/firebase-hooks/commit/bac2d4dfa0f254d18a9285a5033f354b99f130ea) Thanks [@Timonwa](https://github.com/Timonwa)! - Every hook now exports the type it returns as `Use<Name>Result` — `UseLoginResult`, `UseSignupResult`, `UseVerifyEmailResult`, and so on, from `@timonwa/firebase-hooks/auth`. A wrapper can state its return type instead of re-deriving it with `ReturnType<typeof useLogin>`.
  
  ```tsx
  import {
    useLogin,
    type UseLoginOptions,
    type UseLoginResult,
  } from "@timonwa/firebase-hooks/auth";
  
  export function useAppLogin(options?: UseLoginOptions): UseLoginResult {
    return useLogin(options);
  }
  ```
  
  Same shape as TanStack Query's `UseQueryResult` / `UseMutationResult`. `useAuth` already returned the named `UseAuthResult`.

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`d3a9345`](https://github.com/Timonwa/firebase-hooks/commit/d3a9345afb1aaaafc86d2f8dee9324afd202a75f) Thanks [@Timonwa](https://github.com/Timonwa)! - `AuthProvider` gains `senders`, so an app that emails links from its own API configures that once instead of at every call site:
  
  ```tsx
  <AuthProvider
    auth={auth}
    senders={{
      signInLink: ({ email, actionCodeSettings }) => api.sendSignInLink(email, actionCodeSettings),
      passwordReset: ({ email, actionCodeSettings }) => api.sendPasswordReset(email, actionCodeSettings),
      emailVerification: ({ email, actionCodeSettings }) => api.sendVerification(email, actionCodeSettings),
    }}
  >
  ```
  
  One key per flow rather than a single sender: the three send different emails, so one sender for all of them could mail a password reset to someone asking to verify an address. The shape follows the same convention as TanStack Query's `defaultOptions`, which namespaces defaults by operation kind so the per-call signature stays identical to the global one.
  
  Each key follows the existing rule — a hook's own `sendLink`/`sendEmail` overrides it, and `null` opts that one flow back to Firebase's client-side send.

- [#21](https://github.com/Timonwa/firebase-hooks/pull/21) [`14c4f6a`](https://github.com/Timonwa/firebase-hooks/commit/14c4f6ad5478972e625181d21594725c2372a010) Thanks [@Timonwa](https://github.com/Timonwa)! - **Breaking: every action hook reports `status` with derived booleans, replacing `loading`, `success` and `resetState`.**
  
  ```tsx
  const { login, status, isIdle, isPending, isSuccess, isError, error, reset } =
    useLogin();
  //             ^ 'idle' | 'pending' | 'success' | 'error'
  ```
  
  | Before                                     | After                           |
  | ------------------------------------------ | ------------------------------- |
  | `loading`                                  | `isPending`                     |
  | `success` (six hooks, hand-rolled)         | `isSuccess` — now on every hook |
  | `resetState()` (two hooks)                 | `reset()` — now on every hook   |
  | `useEmailLinkSignIn`'s returned `setError` | removed; `reset()` covers it    |
  
  The booleans are derived from `status`, so exactly one is ever true. This is TanStack Query's mutation result, field for field, and the new `ActionStatus` type ships from the root entry beside `AsyncStatus`. Hooks that act on mount — `useVerifyEmail` — keep `AsyncStatus` (no `idle`, since the work starts before you can render) and gain the same `isPending`/`isSuccess`/`isError`.

## 0.2.0

### Minor Changes

- [#20](https://github.com/Timonwa/firebase-hooks/pull/20) [`ca73117`](https://github.com/Timonwa/firebase-hooks/commit/ca731179383a359d58bb51723f8fcf653b770fc6) Thanks [@Timonwa](https://github.com/Timonwa)! - **The `auth` argument is now optional.** Below an `AuthProvider`, hooks take the instance from it, so an app no longer names the same object at every call site:
  
  ```tsx
  const { login } = useLogin();
  const { signup } = useSignup({ sendVerificationEmail: false });
  ```
  
  Passing your own still works and overrides the provider's — what you need for a second Firebase project, or with no provider at all. `null` keeps its existing meaning of "not ready yet, don't run", so a hook held back while Firebase initialises never silently runs against the provider's instance instead.
  
  **Breaking: `useUpdatePassword` and `useUpdateEmail` take the new value positionally**, matching the Firebase SDK they wrap and `useSignup`'s existing shape.
  
  ```tsx
  // Before
  await update({ newPassword, currentPassword });
  await update({ newEmail, currentPassword });
  
  // After
  await update(newPassword, { currentPassword });
  await update(newEmail, { currentPassword });
  ```
  
  Firebase's own `updatePassword(user, newPassword)` and `verifyBeforeUpdateEmail(user, newEmail)` lead with the required value; `currentPassword` is the reauthentication these hooks add on top, so it belongs in the options bag after it. `useUpdateProfile` is unchanged — its fields are all optional, which is why the SDK passes them as an object too.
  
  Nothing else changes: every existing `useLogin(auth, options)` call keeps working.

### Patch Changes

- [#15](https://github.com/Timonwa/firebase-hooks/pull/15) [`f6c4950`](https://github.com/Timonwa/firebase-hooks/commit/f6c4950ead3eeffa7b775e514d8033f50fe9f0d4) Thanks [@Timonwa](https://github.com/Timonwa)! - Point `homepage` at the documentation site rather than the GitHub readme anchor, so the npm sidebar links somewhere with a page per hook.

## 0.1.1

### Patch Changes

- [#13](https://github.com/Timonwa/firebase-hooks/pull/13) [`c905822`](https://github.com/Timonwa/firebase-hooks/commit/c90582258042bca023e636f4a0d4c42d68e76cca) Thanks [@Timonwa](https://github.com/Timonwa)! - Document every hook option in the published types. Each `Use<Name>OptionsProps` field now carries TSDoc, with its default where it has one, so editors show what an option does at the call site instead of only its type.
  
  Also exposes `./package.json` as a subpath export, so tooling can read the version without reaching into the package directory.
  
  No runtime change — every hook behaves exactly as before.

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
