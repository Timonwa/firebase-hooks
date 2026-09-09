---
"@timonwa/firebase-hooks": minor
---

`useSendPasswordResetEmail` and `useSendEmailVerification` gain a `sendEmail` option, matching `useEmailLinkSignIn`'s `sendLink`. Both hooks previously sent from the browser with no way to delegate, which put an email-sending path outside an app's own rate limiter — awkward when the same app already rate-limits the sign-in link server-side.

```tsx
const { send } = useSendPasswordResetEmail({
  sendEmail: ({ email, actionCodeSettings }) =>
    requestPasswordReset(email, actionCodeSettings),
});
```

The hook keeps its own bookkeeping either way: `status`, `isPending`, `isSuccess`, `error` and `reset` behave identically, and a throwing sender surfaces as an ordinary failure result. The sender receives `{ email, actionCodeSettings }` — the same inputs Firebase's client send takes and the Admin SDK's `generate*Link` wants, so a provider-level `actionCodeSettings` still reaches your server. On `useSendEmailVerification`, `email` is the signed-in user's address, since `send()` takes no arguments; an account without one fails clearly rather than calling your sender with nothing.
