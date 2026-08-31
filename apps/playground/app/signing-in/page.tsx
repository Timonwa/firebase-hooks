'use client';

import {
  useAnonymousSignIn,
  useCustomTokenSignIn,
  useEmailLinkSignIn,
  useLogin,
  useLogout,
  useOAuthSignIn,
  usePhoneSignIn,
  useSignup,
} from '@timonwa/firebase-hooks/auth';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { Button, Field } from '@/components/controls';
import { useFirebase } from '@/components/firebase-provider';
import { HookSection } from '@/components/hook-section';
import { NeedsConfig } from '@/components/needs-config';
import { PageIntro } from '@/components/page-intro';

export default function SigningInPage() {
  const { auth, config } = useFirebase();
  if (!config) return <NeedsConfig />;

  return (
    <>
      <PageIntro
        title="Signing in and out"
        lead="Getting someone into the app, and back out. Start with useSignup — a new project has no accounts, so everything else here needs one first."
      />
      <Signup auth={auth} />
      <Login auth={auth} />
      <Logout auth={auth} />
      <OAuth auth={auth} />
      <EmailLink auth={auth} />
      <Phone auth={auth} />
      <Anonymous auth={auth} />
      <CustomToken auth={auth} />
    </>
  );
}

type WithAuth = { auth: Parameters<typeof useLogin>[0] };

