'use client';

import {
  useAnonymousSignIn,
  useCustomTokenSignIn,
  useEmailLinkSignIn,
  useLogin,
  useLogout,
  useOAuthSignIn,
  useSignup,
} from '@timonwa/firebase-hooks/auth';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { Button, DemoCard, Field, ResultView } from '@/components/demo-card';
import { useFirebase } from '@/components/firebase-provider';
import { NeedsConfig } from '@/components/needs-config';

export default function SignInPage() {
  const { auth, ready, config } = useFirebase();
  if (ready && !config) return <NeedsConfig />;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Signing in and out</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Each card is one hook. The panel under each action is the literal result it
          resolved to.
        </p>
      </header>

      <LoginDemo auth={auth} />
      <SignupDemo auth={auth} />
      <OAuthDemo auth={auth} />
      <EmailLinkDemo auth={auth} />
      <AnonymousDemo auth={auth} />
      <CustomTokenDemo auth={auth} />
      <LogoutDemo auth={auth} />
    </div>
  );
}

type WithAuth = { auth: Parameters<typeof useLogin>[0] };

function LoginDemo({ auth }: WithAuth) {
  const { login, loading, error } = useLogin(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard hook="useLogin" summary="Email and password sign-in.">
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
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function SignupDemo({ auth }: WithAuth) {
  const { signup, loading, error } = useSignup(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useSignup"
      summary="Creates the account, sets the profile, and sends the verification email."
    >
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
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function OAuthDemo({ auth }: WithAuth) {
  const { signIn, loading, error } = useOAuthSignIn(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useOAuthSignIn"
      summary="Any provider, popup or redirect. A pending redirect is completed on mount, so this same card handles the return trip."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={loading}
          onClick={async () => setResult(await signIn(new GoogleAuthProvider()))}
        >
          Google (popup)
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={async () => setResult(await signIn(new GithubAuthProvider()))}
        >
          GitHub (popup)
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
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function EmailLinkDemo({ auth }: WithAuth) {
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
    <DemoCard
      hook="useEmailLinkSignIn"
      summary="Sends the magic link. Clicking it lands on /auth/callback, which completes the sign-in."
    >
      <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button disabled={loading} onClick={async () => setResult(await sendLink(email))}>
        {loading ? 'Sending…' : 'Send sign-in link'}
      </Button>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function AnonymousDemo({ auth }: WithAuth) {
  const { signIn, loading, error } = useAnonymousSignIn(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useAnonymousSignIn"
      summary="Guest session. Upgrade it later on the Account page with useLinkProvider."
    >
      <Button disabled={loading} onClick={async () => setResult(await signIn())}>
        {loading ? 'Signing in…' : 'Continue as guest'}
      </Button>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function CustomTokenDemo({ auth }: WithAuth) {
  const { signIn, loading, error } = useCustomTokenSignIn(auth);
  const [token, setToken] = useState('');
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useCustomTokenSignIn"
      summary="For a token your own server minted with the Admin SDK. Paste one to try it."
    >
      <Field
        label="Custom token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <Button disabled={loading} onClick={async () => setResult(await signIn(token))}>
        {loading ? 'Signing in…' : 'Sign in with token'}
      </Button>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}

function LogoutDemo({ auth }: WithAuth) {
  const { logout, loading, error } = useLogout(auth);
  const [result, setResult] = useState<unknown>();

  return (
    <DemoCard
      hook="useLogout"
      summary="onBeforeSignOut runs first, so a failed server teardown leaves the user signed in."
    >
      <Button
        variant="secondary"
        disabled={loading}
        onClick={async () => setResult(await logout())}
      >
        {loading ? 'Signing out…' : 'Sign out'}
      </Button>
      <ResultView result={result} error={error} />
    </DemoCard>
  );
}
