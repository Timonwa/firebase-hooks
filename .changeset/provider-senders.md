---
"@timonwa/firebase-hooks": minor
---

`AuthProvider` gains `senders`, so an app that emails links from its own API configures that once instead of at every call site:

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