function Login({ auth }: WithAuth) {
  const { login, loading, error } = useLogin(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useLogin"
      why={
        <>
          By hand this is <code>useState</code> for loading and error, <code>try</code>/
          <code>catch</code>/<code>finally</code>, and the token exchange. The part that
          matters is that <code>onIdToken</code> runs <em>inside</em> the flow — throw in
          it and the sign-in aborts, so a user can't land on a protected page without a
          server session.
        </>
      }
      snippet={`const { login, loading, error } = useLogin(auth, {
  onIdToken: (idToken) => createSession(idToken),
});

const result = await login(email, password);
if (result.success) router.push("/dashboard");`}
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () => setResult(await login(email, password))}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Signup({ auth }: WithAuth) {
  const { signup, loading, error } = useSignup(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useSignup"
      why={
        <>
          Three Firebase calls in the right order — create the account, set the profile,
          send the verification email — behind one call. Set{' '}
          <code>sendVerificationEmail: false</code> if you'd rather send it yourself.
        </>
      }
      snippet={`const { signup } = useSignup(auth, { onIdToken: createSession });

await signup(email, password, { displayName });`}
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Field
            label="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button
            disabled={loading}
            onClick={async () =>
              setResult(
                await signup(email, password, displayName ? { displayName } : undefined),
              )
            }
          >
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Logout({ auth }: WithAuth) {
  const { logout, loading, error } = useLogout(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useLogout"
      why={
        <>
          <code>onBeforeSignOut</code> runs <strong>first</strong>. If clearing your
          server session fails, the Firebase session is left intact and the user can retry
          — rather than being stranded signed-out locally but still live on your server.
        </>
      }
      snippet={`const { logout } = useLogout(auth, {
  onBeforeSignOut: () => clearSession(),
});`}
      form={
        <Button
          variant="secondary"
          disabled={loading}
          onClick={async () => setResult(await logout())}
        >
          {loading ? 'Signing out…' : 'Sign out'}
        </Button>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function OAuth({ auth }: WithAuth) {
  const { signIn, loading, error } = useOAuthSignIn(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useOAuthSignIn"
      why={
        <>
          One hook covers both halves of a redirect. It calls{' '}
          <code>getRedirectResult</code> on mount and runs the same <code>onIdToken</code>
          , so you don't write a second handler on the page the user comes back to.
        </>
      }
      snippet={`const { signIn } = useOAuthSignIn(auth, { onIdToken: createSession });

await signIn(new GoogleAuthProvider());
await signIn(new GoogleAuthProvider(), { method: "redirect" });`}
      form={
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={loading}
            onClick={async () => setResult(await signIn(new GoogleAuthProvider()))}
          >
            Google
          </Button>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={async () => setResult(await signIn(new GithubAuthProvider()))}
          >
            GitHub
          </Button>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={async () =>
              setResult(await signIn(new GoogleAuthProvider(), { method: 'redirect' }))
            }
          >
            Google (redirect)
          </Button>
        </div>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function EmailLink({ auth }: WithAuth) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<unknown>();
  const { sendLink, loading, error } = useEmailLinkSignIn(auth, {
    actionCodeSettings: {
      url:
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : 'http://localhost:3000/auth/callback',
      handleCodeInApp: true,
    },
  });

  return (
    <HookSection
      hook="useEmailLinkSignIn"
      why={
        <>
          Firebase's own guide tells you to call <code>window.prompt</code> when the link
          is opened on another device. This reports <code>needsEmail</code> instead, so
          you render your own input. Try it at{' '}
          <a className="underline underline-offset-4" href="/auth/callback">
            /auth/callback
          </a>
          .
        </>
      }
      snippet={`await sendLink(email);

// on the callback page
const result = await completeSignIn(window.location.href);
if (!result.success && result.needsEmail) showEmailField();`}
      form={
        <>
          <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button
            disabled={loading}
            onClick={async () => setResult(await sendLink(email))}
          >
            {loading ? 'Sending…' : 'Send sign-in link'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Phone({ auth }: WithAuth) {
  const { sendCode, confirmCode, codeSent, loading, error } = usePhoneSignIn(auth, {
    recaptchaSize: 'normal',
  });
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="usePhoneSignIn"
      why={
        <>
          The <code>RecaptchaVerifier</code> is built and torn down for you — you supply
          an empty container and nothing else. Any real number works and gets a real SMS;
          a <strong>test number</strong> registered in the console verifies with a code
          you pick instead, which is easier to repeat.
        </>
      }
      snippet={`const { sendCode, confirmCode, codeSent } = usePhoneSignIn(auth);

<div id="recaptcha-container" />;
await sendCode("+2348012345678", "recaptcha-container");
await confirmCode(smsCode);`}
      form={
        <>
          <Field
            label="Phone number (E.164)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div id="recaptcha-container" />
          <Button
            disabled={loading}
            onClick={async () => setResult(await sendCode(phone, 'recaptcha-container'))}
          >
            {loading ? 'Sending…' : 'Send code'}
          </Button>
          {codeSent ? (
            <>
              <Field
                label="SMS code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                disabled={loading}
                onClick={async () => setResult(await confirmCode(code))}
              >
                Confirm code
              </Button>
            </>
          ) : null}
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function Anonymous({ auth }: WithAuth) {
  const { signIn, loading, error } = useAnonymousSignIn(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useAnonymousSignIn"
      why={
        <>
          A guest session you can upgrade later with <code>useLinkProvider</code> — the
          uid survives, so everything they created while anonymous still belongs to them.
        </>
      }
      snippet={`const { signIn } = useAnonymousSignIn(auth);

await signIn();`}
      form={
        <Button disabled={loading} onClick={async () => setResult(await signIn())}>
          {loading ? 'Signing in…' : 'Continue as guest'}
        </Button>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}

function CustomToken({ auth }: WithAuth) {
  const { signIn, loading, error } = useCustomTokenSignIn(auth);
  const [token, setToken] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <HookSection
      hook="useCustomTokenSignIn"
      why="Bridges an existing auth system into Firebase — your server mints a token with the Admin SDK, this exchanges it for a Firebase session."
      snippet={`const { token } = await fetch("/api/firebase-token").then((r) => r.json());
await signIn(token);`}
      form={
        <>
          <Field
            label="Custom token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button disabled={loading} onClick={async () => setResult(await signIn(token))}>
            {loading ? 'Signing in…' : 'Sign in with token'}
          </Button>
        </>
      }
      result={result}
      error={error}
      loading={loading}
    />
  );
}
