---
"@timonwa/firebase-hooks": minor
---

**The `auth` argument is now optional.** Below an `AuthProvider`, hooks take the instance from it, so an app no longer names the same object at every call site:

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
