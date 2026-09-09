---
"@timonwa/firebase-hooks": minor
---

Every type needed to write a wrapper around a hook is now reachable from `@timonwa/firebase-hooks/auth`:

- all 13 `Use*Options` interfaces, so a wrapper can accept and forward a hook's options without restating them
- `AuthProviderProps` and `UseAuthResult` (what `useAuth` returns), for an app provider layered over this one

```tsx
import { useLogin, type UseLoginOptions } from "@timonwa/firebase-hooks/auth";

export function useAppLogin(options?: UseLoginOptions) {
  return useLogin(options);
}
```

`HookResult`, `HookErrorOptions` and `HookErrorContext` are unchanged and still ship from the root entry — every service returns them, so they keep one home rather than being re-exported per service.
