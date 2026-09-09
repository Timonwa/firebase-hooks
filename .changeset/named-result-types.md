---
"@timonwa/firebase-hooks": minor
---

Every hook now exports the type it returns as `Use<Name>Result` — `UseLoginResult`, `UseSignupResult`, `UseVerifyEmailResult`, and so on, from `@timonwa/firebase-hooks/auth`. A wrapper can state its return type instead of re-deriving it with `ReturnType<typeof useLogin>`.

```tsx
import {
  useLogin,
  type UseLoginOptions,
  type UseLoginResult,
} from "@timonwa/firebase-hooks/auth";

export function useAppLogin(options?: UseLoginOptions): UseLoginResult {
  return useLogin(options);
}
```

Same shape as TanStack Query's `UseQueryResult` / `UseMutationResult`. `useAuth` already returned the named `UseAuthResult`.
