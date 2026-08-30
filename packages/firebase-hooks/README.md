# @timonwa/firebase-hooks

Typed React hooks for Firebase — one hook per flow, with its state, errors, and callbacks handled.

```bash
npm install @timonwa/firebase-hooks firebase
```

Requires React 18 or 19 and Firebase 11 or 12, both peer dependencies.

```tsx
import { useLogin } from "@timonwa/firebase-hooks/auth";

const { login, loading, error } = useLogin(auth, {
  onIdToken: (idToken) => createSession(idToken), // mint your server session here
});

const result = await login(email, password);
if (result.success) router.push("/dashboard");
```

Every action resolves to a result you branch on — `{ success: true, … }` or `{ success: false, error, code, cause }` — and never throws.

## Documentation

- **[Full README](https://github.com/Timonwa/firebase-hooks#readme)** — why it exists, the shared contract, error handling, and SSR
- **[Docs site](https://github.com/Timonwa/firebase-hooks/tree/main/apps/docs/content/docs)** — a page per hook, with options and examples
- **[Contributing](https://github.com/Timonwa/firebase-hooks/blob/main/CONTRIBUTING.md)**

## License

[MIT](LICENSE)
