---
"@timonwa/firebase-hooks": minor
---

Two result types are no longer module-private:

- `CompleteSignInResult` — what `useEmailLinkSignIn`'s `completeSignIn` resolves to, so a callback page can annotate the function that handles it
- `VerifyEmailStatus` — `useVerifyEmail`'s status, instead of re-declaring the three states in app code

Both ship from `@timonwa/firebase-hooks/auth`.

The status vocabulary is also now shared. `AsyncStatus` (`"processing" | "success" | "failed"`) ships from the root entry, and `VerifyEmailStatus` is an alias of it, so hooks that act on mount report the same three states rather than each spelling them differently. There is no idle state: the work starts before a render, which is why `processing` is the initial value.
