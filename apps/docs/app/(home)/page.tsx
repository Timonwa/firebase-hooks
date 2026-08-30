import Link from 'next/link';
import { appName, npmUrl, packageVersion } from '@/lib/shared';

const HIGHLIGHTS = [
  {
    title: 'Whole flows, not single calls',
    body: 'usePhoneSignIn manages the reCAPTCHA verifier. useOAuthSignIn finishes a redirect when the page returns. useEmailLinkSignIn asks for the address instead of calling window.prompt.',
  },
  {
    title: 'Server sessions built in',
    body: 'onIdToken hands you a fresh ID token after every sign-in. onBeforeSignOut runs before Firebase clears the session, so a failed teardown leaves the user signed in.',
  },
  {
    title: 'Failures are values',
    body: 'Actions never throw. A failure carries Firebase’s own code and the original error, so you branch on a result instead of wrapping calls in try/catch.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-20 pb-16 sm:pt-28">
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
            v{packageVersion} · Auth available
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Typed React hooks for Firebase, one hook per flow
          </h1>
          <p className="max-w-2xl text-lg text-pretty text-fd-muted-foreground">
            Each hook runs a whole flow end to end and holds its own loading, error, and
            success state. Zero dependencies — <code>firebase</code> and <code>react</code>{' '}
            stay peers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/docs"
            className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Read the docs
          </Link>
          <Link
            href="/docs/getting-started"
            className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Getting started
          </Link>
          <a
            href={npmUrl}
            rel="noreferrer noopener"
            className="px-2 py-2.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            {appName} ↗
          </a>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-xl border border-fd-border bg-fd-card p-5 text-sm">
          <code className="font-mono">
            <span className="text-fd-muted-foreground">
              {'// mint your server session in the same call'}
            </span>
            {'\n'}
            {'const { login, loading, error } = '}
            <span className="text-fd-primary">useLogin</span>
            {'(auth, {\n  onIdToken: (idToken) => createSession(idToken),\n});'}
          </code>
        </pre>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-fd-border bg-fd-card p-5"
          >
            <h2 className="mb-2 text-sm font-semibold">{item.title}</h2>
            <p className="text-sm text-pretty text-fd-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
