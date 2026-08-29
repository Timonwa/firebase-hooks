# Contributing

Bug reports, fixes, and new hooks are all welcome. For anything bigger than a small fix, open an issue first so we can agree on the shape before you write it.

## Setup

You need Node 20+ and pnpm (run `corepack enable` to get the version the repo pins). Then install and run the full quality gate:

```bash
pnpm install
pnpm verify   # typecheck, lint, test, build, publint, attw — the same gate CI runs
```

## What gets accepted

- **Firebase Auth client-SDK flows any React app can use.** Nothing tied to a product or a framework (no `next/*` imports). `firebase` and `react` stay peer dependencies; the Admin SDK is server-side and out of scope.
- **Server integration through optional callbacks only** (`onIdToken`, `onBeforeSignOut`, …) — never a required action protocol or a result envelope a consumer must implement. Throwing inside a callback aborts the flow.
- **Nothing hard-coded.** Storage keys, `actionCodeSettings`, and error wording are parameters with sensible defaults.
- **Client hooks only.** This package is client-side by design; everything ships behind a `"use client"` banner.

## Adding a hook

- **One file per hook**, kebab-cased after it, flat in `src/` — `src/use-login.ts`. Start the file with a `"use client"` directive and a JSDoc block; the JSDoc is what editors show, so keep it agreeing with the README. Shared internals live in `src/_shared.ts` and never reach the barrel (only its public types do).
- **Follow the shared contract.** `auth: Auth | null` first argument; actions resolve to `AuthResult` and never throw (`useAuthTask` gives you the skeleton); sensitive operations reauthenticate first.
- **Export it explicitly** from `src/index.ts`, one line per file, alphabetical.
- **Document it in `README.md` in the same change** — the README is the only documentation. Add the hook to its group's table and give it a section (signature, options with defaults, example), alphabetical within the group.
- **Tests go through the barrel** (`import { … } from "./index.js"`) and mock `firebase/auth` — what's under test is the hook's orchestration (ordering, callbacks, error paths), not Firebase. Cover the edges: the null `auth`, the throwing callback, the signed-out user.

## Submitting a change

1. Fork the repo and create a branch from `main`.
2. Make your change and run `pnpm verify` — a green run locally means a green PR.
3. Add a changeset for anything that affects the published package:

   ```bash
   pnpm changeset
   ```

   Pick the bump — patch for a fix, minor for a new hook or option, major for a breaking change — and describe it in a sentence a consumer would understand.

4. Open a pull request against `main` describing what changed and why.

## What happens after your PR merges

Your changeset joins a "Version Packages" PR that changesets keeps open on `main`; when that PR merges, every pending change publishes to npm in one release. So your change ships with the next version merge rather than the moment your PR lands — and none of it needs credentials or npm access from you.
