---
"@timonwa/firebase-hooks": minor
---

**Breaking: `useVerifyEmail`'s `status` uses the standard async vocabulary.** `"processing"` is now `"pending"` and `"failed"` is now `"error"`, matching TanStack Query's `QueryStatus` rather than spelling the same three states differently.

```tsx
- if (status === 'processing') return <Spinner />;
- if (status === 'failed') return <ErrorState message={error} />;
+ if (status === 'pending') return <Spinner />;
+ if (status === 'error') return <ErrorState message={error} />;
```

**Breaking: `useEmailLinkSignIn`'s `sendLink` option is now `sendEmail`.** All three emailed-link hooks take the same option name. The returned `sendLink` function is unchanged.

```tsx
-useEmailLinkSignIn({ sendLink: (email) => api.send(email) });
+useEmailLinkSignIn({ sendEmail: (email) => api.send(email) });
```
