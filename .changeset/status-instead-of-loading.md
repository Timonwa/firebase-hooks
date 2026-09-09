---
"@timonwa/firebase-hooks": minor
---

**Breaking: every action hook reports `status` with derived booleans, replacing `loading`, `success` and `resetState`.**

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
