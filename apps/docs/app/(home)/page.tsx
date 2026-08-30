import Link from 'next/link';
import type { ReactNode } from 'react';
import { npmUrl, packageName, packageVersion } from '@/lib/shared';

const FEATURES = [
  {
    title: 'Whole flows, not single calls',
    body: 'usePhoneSignIn builds and tears down the reCAPTCHA verifier. useOAuthSignIn finishes a redirect when the page returns. useEmailLinkSignIn asks for the address instead of calling window.prompt.',
  },
  {
    title: 'Server sessions built in',
    body: 'onIdToken hands you a fresh ID token as part of the sign-in, not after it. Throw inside it and the sign-in aborts — so nobody reaches a protected page without a server session.',
  },
  {
    title: 'Failures are values',
    body: 'Actions never throw. A failure carries Firebase’s own code and the untouched original error, so you branch on a result instead of wrapping every call in try/catch.',
  },
  {
    title: 'Nothing withheld',
    body: 'Sign-ins hand back Firebase’s raw UserCredential. Error messages stay exactly as Firebase wrote them unless you opt into formatting.',
  },
  {
    title: 'Reauthentication handled',
    body: 'Pass currentPassword to a sensitive operation and the recent-sign-in check happens first. Omit it, and auth/requires-recent-login reaches you to handle your own way.',
  },
  {
    title: 'Configure once, override anywhere',
    body: 'Session callbacks, action-code settings and error wording live on the provider. Any hook can override them, or opt out entirely with null.',
  },
];

const GROUPS = [
  {
    label: 'Signing in and out',
    hooks: [
      'useLogin',
      'useSignup',
      'useLogout',
      'useOAuthSignIn',
      'useEmailLinkSignIn',
      'usePhoneSignIn',
      'useAnonymousSignIn',
      'useCustomTokenSignIn',
    ],
  },
  {
    label: 'Passwords',
    hooks: ['useSendPasswordResetEmail', 'useConfirmPasswordReset', 'useUpdatePassword'],
  },
  {
    label: 'Email',
    hooks: ['useSendEmailVerification', 'useVerifyEmail', 'useUpdateEmail'],
  },
  {
    label: 'Account and linking',
    hooks: [
      'useUpdateProfile',
      'useDeleteAccount',
      'useReauthenticate',
      'useLinkProvider',
      'useUnlinkProvider',
    ],
  },
];

const SERVICES = [
  { name: 'Core', entry: '@timonwa/firebase-hooks', ready: true },
  { name: 'Auth', entry: '@timonwa/firebase-hooks/auth', ready: true },
  { name: 'Firestore', entry: '@timonwa/firebase-hooks/firestore', ready: false },
  { name: 'Storage', entry: '@timonwa/firebase-hooks/storage', ready: false },
  { name: 'Cloud Functions', entry: '@timonwa/firebase-hooks/functions', ready: false },
];

function Section({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto w-full max-w-5xl px-6 ${className}`}>{children}</section>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        {/* Soft accent wash behind the hero. Purely decorative, so it stays out of
            the accessibility tree and never sits above the text. */}
        <div
          aria-hidden
          className="bg-fd-primary/10 pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
        />
        <Section className="relative pt-20 pb-16 sm:pt-28">
          <div className="flex flex-col gap-5">
            <span className="border-fd-border bg-fd-card/80 text-fd-muted-foreground w-fit rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
              v{packageVersion} · Auth available · Firestore next
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Typed React hooks for Firebase, one hook per flow
            </h1>
            <p className="text-fd-muted-foreground max-w-2xl text-lg text-pretty">
              Each hook runs a whole flow end to end and holds its own loading, error and
              success state. Zero dependencies — <code>firebase</code> and{' '}
              <code>react</code> stay peers.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs/getting-started"
              className="bg-fd-primary text-fd-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/docs/auth"
              className="border-fd-border hover:bg-fd-accent rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Browse the hooks
            </Link>
            <code className="border-fd-border bg-fd-card text-fd-muted-foreground rounded-lg border px-4 py-2.5 font-mono text-sm">
              pnpm add {packageName}
            </code>
          </div>
        </Section>
      </div>

      {/* Before / after */}
      <Section className="py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">The same sign-in, twice</h2>
        <p className="text-fd-muted-foreground mt-2 max-w-2xl text-pretty">
          Email and password, with a server session minted from the ID token and errors
          surfaced to the UI.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="border-fd-border bg-fd-card overflow-hidden rounded-xl border">
            <div className="text-fd-muted-foreground border-b px-4 py-2.5 text-xs font-medium">
              Firebase directly
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
              <code className="font-mono">{`const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

async function login(email, password) {
  setLoading(true);
  setError(null);
  try {
    const cred = await signInWithEmailAndPassword(
      auth, email, password,
    );
    const idToken = await cred.user.getIdToken();
    await createSession(idToken);
    return cred;
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
}`}</code>
            </pre>
          </div>

          <div className="border-fd-primary/30 bg-fd-card overflow-hidden rounded-xl border">
            <div className="text-fd-primary border-fd-primary/30 border-b px-4 py-2.5 text-xs font-medium">
              With useLogin
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
              <code className="font-mono">{`const { login, loading, error } = useLogin(auth, {
  onIdToken: (idToken) => createSession(idToken),
});

const result = await login(email, password);
if (result.success) router.push("/dashboard");`}</code>
            </pre>
            <p className="text-fd-muted-foreground border-t px-4 py-3 text-sm text-pretty">
              And it does more: if <code>createSession</code> throws, the sign-in aborts
              rather than leaving a signed-in user with no server session.
            </p>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="border-t py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="border-fd-border bg-fd-card rounded-xl border p-5"
            >
              <h3 className="mb-2 text-sm font-semibold">{item.title}</h3>
              <p className="text-fd-muted-foreground text-sm text-pretty">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Breadth */}
      <Section className="border-t py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          Twenty hooks, one contract
        </h2>
        <p className="text-fd-muted-foreground mt-2 max-w-2xl text-pretty">
          Every Firebase Auth client flow, each following the same shape — so learning one
          is learning the rest.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-fd-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.hooks.map((hook) => (
                  <li key={hook}>
                    <Link
                      href={`/docs/auth/${hook.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`}
                      className="border-fd-border bg-fd-card hover:border-fd-primary/40 hover:text-fd-primary inline-block rounded-md border px-2.5 py-1 font-mono text-xs transition-colors"
                    >
                      {hook}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section className="border-t py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">One import per service</h2>
        <p className="text-fd-muted-foreground mt-2 max-w-2xl text-pretty">
          An app only carries the services it uses. The most-used ship first.
        </p>

        <ul className="mt-8 flex flex-col gap-2">
          {SERVICES.map((service) => (
            <li
              key={service.name}
              className="border-fd-border bg-fd-card flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3"
            >
              <span className="w-36 text-sm font-medium">{service.name}</span>
              <code className="text-fd-muted-foreground flex-1 font-mono text-xs">
                {service.entry}
              </code>
              <span
                className={
                  service.ready
                    ? 'text-fd-primary text-xs font-medium'
                    : 'text-fd-muted-foreground text-xs'
                }
              >
                {service.ready ? 'Available' : 'Coming soon'}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Close */}
      <Section className="border-t py-16 text-center sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Sign a user in, in about five lines
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/getting-started"
            className="bg-fd-primary text-fd-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <a
            href={npmUrl}
            rel="noreferrer noopener"
            className="border-fd-border hover:bg-fd-accent rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
          >
            View on npm ↗
          </a>
        </div>
      </Section>
    </main>
  );
}
