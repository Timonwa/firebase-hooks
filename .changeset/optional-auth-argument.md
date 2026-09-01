---
"@timonwa/firebase-hooks": minor
---

The `auth` argument is now optional. Below an `AuthProvider`, hooks take the instance from it, so an app no longer names the same object at every call site:

```tsx
const { login } = useLogin();
const { signup } = useSignup({ sendVerificationEmail: false });
```

Passing your own still works and overrides the provider's — what you need for a second Firebase project, or with no provider at all. `null` keeps its existing meaning of "not ready yet, don't run", so a hook held back while Firebase initialises never silently runs against the provider's instance instead.

Nothing changes for existing code: every `useLogin(auth, options)` call keeps working exactly as before.
