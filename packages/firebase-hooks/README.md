<div align="center">
  <h1>@timonwa/firebase-hooks</h1>
  <b>Typed React hooks for Firebase — one hook per flow, with its state, errors, and callbacks handled.</b>
  <br/><br/>

<a href="https://www.npmjs.com/package/@timonwa/firebase-hooks"><img alt="npm" src="https://img.shields.io/npm/v/%40timonwa%2Ffirebase-hooks?style=flat-square&label=npm" /></a>
<a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" /></a>
<a href="../../CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" /></a>
<a href="https://www.timonwa.com/support"><img alt="Support" src="https://img.shields.io/badge/Support-%E2%9D%A4-ea4aaa?style=flat-square&logo=githubsponsors&logoColor=white" /></a>
</div>

---

Each hook runs one flow end to end. It holds its own loading, error, and success state, and sets up the browser pieces and callbacks the flow needs. Every action returns a result you can branch on: `{ success: true, … }` when it works, `{ success: false, error, code, cause }` when it doesn't. Firebase's own response is on both paths.

Zero dependencies — `firebase` and `react` are peers.

## Why this package

- **Each hook covers a whole flow, not one Firebase call.** `useEmailLinkSignIn` reports `needsEmail` when it needs the address, so you render the input in your own UI. `usePhoneSignIn` creates and cleans up the reCAPTCHA verifier. `useOAuthSignIn` finishes a redirect sign-in when the page returns. `useVerifyEmail` reports how far the code got.
- **Server sessions built in.** `onIdToken` hands you a fresh ID token after every sign-in — trade it for a session cookie in one line. `onBeforeSignOut` runs before Firebase clears the session, so a failed teardown leaves the user signed in.
- **Every action returns a result.** `{ success: true, ... }` or `{ success: false, error, code, cause }`, so a failed call is a value you read, not an exception you catch.
- **Firebase's own data, unmodified.** Sign-ins return the raw `UserCredential`; failures carry Firebase's error code and the original error. Message formatting is opt-in.
- **Automatic reauthentication.** Pass `currentPassword` to a sensitive operation and the hook handles the recent-sign-in check; omit it and `auth/requires-recent-login` reaches you.
- **Configure once or per call.** Session callbacks, action-code settings, error wording, and the `onError` observer live on the provider; any hook can override them or opt out with `null`.
- **Typed, tested, ESM + CJS.** Built against Firebase 11/12 and React 18/19. The `"use client"` banner tells React Server Component frameworks where the client boundary is.

## Quickstart

```bash
npm install @timonwa/firebase-hooks firebase
# or: pnpm add @timonwa/firebase-hooks firebase · yarn add @timonwa/firebase-hooks firebase
```

Requires React 18 or 19 and Firebase 11 or 12 (both peer dependencies).

```tsx
import { useLogin } from "@timonwa/firebase-hooks/auth";
import { auth } from "@/lib/firebase"; // your initialised Auth instance

function LoginForm() {
  const { login, loading, error } = useLogin(auth, {
    onIdToken: (idToken) => createSession(idToken), // mint your server session here
  });

  async function onSubmit(email: string, password: string) {
    const result = await login(email, password);
    if (result.success) router.push("/dashboard");
  }
}
```

## Services

| Service         | Import                              | Status      |
| --------------- | ----------------------------------- | ----------- |
| Core            | `@timonwa/firebase-hooks`           | Available   |
| Auth            | `@timonwa/firebase-hooks/auth`      | Available   |
| Firestore       | `@timonwa/firebase-hooks/firestore` | Coming soon |
| Storage         | `@timonwa/firebase-hooks/storage`   | Coming soon |
| Cloud Functions | `@timonwa/firebase-hooks/functions` | Coming soon |

The most-used services ship first; more (Realtime Database, Remote Config, Cloud Messaging, and others) may follow once these land.

Each service is its own import, so an app only carries the services it uses. The root holds what every service shares — `formatFirebaseError`, `getFirebaseErrorCode`, and the `HookResult` types.

```ts
import { formatFirebaseError, getFirebaseErrorCode } from "@timonwa/firebase-hooks";
import { AuthProvider, useLogin, AUTH_ERROR_MESSAGES } from "@timonwa/firebase-hooks/auth";
```

