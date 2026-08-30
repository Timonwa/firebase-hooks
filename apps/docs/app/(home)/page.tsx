import {
  ArrowRight,
  CircleAlert,
  Fingerprint,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  PackageOpen,
  SlidersHorizontal,
  UserCog,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CodeSample } from '@/components/code-sample';
import { CopyButton } from '@/components/copy-button';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { npmUrl, packageName, packageVersion } from '@/lib/shared';

export const metadata: Metadata = buildMetadata({
  // No `title` key: the home page keeps the root layout's default title rather
  // than having the template append the package name a second time.
  description:
    'Typed React hooks for every Firebase Auth flow — email/password, OAuth, magic link, phone and anonymous sign-in, plus password, email, profile and provider linking. Zero dependencies.',
  path: '/',
});

const INSTALL_COMMAND = `pnpm add ${packageName} firebase`;

const FEATURES = [
  {
    icon: Workflow,
    title: 'Whole flows, not single calls',
    body: 'usePhoneSignIn builds and tears down the reCAPTCHA verifier. useOAuthSignIn finishes a redirect when the page returns. useEmailLinkSignIn asks for the address instead of calling window.prompt.',
  },
  {
    icon: CircleAlert,
    title: 'Failures are values',
    body: 'Actions never throw. A failure carries Firebase’s own code and the untouched original error, so you branch on a result instead of wrapping every call in try/catch.',
  },
  {
    icon: KeyRound,
    title: 'Server sessions built in',
    body: 'onIdToken hands you a fresh ID token as part of the sign-in, not after it. Throw inside it and the sign-in aborts — so nobody reaches a protected page without a server session.',
  },
  {
    icon: PackageOpen,
    title: 'Nothing withheld',
    body: 'Sign-ins hand back Firebase’s raw UserCredential. Error messages stay exactly as Firebase wrote them unless you opt into formatting.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configure once, override anywhere',
    body: 'Session callbacks, action-code settings and error wording live on the provider. Any hook can override them, or opt out entirely with null.',
  },
  {
    icon: Fingerprint,
    title: 'Reauthentication handled',
    body: 'Pass currentPassword to a sensitive operation and the recent-sign-in check happens first. Omit it, and auth/requires-recent-login reaches you to handle your own way.',
  },
];

