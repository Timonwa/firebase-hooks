---
"@timonwa/firebase-hooks": minor
---

`useSendPasswordResetEmail` and `useSendEmailVerification` gain a `sendEmail` option, matching `useEmailLinkSignIn`'s `sendLink`. Both hooks previously sent from the browser with no way to delegate, which put an email-sending path outside an app's own rate limiter — awkward when the same app already rate-limits the sign-in link server-side.

```tsx
const { send } = useSendPasswordResetEmail({
  sendEmail: (email) => requestPasswordReset(email), // your rate-limited endpoint
});
```

The hook keeps its own bookkeeping either way: `loading`, `error`, `success` and `resetState` behave identically, and a throwing sender surfaces as an ordinary failure result. On `useSendEmailVerification` the sender receives the signed-in user's address, since `send()` takes no arguments; an account without one fails clearly rather than calling your sender with nothing.