Every hook has its own page — signature, options, and a worked example — in the [documentation](https://github.com/Timonwa/firebase-hooks/tree/main/apps/docs/content/docs).

## How every hook works

One contract, so learning one hook is learning them all:

- **`auth` is the first argument** — your Firebase `Auth` instance, or `null` while it initialises. No global, no hidden singleton; calling an action before `auth` exists fails cleanly with `{ success: false, error }`.
- **Every action resolves to `HookResult`** — `{ success: true, ...data }` or `{ success: false, error, code, cause }`. The hook's `error` state carries the same message for rendering, and `loading` and `success` track the action. See [Error handling](#error-handling).
- **`onIdToken(idToken, user)` runs after a successful sign-in**, with a freshly minted token. Throw inside it to abort the flow; the error surfaces like any other.
- **`currentPassword` triggers reauthentication** in `useUpdatePassword`, `useUpdateEmail`, and `useDeleteAccount`. `useReauthenticate` exposes the same step for custom flows.
- **Provider options are defaults, hook options win.** `onIdToken`, `onBeforeSignOut`, `actionCodeSettings`, `formatErrorMessage`, and the `onError` observer can all be set once on `AuthProvider`; a hook's own option overrides the provider, and an explicit `null` opts that flow out entirely:

```tsx
<AuthProvider
  auth={auth}
  onIdToken={(idToken) => createSession(idToken)}
  onBeforeSignOut={() => clearSession()}
  actionCodeSettings={{ url: `${origin}/auth/action`, handleCodeInApp: true }}
  formatErrorMessage={(e) => formatFirebaseError(e, { messages: AUTH_ERROR_MESSAGES })}
>
  {children}
</AuthProvider>;

const { login } = useLogin(auth); // session minting inherited — nothing to wire
```

## Error handling

```ts
// from "@timonwa/firebase-hooks" (core); AUTH_ERROR_MESSAGES from "…/auth"
// A failed action, in full:
{ success: false,
  error: string,        // processed message — raw by default
  code: string | null,  // Firebase's raw code: "auth/invalid-credential"
  cause: unknown }      // the complete untouched error

getFirebaseErrorCode(error: unknown): string | null
formatFirebaseError(error, options?: { messages?: Record<string, string>; fallback?: string }): string
AUTH_ERROR_MESSAGES: Record<string, string>
```

With no configuration, `error` is the message Firebase produced. Formatting is opt-in via `formatFirebaseError`, which resolves in a fixed order. A match in `messages` wins. An unmapped Firebase error keeps Firebase's own words with the framing stripped: `"Firebase: The email address is badly formatted. (auth/invalid-email)."` becomes `"The email address is badly formatted."` Any other error passes through raw, so an error thrown from your own `onIdToken` or `onBefore*` callback arrives exactly as you threw it.

`AUTH_ERROR_MESSAGES` is the shipped `auth/*` catalogue with security-conscious copy (credential failures never reveal whether an account exists). Spread and override it for i18n or your own voice:

```tsx
// Once, globally — every hook below the provider uses it; any hook's own option overrides it:
<AuthProvider
  auth={auth}
  formatErrorMessage={(e) => formatFirebaseError(e, { messages: AUTH_ERROR_MESSAGES })}
>

// i18n / custom copy per code:
formatFirebaseError(e, { messages: { ...AUTH_ERROR_MESSAGES, "auth/invalid-credential": "Email ou mot de passe incorrect." } })

// Or skip messages entirely and branch on raw codes yourself:
const result = await login(email, password);
if (!result.success && result.code === "auth/too-many-requests") startCooldown();
```

If your formatter throws, `error` falls back to the raw message, so the failure still reaches you.

For logging and analytics, the provider's **`onError` observer** sees every failure from every hook. It receives the raw error and `{ action, code, message }`, where `action` is a stable id such as `"login"` or `"update-password"`. It is fire-and-forget: a throwing observer never affects the flow.

```tsx
<AuthProvider auth={auth} onError={(error, { action, code }) => track("auth_error", { action, code })}>
  {children}
</AuthProvider>
```

Future service catalogues ship with their own import (`FIRESTORE_ERROR_MESSAGES` with the Firestore hooks, `STORAGE_ERROR_MESSAGES` with Storage).

## SSR and server components

Every hook is a client hook. The built output carries a `"use client"` banner. In React Server Component frameworks you import from this package inside client components with no extra ceremony. Importing from a server component fails with the framework's own boundary error. Passing `auth: null` during initialisation is always safe: state hooks report signed-out/loading, and actions fail cleanly with `{ success: false, error, code, cause }`.

## Works with

Plain React hooks with no framework imports, so they run anywhere React runs. That covers Next.js (App or Pages Router), Remix / React Router, Gatsby, TanStack Start, Waku, plain Vite/CRA SPAs, and Astro's React islands.

**React Native / Expo** (with the Firebase **web** SDK): the email/password, anonymous, custom-token, logout, password, email, profile, reauthentication, and linking hooks work as-is. Web-only by nature: `useOAuthSignIn` (popup/redirect are browser concepts), `usePhoneSignIn` (reCAPTCHA needs the DOM), and `useEmailLinkSignIn`'s email persistence (uses `localStorage`; a pluggable storage option is planned). The `react-native-firebase` native SDK is a different import surface and is not supported.

Not in Auth yet: multi-factor auth (TOTP/SMS enrolment and resolution) and multi-tenancy — planned for a later minor. The Admin SDK is server-side and out of scope.

## Contributing

Bug reports and PRs welcome — see [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](LICENSE)
