# Hook playground

Runs every hook in [`@timonwa/firebase-hooks`](../../packages/firebase-hooks) against a live Firebase project, one page per group, with the response and hook state shown beside each form.

## Setup

Node 20+ and pnpm. From the repo root:

```bash
pnpm install
pnpm build                      # the playground imports the library through its exports map
cp apps/playground/.env.example apps/playground/.env.local
```

Fill in `.env.local` from the Firebase console — **Project settings → Your apps → SDK setup and configuration**:

| Variable                           |          |
| ---------------------------------- | -------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Required |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Required |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Required |
| `NEXT_PUBLIC_FIREBASE_APP_ID`      | Required |

Then:

```bash
pnpm --filter playground dev
```

## Firebase console setup

**Authentication → Sign-in method** — enable **Email/Password**. That covers most of the playground. Enable any other provider you want to try.

**Authentication → Templates → action URL** — set it to `http://localhost:3000/auth/action`.

Firebase's own hosted pages handle password resets and email verification by default, and work without any setup. You override the action URL when you want those flows to finish on your own pages instead. The playground has one at `/auth/action`, so overriding it here lets you watch `useVerifyEmail` and `useConfirmPasswordReset` run rather than finishing on Firebase's page.

**Sign-in method → Phone** — enable it to use `usePhoneSignIn`. Any real number works and receives an actual SMS, within the project's free daily limit.

**Test numbers** on that same screen are optional. Register a number and a code you pick, and that pair verifies without an SMS being sent — useful when running the flow repeatedly, or when you want a second number to test with. Current limit is 10 per free project.

**Settings → Authorized domains** — `localhost` is there by default, so OAuth and email links work with no change.

### Pages Firebase redirects to

Firebase emails links that come back to the app. The playground has a page for each, so every flow can be finished here.

| Link in the email  | Comes back to    | Runs                      |
| ------------------ | ---------------- | ------------------------- |
| Email sign-in link | `/auth/callback` | `useEmailLinkSignIn`      |
| Verify email       | `/auth/action`   | `useVerifyEmail`          |
| Reset password     | `/auth/action`   | `useConfirmPasswordReset` |

`/auth/callback` needs no console change — its return URL is passed in code. The other two only come here once the action URL above is set. Opening either page directly says so, since without the code Firebase puts in the URL there's nothing to act on.

## Reading a result

Each hook shows its live `loading` and `error`, then the value the action resolved to. On a failure it also renders the message three ways — Firebase's own, with the framing stripped, and through `AUTH_ERROR_MESSAGES` — all derived from `result.cause`.

**Format errors** in the sidebar sets `formatErrorMessage` on the provider. It applies to the next call; a message already on screen keeps what it resolved to.

## Scripts

| Script                               |                     |
| ------------------------------------ | ------------------- |
| `pnpm --filter playground dev`       | Dev server on :3000 |
| `pnpm --filter playground build`     | Production build    |
| `pnpm --filter playground typecheck` | `tsc --noEmit`      |
| `pnpm --filter playground lint:fix`  | Prettier            |