const GROUPS = [
  {
    label: 'Signing in and out',
    icon: LogIn,
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
    icon: Lock,
    hooks: ['useSendPasswordResetEmail', 'useConfirmPasswordReset', 'useUpdatePassword'],
  },
  {
    label: 'Email',
    icon: Mail,
    hooks: ['useSendEmailVerification', 'useVerifyEmail', 'useUpdateEmail'],
  },
  {
    label: 'Account and linking',
    icon: UserCog,
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

// Kept under ~56 columns so it fits a half-width column without scrolling.
const BEFORE = `const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function login(email: string, password: string) {
  setLoading(true);
  setError(null);
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const idToken = await cred.user.getIdToken();
    await createSession(idToken);
    return cred;
  } catch (e) {
    setError(toMessage(e));
  } finally {
    setLoading(false);
  }
}`;

const AFTER = `const { login, loading, error } = useLogin(auth, {
  onIdToken: (idToken) => createSession(idToken),
});

const result = await login(email, password);
if (result.success) router.push("/dashboard");`;

function toSlug(hook: string) {
  return hook.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

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

function SectionHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="text-fd-muted-foreground mt-3 text-pretty">{lead}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <div className="relative isolate overflow-hidden">
        <div aria-hidden className="dot-grid absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="bg-fd-primary/15 absolute -top-40 left-1/2 -z-10 h-80 w-[46rem] -translate-x-1/2 rounded-full blur-3xl"
        />

        <Section className="pt-20 pb-20 sm:pt-28">
          <div className="flex flex-col items-start gap-6">
            <span className="surface text-fd-muted-foreground inline-flex items-center gap-2 px-3 py-1 text-xs font-medium">
              <span className="bg-fd-primary size-1.5 rounded-full" />v{packageVersion} ·
              Auth available · Firestore next
            </span>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Typed React hooks for Firebase,{' '}
              <span className="text-fd-primary">one hook per flow</span>
            </h1>

            <p className="text-fd-muted-foreground max-w-2xl text-lg text-pretty">
              Each hook runs a whole flow end to end and holds its own loading, error and
              success state. Zero dependencies — <code>firebase</code> and{' '}
              <code>react</code> stay peers.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/docs/getting-started"
                className="bg-fd-primary text-fd-primary-foreground group inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Get started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs/auth"
                className="hover:bg-fd-accent surface px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Browse the hooks
              </Link>
              <div className="surface text-fd-muted-foreground flex items-center gap-3 py-2.5 pr-3 pl-4 font-mono text-sm">
                <code>
                  <span className="text-fd-primary select-none">$ </span>
                  {INSTALL_COMMAND}
                </code>
                <CopyButton value={INSTALL_COMMAND} label="Copy install command" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Before / after */}
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="The same sign-in, twice"
          lead="Email and password, with a server session minted from the ID token and errors surfaced to the UI."
        />

        {/* CodeBlock brings its own frame and copy button, so these columns add
            only the label above and the note below — no second border. */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="text-fd-muted-foreground mb-2 flex items-baseline justify-between text-xs font-medium">
              <span>Firebase directly</span>
              <span className="font-mono">21 lines</span>
            </div>
            <CodeSample code={BEFORE} className="my-0" wrap />
          </div>

          <div className="min-w-0">
            <div className="text-fd-primary mb-2 flex items-baseline justify-between text-xs font-medium">
              <span>With useLogin</span>
              <span className="font-mono">6 lines</span>
            </div>
            <CodeSample
              code={AFTER}
              className="ring-fd-primary/25 my-0 shadow-lg ring-1"
              wrap
            />
            <p className="text-fd-muted-foreground mt-3 text-sm text-pretty">
              And it does more: if <code>createSession</code> throws, the sign-in aborts
              rather than leaving a signed-in user with no server session.
            </p>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="What you get"
          lead="Six decisions that shape every hook in the package."
        />

        {/* One hairline grid rather than six outlined cards, so the icons stay the
            only accent in the section. */}
        <div className="border-fd-border mt-10 overflow-hidden rounded-xl border">
          {/* The grid is pulled 1px past the container so the last column's and
              last row's borders land under the container's own border and get
              clipped — otherwise the rounded corners sit on straight cell borders
              and read as open edges. */}
          <div className="-mr-px -mb-px grid sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group border-fd-border relative flex flex-col border-r border-b p-6"
              >
                <span
                  aria-hidden
                  className="bg-fd-primary absolute top-0 left-0 h-px w-0 transition-[width] duration-300 group-hover:w-full"
                />
                <span className="icon-tile mb-4 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <Icon className="size-4.5" strokeWidth={1.75} />
                </span>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-fd-muted-foreground text-sm text-pretty">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Breadth */}
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Twenty hooks, one contract"
          lead="Every Firebase Auth client flow, each following the same shape — so learning one is learning the rest."
        />

        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {GROUPS.map(({ label, icon: Icon, hooks }) => (
            <div key={label}>
              <h3 className="mb-4 flex items-center gap-2.5">
                <span className="icon-tile size-7 rounded-lg">
                  <Icon className="size-3.5" strokeWidth={2} />
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase">
                  {label}
                </span>
                <span className="text-fd-muted-foreground/60 font-mono text-xs">
                  {hooks.length}
                </span>
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {hooks.map((hook) => (
                  <li key={hook}>
                    <Link
                      href={`/docs/auth/${toSlug(hook)}`}
                      className="border-fd-border hover:border-fd-primary/40 hover:bg-fd-primary/5 inline-block rounded-md border px-2.5 py-1 font-mono text-xs transition-colors"
                    >
                      {/* Colouring the shared prefix carries the accent through
                          twenty otherwise-grey chips, and shows the naming
                          pattern at a glance. */}
                      <span className="text-fd-primary/70">use</span>
                      <span className="text-fd-foreground/80">{hook.slice(3)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="One import per service"
          lead="An app only carries the services it uses. The most-used ship first."
        />

        <ul className="mt-10 flex flex-col">
          {SERVICES.map((service) => (
            <li
              key={service.name}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b py-3.5 last:border-b-0"
            >
              <span
                aria-hidden
                className={`size-1.5 shrink-0 rounded-full ${
                  service.ready ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              <span className="w-32 text-sm font-medium">{service.name}</span>
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
      <Section className="pt-8 pb-24 sm:pb-32">
        <div className="surface-raised relative isolate overflow-hidden px-6 py-14 text-center">
          <div
            aria-hidden
            className="bg-fd-primary/10 absolute -bottom-24 left-1/2 -z-10 h-48 w-[32rem] -translate-x-1/2 rounded-full blur-3xl"
          />
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Sign a user in, in about five lines
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs/getting-started"
              className="bg-fd-primary text-fd-primary-foreground group inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={npmUrl}
              rel="noreferrer noopener"
              className="hover:bg-fd-accent rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
            >
              View on npm ↗
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
