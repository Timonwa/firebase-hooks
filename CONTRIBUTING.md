# Contributing

Bug reports, fixes, and new hooks are all welcome. For anything bigger than a small fix, open an issue first so we can agree on the shape before you write it.

## Setup

You need Node 20+ and pnpm (run `corepack enable` to get the version the repo pins). Then install and run the full quality gate:

```bash
pnpm install
pnpm verify   # typecheck, lint, test, build, publint, attw — the same gate CI runs
```

This is a pnpm workspace. The published package lives in `packages/firebase-hooks/`, and every root script delegates to it, so `pnpm test` and `pnpm build` work from the repo root. **Paths below are relative to `packages/firebase-hooks/`.**

## What gets accepted

- **Firebase client-SDK flows any React app can use.** The Services table in the README tracks what's live and what's next; a new service starts as its own folder and subpath entry. Nothing tied to a product or a framework (no `next/*` imports). `firebase` and `react` stay peer dependencies; the Admin SDK is server-side and out of scope.
- **Server integration through optional callbacks only** (`onIdToken`, `onBeforeSignOut`, …) — never a required action protocol or a result envelope a consumer must implement. Throwing inside a callback aborts the flow.
- **Nothing hard-coded.** Storage keys, `actionCodeSettings`, and error wording are parameters with sensible defaults.
- **Client hooks only.** This package is client-side by design; everything ships behind a `"use client"` banner.

## Adding a hook

- **One folder per service** (`src/core/`, `src/auth/`, later `src/firestore/`, `src/storage/`), each with its own `index.ts` entry barrel. **One file per hook**, kebab-cased after it — `src/auth/use-login.ts`. Start the file with a `"use client"` directive and a JSDoc block; the JSDoc is what editors show, so keep it agreeing with the README. Internals a service shares live in that folder's `_shared.ts` and never reach the barrel.
- **Follow the shared contract.** `auth: Auth | null` first argument; actions resolve to `HookResult` and never throw (`useAuthTask` gives you the skeleton); sensitive operations reauthenticate first.
- **Options go in an exported `Use<Name>OptionsProps` interface** extending `HookErrorOptions`, with a TSDoc line on every field it declares itself (and `@defaultValue` where there is one). The docs site generates its options table from that interface, so an undocumented field ships an empty cell. Exported for the generator's sake — keep it out of the barrel, so the published types don't change.
- **Export it explicitly** from its service's entry barrel (`src/auth/index.ts` for auth), one line per file, alphabetical. The root entry (`src/core/index.ts`) carries only the service-agnostic core — nothing service-specific is ever added to it; a new service gets a new folder + subpath entry.
- **Document it in the same change** — add a page under `apps/docs/content/docs/auth/` and list it in that folder's `meta.json`. Follow the shape of the existing pages: prose intro, example, `## Returns`, then `<AutoTypeTable>` for the options. The table generates from the option interface's TSDoc, so document each field there rather than hand-writing a table.
- **Add it to the playground in the same change** — a `<HookSection>` on the page for its group, and its name in that group's `hooks` array in `apps/playground/lib/hooks-map.ts` so it appears in the sidebar. See below.
- **A hook ships with its test file beside it** (`src/auth/use-login.test.tsx`), importing through that service's barrel. Shared fakes and builders live in that folder's `_test-helpers` file (never exported from the barrel); cross-cutting behaviour — the error model, formatter precedence, global config inheritance, the `onError` observer — lives in `src/auth/auth-provider.test.tsx`; the `firebase/auth` mock lives in the package's `__mocks__/` directory, activated per file with a bare `vi.mock("firebase/auth")`. What's under test is the hook's orchestration (ordering, callbacks, error paths), not Firebase. Cover the edges: the null `auth`, the throwing callback, the signed-out user.

## Running it against a real project

Unit tests mock `firebase/auth`, so they prove the orchestration and nothing about Firebase itself. `apps/playground/` is where you check the other half: a local Next app that runs every hook against a live project, one page per group, with the hook's `loading`, `error`, and resolved value shown beside each form.

It is never deployed — it exists so you can exercise a change before opening the PR. Bring your own Firebase project; `apps/playground/README.md` covers the `.env.local` values and the console settings each flow needs.

```bash
pnpm build                      # the playground resolves the library through its exports map
pnpm --filter playground dev
```

Because it imports `@timonwa/firebase-hooks` the way a consumer does, a broken export or a missing subpath entry fails here rather than after publish — which is why CI builds it on every PR. Rebuild the library after changing it; the playground reads `dist`, not `src`.

Adding a hook to it means one `<HookSection>` — pass the hook's name, a sentence on why it exists, the snippet to show, the form, and the hook's own `loading`/`error`/result straight through. Anything about running it locally goes in the playground's own README, not this file.

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
