# @timonwa/firebase-hooks

Typed React hooks for every Firebase Auth client flow — email/password, OAuth, email link, phone, anonymous, and custom-token sign-in; password, email, profile, and provider-linking management. Your server session integrates through optional callbacks, so the hooks work for any backend or none. Zero dependencies — `firebase` and `react` are peers.

[![npm](https://img.shields.io/npm/v/@timonwa/firebase-hooks)](https://www.npmjs.com/package/@timonwa/firebase-hooks)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-timonwa-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/timonwa)

Ships ESM and CJS with type declarations and a `"use client"` banner, so React Server Component frameworks (Next.js App Router, etc.) get a clear client-boundary error instead of a cryptic hooks crash.

## Quickstart

```bash
npm install @timonwa/firebase-hooks firebase
# or: pnpm add @timonwa/firebase-hooks firebase · yarn add @timonwa/firebase-hooks firebase
```

Requires React 18 or 19 and Firebase 11 or 12 (both peer dependencies).

```tsx
import { useLogin } from "@timonwa/firebase-hooks";
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

## How every hook works

The same contract everywhere, so learning one hook is learning them all:

- **`auth` is the first argument** — your Firebase `Auth` instance, or `null` while it initialises. No global, no hidden singleton; calling an action before `auth` exists fails cleanly with `{ success: false, error }`.
- **Actions never throw.** Every action resolves to `AuthResult`: `{ success: true, ...data }` or `{ success: false, error, code, cause }` — and the hook's `error` state carries the same message for rendering.
- **`onIdToken` is where your server session plugs in.** After a successful sign-in the hook fetches a fresh ID token and calls `onIdToken(idToken, user)` — exchange it for a session cookie there. Throw inside the callback to abort the whole flow; the error surfaces like any other. Set it **once on `AuthProvider`** and every sign-in hook inherits it; a hook's own option overrides the global, and an explicit `null` opts a single flow out. No backend? Omit it everywhere.
- **Raw is never gated behind our processing.** Failures carry three layers: `error` (the message — raw by default, formatted only if you opt in), `code` (Firebase's raw error code, e.g. `"auth/invalid-credential"`), and `cause` (the complete untouched error object). If a formatter is ever wrong — or throws — `code` and `cause` still hold everything Firebase said. See [Error handling](#error-handling).
- **Sensitive operations reauthenticate first.** Pass `currentPassword` to `useUpdatePassword`, `useUpdateEmail`, or `useDeleteAccount` and they run Firebase's required recent-sign-in check internally; omit it and the operation runs directly — `useReauthenticate` exposes the same dance for custom flows.
- **App-wide policies live once on `AuthProvider`.** `onIdToken`, `onBeforeSignOut`, `actionCodeSettings`, and `formatErrorMessage` can all be set globally; hooks inherit them, a hook's own option overrides, and `null` opts out per flow:

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
// A failed action, in full:
{ success: false,
  error: string,        // processed message — raw by default
  code: string | null,  // Firebase's raw code: "auth/invalid-credential"
  cause: unknown }      // the complete untouched error

getFirebaseErrorCode(error: unknown): string | null
formatFirebaseError(error, options?: { messages?: Record<string, string>; fallback?: string }): string
AUTH_ERROR_MESSAGES: Record<string, string>
```

With no configuration, `error` is the raw error's own message — nothing is reworded for you. Formatting is opt-in via `formatFirebaseError`, which resolves in strict order: a match in `messages` wins; an unmapped Firebase error keeps Firebase's own words with the framing stripped (`"Firebase: The email address is badly formatted. (auth/invalid-email)."` → `"The email address is badly formatted."`); any other error passes through raw. It never unwraps HTTP envelopes — an error thrown from your own `onIdToken`/`onBefore*` callback is yours and arrives untouched.

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

A formatter that throws falls back to the raw message — formatting can never lose the error. Future service catalogues ship with their own subpath (`FIRESTORE_ERROR_MESSAGES` with the Firestore hooks, `STORAGE_ERROR_MESSAGES` with Storage).

## Provider and state

| Export | What it does |
| --- | --- |
| [`AuthProvider` / `useAuth`](#authprovider--useauth) | Live Firebase user + custom claims for the whole tree |

### AuthProvider / useAuth

```ts
AuthProvider(props: {
  auth: Auth | null;
  onIdToken?: OnIdToken;                        // every sign-in hook inherits it
  onBeforeSignOut?: () => void | Promise<void>; // useLogout inherits it
  actionCodeSettings?: ActionCodeSettings;      // every emailed link inherits it
  formatErrorMessage?: (error: unknown) => string;
  children: ReactNode;
})
useAuth(): { firebaseUser: User | null; claims: Record<string, unknown> | null; isAuthenticated: boolean; isLoading: boolean }
```

Subscribes to `onIdTokenChanged`, so `firebaseUser` and `claims` update on sign-in, sign-out, **and token refreshes** — custom-claim changes (roles) propagate without a reload. `isLoading` is true only until the first callback, so you can distinguish "signed out" from "not yet known". The provider is also the home of app-wide defaults — `onIdToken`, `onBeforeSignOut`, `actionCodeSettings`, `formatErrorMessage` — inherited by every hook below it (hook option overrides; explicit `null` opts a flow out); hooks keep working with no provider at all. Server-fetched user records are an app concern: layer them in your own provider on top of this one.

```tsx
<AuthProvider auth={auth}>{children}</AuthProvider>;

const { firebaseUser, claims, isAuthenticated, isLoading } = useAuth();
if (claims?.isAdmin) showAdminNav();
```

## Signing in and out

| Hook | What it does |
| --- | --- |
| [`useAnonymousSignIn`](#useanonymoussignin) | Guest sessions, upgradeable later via linking |
| [`useCustomTokenSignIn`](#usecustomtokensignin) | Sign in with a server-minted custom token |
| [`useEmailLinkSignIn`](#useemaillinksignin) | Passwordless magic-link sign-in, no `window.prompt` |
| [`useLogin`](#uselogin) | Email/password sign-in |
| [`useLogout`](#uselogout) | Sign-out, server session cleared first |
| [`useOAuthSignIn`](#useoauthsignin) | Google, Apple, GitHub, or any provider — popup or redirect |
| [`usePhoneSignIn`](#usephonesignin) | SMS code sign-in with managed reCAPTCHA |
| [`useSignup`](#usesignup) | Email/password signup with profile + verification email |

### useAnonymousSignIn

```ts
useAnonymousSignIn(auth, options?: { onIdToken?; formatErrorMessage? }):
  { signIn: () => Promise<AuthResult<{ user: User; credential: UserCredential }>>; loading; error }
```

Anonymous (guest) sign-in. The resulting user is upgradeable to a real account later without losing data — pair with [`useLinkProvider`](#uselinkprovider).

```tsx
const { signIn } = useAnonymousSignIn(auth);
<button onClick={signIn}>Continue as guest</button>;
```

### useCustomTokenSignIn

```ts
useCustomTokenSignIn(auth, options?: { onIdToken?; formatErrorMessage? }):
  { signIn: (customToken: string) => Promise<AuthResult<{ user: User; credential: UserCredential }>>; loading; error }
```

Sign-in with a server-minted custom token (Admin SDK `createCustomToken`) — for bridging your own auth system into Firebase.

```tsx
const { signIn } = useCustomTokenSignIn(auth);
const { token } = await fetchCustomTokenFromYourApi();
await signIn(token);
```

### useEmailLinkSignIn

```ts
useEmailLinkSignIn(auth, options?: {
  actionCodeSettings?: ActionCodeSettings; // required (here or on the provider) when the hook sends the link itself
  storageKey?: string;                     // default: "emailForSignIn"
  sendLink?: (email: string) => Promise<void>; // replace the sender (e.g. your API emails the link)
  onIdToken?; formatErrorMessage?;
}): { sendLink; completeSignIn; loading; error }
```

Passwordless (magic link) sign-in. `sendLink(email)` emails the link and remembers the address in localStorage; `completeSignIn(url, email?)` runs on the callback page. When the address isn't in storage (link opened on another device), the result carries `needsEmail: true` — render your own email-confirm input and call `completeSignIn` again with the address; there is no `window.prompt`.

```tsx
// Request page
const { sendLink } = useEmailLinkSignIn(auth, {
  actionCodeSettings: { url: `${origin}/auth/callback`, handleCodeInApp: true },
});
await sendLink(email);

// Callback page
const { completeSignIn } = useEmailLinkSignIn(auth, { onIdToken: createSession });
const result = await completeSignIn(window.location.href);
if (!result.success && result.needsEmail) showEmailConfirmField();
```

### useLogin

```ts
useLogin(auth, options?: { onIdToken?; formatErrorMessage? }):
  { login: (email: string, password: string) => Promise<AuthResult<{ user: User; credential: UserCredential }>>; loading; error }
```

Email/password sign-in. Signs in with Firebase, then hands the fresh ID token to `onIdToken` — mint your server session there; throwing inside it aborts the flow.

```tsx
const { login, loading, error } = useLogin(auth, { onIdToken: createSession });
const result = await login(email, password);
if (result.success) router.push("/dashboard");
```

### useLogout

```ts
useLogout(auth, options?: { onBeforeSignOut?: () => void | Promise<void>; formatErrorMessage? }):
  { logout: () => Promise<AuthResult>; loading; error }
```

Sign-out. `onBeforeSignOut` runs **first** — clear your server session there. The order is deliberate: if the server call throws, the Firebase session is preserved so the user can retry, instead of being half signed out.

```tsx
const { logout, loading } = useLogout(auth, { onBeforeSignOut: clearSession });
<button onClick={logout} disabled={loading}>Sign out</button>;
```

### useOAuthSignIn

```ts
useOAuthSignIn(auth, options?: { onIdToken?; formatErrorMessage? }):
  { signIn: (provider: AuthProvider, opts?: { method?: "popup" | "redirect" }) => Promise<AuthResult<{ user: User | null; credential: UserCredential | null }>>; loading; error }
```

OAuth sign-in with any provider — Google, Apple, GitHub, Facebook, Microsoft, X, or a custom `OAuthProvider`. Defaults to the popup flow; pass `method: "redirect"` for environments that block popups (in-app browsers). The hook also completes a pending redirect on mount (`getRedirectResult`), running the same `onIdToken`, so one hook covers both halves of the redirect round-trip.

```tsx
import { GoogleAuthProvider } from "firebase/auth";

const { signIn, loading, error } = useOAuthSignIn(auth, { onIdToken: createSession });
<button onClick={() => signIn(new GoogleAuthProvider())}>Continue with Google</button>;
```

### usePhoneSignIn

```ts
usePhoneSignIn(auth, options?: { recaptchaSize?: "invisible" | "normal"; onIdToken?; formatErrorMessage? }): {
  sendCode: (phoneNumber: string, recaptchaContainer: string | HTMLElement) => Promise<AuthResult>;
  confirmCode: (code: string) => Promise<AuthResult<{ user: User; credential: UserCredential }>>;
  codeSent: boolean; loading; error;
}
```

Phone-number sign-in in two steps: `sendCode` verifies the caller via reCAPTCHA and texts the SMS code; `confirmCode` completes sign-in. The reCAPTCHA verifier is created and cleaned up for you — pass the id (or element) of an empty container node, and choose `recaptchaSize: "invisible"` (the default) or `"normal"` for the visible widget.

```tsx
const { sendCode, confirmCode, codeSent } = usePhoneSignIn(auth, { onIdToken: createSession });
<div id="recaptcha-container" />;
await sendCode("+2348012345678", "recaptcha-container");
// after the user types the SMS code:
const result = await confirmCode(smsCode);
```

### useSignup

```ts
useSignup(auth, options?: { sendVerificationEmail?: boolean /* default: true */; onIdToken?; formatErrorMessage? }):
  { signup: (email, password, profile?: { displayName?; photoURL? }) => Promise<AuthResult<{ user: User; credential: UserCredential }>>; loading; error }
```

Email/password signup — the standard client-side flow: create the account, set the optional profile, send the verification email (on by default), then run `onIdToken`. Server-first signups (your API creates the record, the client signs in after) compose [`useLogin`](#uselogin) instead.

```tsx
const { signup, loading, error } = useSignup(auth, { onIdToken: createSession });
const result = await signup(email, password, { displayName: fullName });
if (result.success) router.push("/verify-email");
```

## Password flows

| Hook | What it does |
| --- | --- |
| [`useConfirmPasswordReset`](#useconfirmpasswordreset) | Complete a reset from the emailed `oobCode` |
| [`useSendPasswordResetEmail`](#usesendpasswordresetemail) | The "forgot password" email |
| [`useUpdatePassword`](#useupdatepassword) | Change password, reauthentication built in |

### useConfirmPasswordReset

```ts
useConfirmPasswordReset(auth, options?): {
  confirm: (oobCode: string, newPassword: string) => Promise<AuthResult>;
  verifyCode: (oobCode: string) => Promise<AuthResult<{ email: string }>>;
  loading; error; success; resetState;
}
```

Completes a password reset with the `oobCode` from the reset email. `verifyCode` optionally checks the code first and returns the account email, so the page can show whose password is being reset before asking for the new one.

```tsx
const { confirm, verifyCode, success, error } = useConfirmPasswordReset(auth);
const check = await verifyCode(oobCode); // { success: true, email: "a@b.c" }
await confirm(oobCode, newPassword);
```

### useSendPasswordResetEmail

```ts
useSendPasswordResetEmail(auth, options?: { actionCodeSettings?; formatErrorMessage? }):
  { send: (email: string) => Promise<AuthResult>; loading; error; success; resetState }
```

The "forgot password" flow: sends Firebase's password-reset email. `success` flips true after a send; `resetState` clears both flags for retry-with-a-different-address forms.

```tsx
const { send, loading, success } = useSendPasswordResetEmail(auth);
await send(email);
{success && <p>If an account exists for {email}, a reset link is on its way.</p>}
```

### useUpdatePassword

```ts
useUpdatePassword(auth, options?): {
  update: (args: { newPassword: string; currentPassword?: string }) => Promise<AuthResult>;
  loading; error; success;
}
```

Changes the signed-in user's password. Pass `currentPassword` and the hook reauthenticates automatically first (Firebase rejects sensitive operations on stale sessions); omit it and the change runs directly — a stale session then surfaces `auth/requires-recent-login` through `code`/`cause` for your own policy (e.g. [`useReauthenticate`](#usereauthenticate)).

```tsx
const { update, loading, error, success } = useUpdatePassword(auth);
await update({ newPassword, currentPassword }); // reauthenticates first
await update({ newPassword });                  // no reauth — your call
```

## Email flows

| Hook | What it does |
| --- | --- |
| [`useSendEmailVerification`](#usesendemailverification) | The "resend verification email" button |
| [`useUpdateEmail`](#useupdateemail) | Change email via verify-before-update, reauth built in |
| [`useVerifyEmail`](#useverifyemail) | Apply the emailed verification code on mount |

### useSendEmailVerification

```ts
useSendEmailVerification(auth, options?: { actionCodeSettings?; formatErrorMessage? }):
  { send: () => Promise<AuthResult>; loading; error; success }
```

Sends (or re-sends) the verification email to the signed-in user. Pair with a cooldown (e.g. [react-hooks](https://www.npmjs.com/package/@timonwa/react-hooks)' `useCountdown`) to stop rapid re-sends.

```tsx
const { send, loading, success } = useSendEmailVerification(auth);
<button onClick={send} disabled={loading}>Resend verification email</button>;
```

### useUpdateEmail

```ts
useUpdateEmail(auth, options?: { actionCodeSettings?; formatErrorMessage? }):
  { update: (args: { newEmail: string; currentPassword?: string }) => Promise<AuthResult>; loading; error; success }
```

Changes the signed-in user's email via `verifyBeforeUpdateEmail`: Firebase mails a verification link to the **new** address and the change only lands when it's clicked — so `success` means "verification email sent", not "email changed". Pass `currentPassword` for automatic reauthentication; omit it (OAuth-only accounts have no password) and handle a stale session via [`useReauthenticate`](#usereauthenticate).

```tsx
const { update, success } = useUpdateEmail(auth);
await update({ newEmail, currentPassword }); // password account
await update({ newEmail });                  // OAuth account
{success && <p>Check {newEmail} to confirm the change.</p>}
```

### useVerifyEmail

```ts
useVerifyEmail(auth, oobCode: string | null, options?: { onVerified?: (user: User | null) => void | Promise<void>; formatErrorMessage? }):
  { status: "processing" | "success" | "failed"; error: string | null }
```

Applies an email-verification `oobCode` on mount and reports a status the page renders from. Guarded against React Strict Mode's double effect (the code is single-use). After verifying, the current user is reloaded and the token refreshed so `emailVerified` propagates, then `onVerified` runs — refresh your server session there.

```tsx
const { status, error } = useVerifyEmail(auth, searchParams.get("oobCode"), { onVerified: refreshSession });
if (status === "processing") return <Spinner />;
if (status === "failed") return <ErrorState message={error} />;
return <SuccessState />;
```

## Account, profile, and linking

| Hook | What it does |
| --- | --- |
| [`useDeleteAccount`](#usedeleteaccount) | Delete the account, with reauth and server cleanup |
| [`useLinkProvider`](#uselinkprovider) | Add a sign-in method (upgrade a guest account) |
| [`useReauthenticate`](#usereauthenticate) | The recent-sign-in check, standalone |
| [`useUnlinkProvider`](#useunlinkprovider) | Remove a sign-in method |
| [`useUpdateProfile`](#useupdateprofile) | Display name and photo URL |

### useDeleteAccount

```ts
useDeleteAccount(auth, options?: { onBeforeDelete?: (user: User) => void | Promise<void>; formatErrorMessage? }):
  { deleteAccount: (args?: { currentPassword?: string }) => Promise<AuthResult>; loading; error }
```

Deletes the signed-in user's account. Pass `currentPassword` for automatic reauthentication (deletion requires a recent sign-in); omit it — OAuth-only accounts, or your own reauth policy via [`useReauthenticate`](#usereauthenticate). `onBeforeDelete` runs while the user is still authenticated — clean up server-side data there; throwing aborts the deletion.

```tsx
const { deleteAccount, loading, error } = useDeleteAccount(auth, {
  onBeforeDelete: (user) => deleteUserRecord(user.uid),
});
const result = await deleteAccount({ currentPassword });
if (result.success) router.push("/goodbye");
```

### useLinkProvider

```ts
useLinkProvider(auth, options?): {
  linkWithProvider: (provider: AuthProvider) => Promise<AuthResult<{ user: User; credential: UserCredential }>>;
  linkWithPassword: (email: string, password: string) => Promise<AuthResult<{ user: User; credential: UserCredential }>>;
  loading; error;
}
```

Adds a sign-in method to the current user — an OAuth provider via popup, or an email/password credential. The classic use is upgrading an anonymous guest to a real account without losing their data.

```tsx
const { linkWithProvider, linkWithPassword } = useLinkProvider(auth);
await linkWithProvider(new GoogleAuthProvider()); // guest -> Google account
await linkWithPassword(email, password);          // guest -> email/password account
```

### useReauthenticate

```ts
useReauthenticate(auth, options?): {
  reauthenticateWithPassword: (currentPassword: string) => Promise<AuthResult>;
  reauthenticateWithProvider: (provider: AuthProvider) => Promise<AuthResult>;
  loading; error;
}
```

Reauthentication on its own — for custom sensitive flows beyond what `useUpdatePassword` / `useUpdateEmail` / `useDeleteAccount` build in. Firebase rejects sensitive operations when the sign-in is stale (`auth/requires-recent-login`); run one of these first, then retry.

```tsx
const { reauthenticateWithPassword } = useReauthenticate(auth);
const check = await reauthenticateWithPassword(currentPassword);
if (check.success) await performSensitiveOperation();
```

### useUnlinkProvider

```ts
useUnlinkProvider(auth, options?):
  { unlinkProvider: (providerId: string) => Promise<AuthResult<{ user: User; credential: UserCredential }>>; loading; error }
```

Removes a sign-in method from the current user by provider id (`"google.com"`, `"password"`, `"github.com"`, …). Firebase refuses to unlink the last remaining method, so the account can't be locked out this way.

```tsx
const { unlinkProvider } = useUnlinkProvider(auth);
await unlinkProvider("google.com");
```

### useUpdateProfile

```ts
useUpdateProfile(auth, options?):
  { update: (profile: { displayName?: string | null; photoURL?: string | null }) => Promise<AuthResult>; loading; error; success }
```

Updates the signed-in user's display name and/or photo URL. No reauthentication needed — Firebase treats profile fields as non-sensitive.

```tsx
const { update, loading } = useUpdateProfile(auth);
await update({ displayName: fullName, photoURL: avatarUrl });
```

## SSR and server components

Every hook is a client hook. The built output carries a `"use client"` banner, so in React Server Component frameworks you import from this package inside client components with no extra ceremony — and importing from a server component fails with the framework's clear boundary error rather than a runtime crash. Passing `auth: null` during initialisation is always safe: state hooks report signed-out/loading, and actions fail cleanly with `{ success: false, error, code, cause }`.

## Works with

Plain React hooks, no framework imports — they run anywhere React runs: Next.js (App or Pages Router), Remix / React Router, Gatsby, TanStack Start, Waku, plain Vite/CRA SPAs, and Astro's React islands.

**React Native / Expo** (with the Firebase **web** SDK): the email/password, anonymous, custom-token, logout, password, email, profile, reauthentication, and linking hooks work as-is. Web-only by nature: `useOAuthSignIn` (popup/redirect are browser concepts), `usePhoneSignIn` (reCAPTCHA needs the DOM), and `useEmailLinkSignIn`'s email persistence (uses `localStorage`; a pluggable storage option is planned). The `react-native-firebase` native SDK is a different import surface and is not supported.

Not covered (yet): multi-factor auth (TOTP/SMS enrolment and resolution) and multi-tenancy — planned for a later minor. The Admin SDK is server-side and out of scope.

## Contributing

Bug reports and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
