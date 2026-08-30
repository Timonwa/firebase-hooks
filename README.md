# firebase-hooks

Monorepo for **[@timonwa/firebase-hooks](packages/firebase-hooks)** — typed React hooks for Firebase, one hook per flow, with its state, errors, and callbacks handled.

```bash
npm install @timonwa/firebase-hooks firebase
```

Full usage, the hook reference, and the error model live in the [package README](packages/firebase-hooks/README.md).

## Workspaces

| Path | What it is |
| --- | --- |
| [`packages/firebase-hooks`](packages/firebase-hooks) | The published package — `@timonwa/firebase-hooks` |

## Setup

Node 20+ and pnpm (`corepack enable` picks up the pinned version).

```bash
pnpm install
pnpm verify   # typecheck, lint, test, build, publint, attw — the gate CI runs
```

Every root script delegates to the package, so `pnpm test` and `pnpm build` work from here.

## Contributing

Bug reports and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
